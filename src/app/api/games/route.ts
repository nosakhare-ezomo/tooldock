import { db, ensureDb } from "@/db";
import { games, questions, players } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const SAMPLE_QUIZZES = [
  {
    title: "General Knowledge",
    questions: [
      { questionText: "What is the capital of France?", option1: "London", option2: "Berlin", option3: "Paris", option4: "Madrid", correctOption: 3, timeLimit: 15 },
      { questionText: "Which planet is known as the Red Planet?", option1: "Venus", option2: "Mars", option3: "Jupiter", option4: "Saturn", correctOption: 2, timeLimit: 15 },
      { questionText: "What is the largest ocean on Earth?", option1: "Atlantic", option2: "Indian", option3: "Arctic", option4: "Pacific", correctOption: 4, timeLimit: 15 },
      { questionText: "Who painted the Mona Lisa?", option1: "Van Gogh", option2: "Picasso", option3: "Da Vinci", option4: "Rembrandt", correctOption: 3, timeLimit: 15 },
      { questionText: "What is the chemical symbol for gold?", option1: "Go", option2: "Au", option3: "Ag", option4: "Gd", correctOption: 2, timeLimit: 15 },
      { questionText: "How many continents are there?", option1: "5", option2: "6", option3: "7", option4: "8", correctOption: 3, timeLimit: 15 },
      { questionText: "What is the fastest land animal?", option1: "Lion", option2: "Cheetah", option3: "Horse", option4: "Gazelle", correctOption: 2, timeLimit: 15 },
      { questionText: "Which element has the atomic number 1?", option1: "Helium", option2: "Oxygen", option3: "Carbon", option4: "Hydrogen", correctOption: 4, timeLimit: 15 },
    ],
  },
  {
    title: "Science & Nature",
    questions: [
      { questionText: "What gas do plants absorb from the atmosphere?", option1: "Oxygen", option2: "Nitrogen", option3: "Carbon Dioxide", option4: "Hydrogen", correctOption: 3, timeLimit: 15 },
      { questionText: "What is the hardest natural substance?", option1: "Gold", option2: "Iron", option3: "Diamond", option4: "Platinum", correctOption: 3, timeLimit: 15 },
      { questionText: "How many bones are in the adult human body?", option1: "186", option2: "206", option3: "226", option4: "246", correctOption: 2, timeLimit: 15 },
      { questionText: "What is the speed of light approximately?", option1: "300,000 km/s", option2: "150,000 km/s", option3: "500,000 km/s", option4: "1,000,000 km/s", correctOption: 1, timeLimit: 15 },
      { questionText: "Which organ in the human body is the largest?", option1: "Heart", option2: "Liver", option3: "Brain", option4: "Skin", correctOption: 4, timeLimit: 15 },
    ],
  },
  {
    title: "Pop Culture",
    questions: [
      { questionText: "What year was the first iPhone released?", option1: "2005", option2: "2006", option3: "2007", option4: "2008", correctOption: 3, timeLimit: 15 },
      { questionText: "Who directed the movie 'Inception'?", option1: "Steven Spielberg", option2: "Christopher Nolan", option3: "James Cameron", option4: "Ridley Scott", correctOption: 2, timeLimit: 15 },
      { questionText: "What is the name of Harry Potter's owl?", option1: "Hedwig", option2: "Errol", option3: "Pigwidgeon", option4: "Fawkes", correctOption: 1, timeLimit: 15 },
      { questionText: "Which band performed 'Bohemian Rhapsody'?", option1: "The Beatles", option2: "Led Zeppelin", option3: "Queen", option4: "Pink Floyd", correctOption: 3, timeLimit: 15 },
      { questionText: "What is the highest-grossing film of all time?", option1: "Avengers: Endgame", option2: "Avatar", option3: "Titanic", option4: "Star Wars: The Force Awakens", correctOption: 2, timeLimit: 15 },
    ],
  },
];

export async function POST(request: Request) {
  try {
    await ensureDb();
    const body = await request.json();
    const quizIndex = body?.quizIndex ?? 0;
    const customQuizId = body?.quizId;

    let quizTitle = "";
    let questionValues: any[] = [];

    if (customQuizId) {
      const { quizzes, quizQuestions } = await import("@/db/schema");
      const { asc } = await import("drizzle-orm");
      const [customQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, customQuizId));
      if (!customQuiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      
      const customQuestions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, customQuizId)).orderBy(asc(quizQuestions.questionIndex));
      
      quizTitle = customQuiz.title;
      questionValues = customQuestions;
    } else {
      const sample = SAMPLE_QUIZZES[quizIndex] ?? SAMPLE_QUIZZES[0];
      quizTitle = sample.title;
      questionValues = sample.questions;
    }

    let pin = generatePin();
    let existing = await db.select().from(games).where(eq(games.pin, pin));
    while (existing.length > 0) {
      pin = generatePin();
      existing = await db.select().from(games).where(eq(games.pin, pin));
    }

    const hostToken = randomUUID();

    const [game] = await db.insert(games).values({
      pin,
      status: "lobby",
      currentQuestionIndex: 0,
      questionCount: questionValues.length,
      hostToken,
      quizId: customQuizId || null,
    }).returning();

    // Insert questions
    const formattedQuestions = questionValues.map((q, i) => ({
      gameId: game.id,
      questionIndex: i,
      questionText: q.questionText,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correctOption: q.correctOption,
      timeLimit: q.timeLimit,
      imageUrl: q.imageUrl || null,
    }));

    await db.insert(questions).values(formattedQuestions);

    return NextResponse.json({
      gameId: game.id,
      pin: game.pin,
      hostToken: game.hostToken,
      questionCount: questionValues.length,
      quizTitle: quizTitle,
    });
  } catch (error: any) {
    console.error("Failed to create game:", error);
    return NextResponse.json({ 
      error: "Failed to create game", 
      details: error?.message || String(error),
      cause: error?.cause?.message || String(error?.cause),
      urlLen: process.env.TURSO_DATABASE_URL?.length,
      tokenLen: process.env.TURSO_AUTH_TOKEN?.length
    }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDb();
    const allGames = await db.select({
      id: games.id,
      pin: games.pin,
      status: games.status,
      createdAt: games.createdAt,
    }).from(games).orderBy(desc(games.createdAt)).limit(20);

    return NextResponse.json({ games: allGames });
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
