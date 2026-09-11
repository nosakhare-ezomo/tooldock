import { db, ensureDb } from "@/db";
import { games, questions, players, answers } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;
  try {
    await ensureDb();
    const [game] = await db.select().from(games).where(eq(games.pin, pin));
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gamePlayers = await db.select({
      id: players.id,
      nickname: players.nickname,
      avatar: players.avatar,
      score: players.score,
      lastCorrect: players.lastCorrect,
      lastPoints: players.lastPoints,
      streak: players.streak,
      powerUp: players.powerUp,
      isFrozen: players.isFrozen,
      lastEmote: players.lastEmote,
      lastEmoteTime: players.lastEmoteTime,
    }).from(players).where(eq(players.gameId, game.id)).orderBy(desc(players.score));

    let currentQuestion = null;
    let answerCounts = null;

    if (game.status === "question" || game.status === "results") {
      const [q] = await db.select().from(questions).where(
        and(eq(questions.gameId, game.id), eq(questions.questionIndex, game.currentQuestionIndex))
      );
      if (q) {
        currentQuestion = {
          id: q.id,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          timeLimit: q.timeLimit,
          questionStartedAt: q.questionStartedAt,
          imageUrl: q.imageUrl,
          // Only include correct option in results phase
          ...(game.status === "results" ? { correctOption: q.correctOption } : {}),
        };

        if (game.status === "results" || game.status === "question") {
          // Get answer distribution
          const counts = await db.select({
            selectedOption: answers.selectedOption,
            count: sql<number>`count(*)`,
          }).from(answers).where(eq(answers.questionId, q.id)).groupBy(answers.selectedOption);
          answerCounts = counts.reduce((acc: Record<number, number>, c: { selectedOption: number; count: number }) => {
            acc[c.selectedOption] = c.count;
            return acc;
          }, {});
        }
      }
    }

    // Get quiz title if available
    let quizTitle = "";
    if (game.quizId) {
      try {
        const { quizzes } = await import("@/db/schema");
        const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, game.quizId));
        if (quiz) quizTitle = quiz.title;
      } catch (e) {
        // quiz table might not exist yet
      }
    }

    return NextResponse.json({
      game: {
        id: game.id,
        pin: game.pin,
        status: game.status,
        currentQuestionIndex: game.currentQuestionIndex,
        questionCount: game.questionCount,
        quizTitle,
      },
      players: gamePlayers,
      currentQuestion,
      answerCounts,
    });
  } catch (error) {
    console.error("Failed to get game state:", error);
    return NextResponse.json({ error: "Failed to get game state" }, { status: 500 });
  }
}
