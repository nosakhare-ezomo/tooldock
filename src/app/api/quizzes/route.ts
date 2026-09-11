import { NextResponse } from "next/server";
import { db, ensureDb } from "@/db";
import { quizzes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    let query = db.select().from(quizzes);
    if (authorId) {
      query = query.where(eq(quizzes.authorId, authorId)) as any;
    }
    
    const allQuizzes = await query.orderBy(desc(quizzes.createdAt));
    return NextResponse.json({ quizzes: allQuizzes });
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return NextResponse.json({ quizzes: [] });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    let title = "Untitled Quiz";
    let author = "Anonymous";
    let authorId = null;

    try {
      const body = await request.json();
      if (body?.title) title = body.title;
      if (body?.author) author = body.author;
      if (body?.authorId) authorId = body.authorId;
    } catch (e) {
      // Empty body is fine for blank quiz creation
    }

    const [newQuiz] = await db.insert(quizzes).values({
      title,
      author,
      authorId,
    }).returning();

    return NextResponse.json({ quizId: newQuiz.id, title: newQuiz.title });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
