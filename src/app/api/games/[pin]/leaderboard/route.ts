import { db, ensureDb } from "@/db";
import { games, players } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

    const leaderboard = await db.select({
      id: players.id,
      nickname: players.nickname,
      score: players.score,
      lastCorrect: players.lastCorrect,
      lastPoints: players.lastPoints,
      streak: players.streak,
    }).from(players).where(eq(players.gameId, game.id)).orderBy(desc(players.score));

    return NextResponse.json({ leaderboard, gameStatus: game.status, questionCount: game.questionCount, currentQuestionIndex: game.currentQuestionIndex });
  } catch (error) {
    console.error("Failed to get leaderboard:", error);
    return NextResponse.json({ error: "Failed to get leaderboard" }, { status: 500 });
  }
}
