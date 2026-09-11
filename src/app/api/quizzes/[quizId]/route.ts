import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizzes, quizQuestions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { ensureDb } from "@/db";

export async function GET(request: Request, context: { params: Promise<{ quizId: string }> }) {
  try {
    await ensureDb();
    const params = await context.params;
    const quizId = parseInt(params.quizId);

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = await db.select().from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.questionIndex));

    return NextResponse.json({ ...quiz, questions });
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ quizId: string }> }) {
  try {
    await ensureDb();
    const params = await context.params;
    const quizId = parseInt(params.quizId);
    const body = await request.json();
    const { title, author, questions } = body;

    // Update Quiz
    if (title || author) {
      await db.update(quizzes).set({
        ...(title && { title }),
        ...(author && { author }),
      }).where(eq(quizzes.id, quizId));
    }

    // Update Questions (replace all for simplicity)
    if (questions && Array.isArray(questions)) {
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
      if (questions.length > 0) {
        await db.insert(quizQuestions).values(
          questions.map((q, i) => ({
            quizId,
            questionIndex: i,
            questionText: q.questionText,
            option1: q.option1,
            option2: q.option2,
            option3: q.option3,
            option4: q.option4,
            correctOption: q.correctOption,
            timeLimit: q.timeLimit || 15,
            imageUrl: q.imageUrl || null,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ quizId: string }> }) {
  try {
    await ensureDb();
    const params = await context.params;
    const quizId = parseInt(params.quizId);
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
