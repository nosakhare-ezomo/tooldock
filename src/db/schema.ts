import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull().default("Anonymous"),
  authorId: text("author_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  questionIndex: integer("question_index").notNull().default(0),
  questionText: text("question_text").notNull(),
  option1: text("option_1").notNull(),
  option2: text("option_2").notNull(),
  option3: text("option_3").notNull(),
  option4: text("option_4").notNull(),
  correctOption: integer("correct_option").notNull(), // 1, 2, 3, or 4
  timeLimit: integer("time_limit").notNull().default(15), // seconds
  imageUrl: text("image_url"),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pin: text("pin").notNull().unique(),
  status: text("status").notNull().default("lobby"), // lobby, question, results, leaderboard, finished
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  questionCount: integer("question_count").notNull().default(0),
  hostToken: text("host_token").notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id), // Can be null for quick games
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  questionIndex: integer("question_index").notNull().default(0),
  questionText: text("question_text").notNull(),
  option1: text("option_1").notNull(),
  option2: text("option_2").notNull(),
  option3: text("option_3").notNull(),
  option4: text("option_4").notNull(),
  correctOption: integer("correct_option").notNull(), // 1, 2, 3, or 4
  timeLimit: integer("time_limit").notNull().default(15), // seconds
  imageUrl: text("image_url"),
  questionStartedAt: integer("question_started_at", { mode: "timestamp" }),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  nickname: text("nickname").notNull(),
  avatar: text("avatar").notNull().default("🦊"),
  score: integer("score").notNull().default(0),
  lastCorrect: integer("last_correct", { mode: "boolean" }),
  lastPoints: integer("last_points").default(0),
  streak: integer("streak").notNull().default(0),
  powerUp: text("power_up"), // e.g., "2x", "freeze"
  isFrozen: integer("is_frozen", { mode: "boolean" }).notNull().default(false),
  lastEmote: text("last_emote"),
  lastEmoteTime: integer("last_emote_time"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const answers = sqliteTable("answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerId: integer("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedOption: integer("selected_option").notNull(), // 1, 2, 3, or 4
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  answerTimeMs: integer("answer_time_ms"), // how fast they answered
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});
