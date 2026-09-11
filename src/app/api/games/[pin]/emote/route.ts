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
    const { playerId, emote } = body;

    if (!playerId || !emote) {
      return NextResponse.json({ error: "playerId and emote are required" }, { status: 400 });
    }

    const [game] = await db.select().from(games).where(eq(games.pin, pin));
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (!player || player.gameId !== game.id) return NextResponse.json({ error: "Player not found in this game" }, { status: 404 });

    await db.update(players).set({
      lastEmote: emote,
      lastEmoteTime: Date.now(),
    }).where(eq(players.id, playerId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to submit emote:", error);
    return NextResponse.json({ error: "Failed to submit emote" }, { status: 500 });
  }
}
