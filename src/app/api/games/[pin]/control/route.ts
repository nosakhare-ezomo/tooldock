import { db, ensureDb } from "@/db";
import { games, questions, players } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;
  try {
    await ensureDb();
    const body = await request.json();
    const { hostToken, token, action } = body;

    const actualToken = hostToken || token;

    const [game] = await db.select().from(games).where(eq(games.pin, pin));
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.hostToken !== actualToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "start") {
      // Start the first question
      const [question] = await db.select().from(questions).where(
        and(eq(questions.gameId, game.id), eq(questions.questionIndex, 0))
      );
      if (!question) {
        return NextResponse.json({ error: "No questions found" }, { status: 400 });
      }

      // Reset player last-correct state and unfreeze
      await db.update(players).set({ lastCorrect: null, lastPoints: 0, isFrozen: false }).where(eq(players.gameId, game.id));

      await db.update(games).set({
        status: "question",
        currentQuestionIndex: 0,
      }).where(eq(games.id, game.id));

      await db.update(questions).set({
        questionStartedAt: new Date(),
      }).where(eq(questions.id, question.id));

      return NextResponse.json({ success: true, status: "question", questionIndex: 0 });
    }

    if (action === "next") {
      // Move to the next question
      const nextIndex = game.currentQuestionIndex + 1;

      const [nextQuestion] = await db.select().from(questions).where(
        and(eq(questions.gameId, game.id), eq(questions.questionIndex, nextIndex))
      );

      if (!nextQuestion) {
        // No more questions - go to final leaderboard
        await db.update(games).set({
          status: "finished",
        }).where(eq(games.id, game.id));
        return NextResponse.json({ success: true, status: "finished" });
      }

      // Reset player last-correct state and unfreeze
      await db.update(players).set({ lastCorrect: null, lastPoints: 0, isFrozen: false }).where(eq(players.gameId, game.id));

      await db.update(games).set({
        status: "question",
        currentQuestionIndex: nextIndex,
      }).where(eq(games.id, game.id));

      await db.update(questions).set({
        questionStartedAt: new Date(),
      }).where(eq(questions.id, nextQuestion.id));

      return NextResponse.json({ success: true, status: "question", questionIndex: nextIndex });
    }

    if (action === "showResults") {
      // Show results for current question
      await db.update(games).set({
        status: "results",
      }).where(eq(games.id, game.id));

      return NextResponse.json({ success: true, status: "results" });
    }

    if (action === "showLeaderboard") {
      // Show intermediate leaderboard
      await db.update(games).set({
        status: "leaderboard",
      }).where(eq(games.id, game.id));

      return NextResponse.json({ success: true, status: "leaderboard" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to control game:", error);
    return NextResponse.json({ error: "Failed to control game" }, { status: 500 });
  }
}
