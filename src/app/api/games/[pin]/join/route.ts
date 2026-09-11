import { db, ensureDb } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;
  try {
    await ensureDb();
    const body = await request.json();
    const { nickname, avatar } = body;

    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0 || nickname.length > 30) {
      return NextResponse.json({ error: "Valid nickname is required (1-30 characters)" }, { status: 400 });
    }

    const BAD_WORDS = ["fuck", "shit", "bitch", "ass", "cunt", "dick", "pussy", "whore", "slut", "bastard", "nigger", "faggot", "cum", "porn"];
    const normalizedName = nickname.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const bad of BAD_WORDS) {
      if (normalizedName.includes(bad)) {
        return NextResponse.json({ error: "Inappropriate nickname detected" }, { status: 400 });
      }
    }

    const safeAvatar = (avatar && typeof avatar === "string" && avatar.length <= 10) ? avatar : "🦊";

    const [game] = await db.select().from(games).where(eq(games.pin, pin));
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "lobby") {
      return NextResponse.json({ error: "Game has already started" }, { status: 400 });
    }

    // Check if nickname already taken
    const existing = await db.select().from(players).where(
      eq(players.gameId, game.id)
    );
    if (existing.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
      return NextResponse.json({ error: "Nickname already taken" }, { status: 409 });
    }

    const [player] = await db.insert(players).values({
      gameId: game.id,
      nickname: nickname.trim(),
      avatar: safeAvatar,
      score: 0,
      streak: 0,
    }).returning();

    return NextResponse.json({
      playerId: player.id,
      nickname: player.nickname,
      avatar: player.avatar,
      gameId: game.id,
    });
  } catch (error) {
    console.error("Failed to join game:", error);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
}
