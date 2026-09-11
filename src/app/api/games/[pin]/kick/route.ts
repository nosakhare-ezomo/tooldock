import { db, ensureDb } from "@/db";
import { games, players } from "@/db/schema";
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
    const { playerId, hostToken } = body;

    if (!playerId || !hostToken) {
      return NextResponse.json({ error: "playerId and hostToken are required" }, { status: 400 });
    }

    const [game] = await db.select().from(games).where(eq(games.pin, pin));
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    
    if (game.hostToken !== hostToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [player] = await db.select().from(players).where(
      and(eq(players.id, playerId), eq(players.gameId, game.id))
    );

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Delete the player
    await db.delete(players).where(eq(players.id, playerId));

    return NextResponse.json({ success: true, kickedPlayerId: playerId });
  } catch (error: any) {
    console.error("Failed to kick player:", error);
    return NextResponse.json({ error: "Failed to kick player" }, { status: 500 });
  }
}
