import { db, ensureDb } from "@/db";
import { games, questions, players, answers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;
  try {
    await ensureDb();
    const body = await request.json();
    const { playerId, selectedOption, usePowerUp } = body;

    if (!playerId || !selectedOption || selectedOption < 1 || selectedOption > 4) {
      return NextResponse.json({ error: "playerId and selectedOption (1-4) are required" }, { status: 400 });
    }

    const [game] = await db.select().from(games).where(eq(games.pin, pin));
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (game.status !== "question") return NextResponse.json({ error: "Game is not accepting answers" }, { status: 400 });

    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (!player || player.gameId !== game.id) return NextResponse.json({ error: "Player not found in this game" }, { status: 404 });

    const [question] = await db.select().from(questions).where(
      and(eq(questions.gameId, game.id), eq(questions.questionIndex, game.currentQuestionIndex))
    );
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    const existingAnswer = await db.select().from(answers).where(
      and(eq(answers.playerId, playerId), eq(answers.questionId, question.id))
    );
    if (existingAnswer.length > 0) return NextResponse.json({ error: "Already answered this question" }, { status: 409 });

    const isCorrect = selectedOption === question.correctOption;
    let answerTimeMs = 0;
    if (question.questionStartedAt) {
      answerTimeMs = Date.now() - new Date(question.questionStartedAt).getTime();
    }

    let points = 0;
    let newStreak = 0;
    let multiplier = 1;
    let nextPowerUp = player.powerUp;

    // Handle Power-Up Usage
    if (usePowerUp && player.powerUp) {
      if (player.powerUp === "2x") {
        multiplier = 2;
      } else if (player.powerUp === "freeze") {
        // Freeze a random other player
        const otherPlayers = await db.select().from(players).where(
          and(eq(players.gameId, game.id), sql`${players.id} != ${player.id}`)
        );
        if (otherPlayers.length > 0) {
          const target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          await db.update(players).set({ isFrozen: true }).where(eq(players.id, target.id));
        }
      }
      // Consume the power-up
      nextPowerUp = null;
    }

    if (isCorrect) {
      const timeFactor = Math.max(0, 1 - (answerTimeMs / (question.timeLimit * 1000)));
      points = Math.round((500 + 500 * timeFactor) * multiplier);
      newStreak = player.streak + 1;
      if (newStreak >= 2) points += Math.min(newStreak * 50, 500);

      // Randomly award a power-up (25% chance) if they don't have one
      if (!nextPowerUp && Math.random() < 0.25) {
        nextPowerUp = Math.random() < 0.5 ? "2x" : "freeze";
      }
    }

    await db.insert(answers).values({
      playerId,
      questionId: question.id,
      selectedOption,
      isCorrect,
      answerTimeMs,
    });

    await db.update(players).set({
      score: player.score + points,
      lastCorrect: isCorrect,
      lastPoints: points,
      streak: newStreak,
      powerUp: nextPowerUp,
    }).where(eq(players.id, playerId));

    // Auto-end question if all players have answered
    const allPlayersInGame = await db.select().from(players).where(eq(players.gameId, game.id));
    const allAnswersForQuestion = await db.select().from(answers).where(eq(answers.questionId, question.id));
    if (allPlayersInGame.length > 0 && allAnswersForQuestion.length === allPlayersInGame.length) {
      await db.update(games).set({ status: "results" }).where(eq(games.id, game.id));
    }

    return NextResponse.json({
      isCorrect,
      points,
      totalScore: player.score + points,
      streak: newStreak,
      powerUp: nextPowerUp,
    });
  } catch (error: any) {
    console.error("Failed to submit answer:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
