"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id?: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  timeLimit: number;
  imageUrl: string;
}

interface Quiz {
  id: number;
  title: string;
  author: string;
  questions: Question[];
}

const OPTION_COLORS = ["bg-[#e21b3c]", "bg-[#1368ce]", "bg-[#d89e00]", "bg-[#26890c]"];
const OPTION_LABELS = ["🟥", "🟦", "🟨", "🟩"];

export default function QuizEditor() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setQuiz(data);
      setTitle(data.title);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [quizId, router]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions }),
      });
      if (res.ok) {
        alert("Quiz saved!");
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    // Save first
    await handleSave();
    
    // Create a game instance from this quiz
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: parseInt(quizId) }),
      });
      const data = await res.json();
      if (data.pin) {
        router.push(`/host/${data.pin}?token=${data.hostToken}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to launch game.");
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: "New Question",
      option1: "Option 1",
      option2: "Option 2",
      option3: "Option 3",
      option4: "Option 4",
      correctOption: 1,
      timeLimit: 15,
      imageUrl: "",
    }]);
    setActiveTab(questions.length);
  };

  const updateActiveQuestion = (field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[activeTab] = { ...updated[activeTab], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setActiveTab(Math.max(0, index - 1));
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/60 hover:text-white">← Back</Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-2xl font-bold outline-none border-b border-transparent focus:border-white/20 px-2 py-1"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl font-bold transition-all">
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={handleLaunch} disabled={saving || questions.length === 0} className="bg-gradient-to-r from-[#26890c] to-[#34c759] px-6 py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
            Launch Game 🚀
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-black/20 border-r border-white/10 p-4 overflow-y-auto flex flex-col gap-2">
          {questions.map((q, i) => (
            <div
              key={i}
              onClick={() => setActiveTab(i)}
              className={`p-3 rounded-xl cursor-pointer truncate transition-all ${activeTab === i ? 'bg-white/20 border-l-4 border-[#1368ce]' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <span className="text-xs text-white/50 block mb-1">Q{i + 1}</span>
              <span className="font-semibold text-sm">{q.questionText || "Empty Question"}</span>
            </div>
          ))}
          <button onClick={addQuestion} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-sm font-bold mt-2">
            + Add Question
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {questions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/50">
              <p className="mb-4">No questions yet.</p>
              <button onClick={addQuestion} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold text-white">Add First Question</button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white/60">Question {activeTab + 1}</h2>
                <button onClick={() => deleteQuestion(activeTab)} className="text-red-400 hover:text-red-300 text-sm">🗑 Delete Question</button>
              </div>

              {/* Title & Image */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                <input
                  type="text"
                  placeholder="Start typing your question"
                  value={questions[activeTab].questionText}
                  onChange={(e) => updateActiveQuestion("questionText", e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold outline-none focus:border-[#1368ce]"
                />
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={questions[activeTab].imageUrl || ""}
                      onChange={(e) => updateActiveQuestion("imageUrl", e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[#1368ce]"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Time Limit</label>
                    <select
                      value={questions[activeTab].timeLimit}
                      onChange={(e) => updateActiveQuestion("timeLimit", parseInt(e.target.value))}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 outline-none appearance-none"
                    >
                      <option value="5">5s</option>
                      <option value="10">10s</option>
                      <option value="15">15s</option>
                      <option value="20">20s</option>
                      <option value="30">30s</option>
                      <option value="60">60s</option>
                    </select>
                  </div>
                </div>

                {questions[activeTab].imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10 max-h-64 flex items-center justify-center bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={questions[activeTab].imageUrl} alt="Preview" className="max-h-64 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((optNum) => {
                  const optKey = `option${optNum}` as keyof Question;
                  const isCorrect = questions[activeTab].correctOption === optNum;
                  return (
                    <div key={optNum} className={`${OPTION_COLORS[optNum - 1]} p-4 rounded-2xl flex items-center gap-3 relative transition-all ${isCorrect ? 'ring-4 ring-white shadow-lg scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}>
                      <span className="text-2xl">{OPTION_LABELS[optNum - 1]}</span>
                      <input
                        type="text"
                        value={questions[activeTab][optKey] as string}
                        onChange={(e) => updateActiveQuestion(optKey, e.target.value)}
                        placeholder={optNum > 2 ? `Add answer ${optNum} (Optional)` : `Add answer ${optNum} (Required)`}
                        className="flex-1 bg-black/20 text-white placeholder-white/50 font-bold text-lg px-4 py-2 rounded-xl outline-none"
                      />
                      <button
                        onClick={() => updateActiveQuestion("correctOption", optNum)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isCorrect ? 'bg-green-500 border-green-500' : 'border-white/50 hover:border-white'}`}
                        title="Mark as correct"
                      >
                        {isCorrect && "✓"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
