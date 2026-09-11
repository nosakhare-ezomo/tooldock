"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SortMode = "newest" | "oldest" | "alpha";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  
  // AI State
  const aiParam = searchParams.get("ai");
  const [aiPrompt, setAiPrompt] = useState(aiParam || "");
  const [aiCount, setAiCount] = useState<number>(5);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    // Generate or get deviceId for "auth-less" private library
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  const fetchQuizzes = async (id: string) => {
    try {
      const res = await fetch(`/api/quizzes?authorId=${id}`);
      const data = await res.json();
      if (res.ok) {
        setQuizzes(data.quizzes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceId) {
      fetchQuizzes(deviceId);
    }
  }, [deviceId]);

  // Feature 3 & 6: Filtered + sorted quizzes
  const filteredQuizzes = useMemo(() => {
    let result = [...quizzes];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((quiz) =>
        (quiz.title || "").toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortMode) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "alpha":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
    }

    return result;
  }, [quizzes, searchQuery, sortMode]);

  const createBlankQuiz = async () => {
    if (!deviceId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/quizzes", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: deviceId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/${data.quizId}`);
      }
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  };

  // Feature 1: Delete quiz
  const deleteQuiz = async (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Feature 2: Duplicate quiz
  const duplicateQuiz = async (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deviceId) return;
    try {
      // Fetch the full quiz with questions
      const getRes = await fetch(`/api/quizzes/${quizId}`);
      if (!getRes.ok) return;
      const original = await getRes.json();

      // Create new quiz
      const createRes = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${original.title} (Copy)`,
          author: original.author,
          authorId: deviceId,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) return;

      // Copy questions to new quiz
      if (original.questions && original.questions.length > 0) {
        await fetch(`/api/quizzes/${createData.quizId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${original.title} (Copy)`,
            questions: original.questions,
          }),
        });
      }

      // Refresh the list
      if (deviceId) fetchQuizzes(deviceId);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAiQuiz = async () => {
    if (!aiPrompt.trim() || !deviceId) return;
    setGeneratingAi(true);
    setAiError("");
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-author-id": deviceId
        },
        body: JSON.stringify({ prompt: aiPrompt, questionCount: aiCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI Quiz");
      
      // Successfully generated, refresh quizzes
      setAiPrompt("");
      if (deviceId) fetchQuizzes(deviceId);
    } catch (e: any) {
      console.error(e);
      setAiError(e.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Feature 7: Skeleton card component
  const SkeletonCard = () => (
    <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="h-6 bg-slate-700/60 rounded-lg w-3/4 mb-4" />
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-slate-700/40 rounded w-1/2" />
        <div className="h-4 bg-slate-700/30 rounded w-1/3" />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6 animate-slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2 drop-shadow-lg">Arena Dashboard</h1>
          <p className="text-slate-300 text-base md:text-lg">Create, manage, and host your custom quiz experiences.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/")}
            className="w-full md:w-auto px-6 py-3 rounded-2xl glass-panel text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group shadow-xl"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Game
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Left Column: Create & AI */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <button
            onClick={createBlankQuiz}
            disabled={creating}
            className="w-full relative group overflow-hidden rounded-3xl p-[2px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900 px-8 py-10 rounded-[22px] flex flex-col items-center justify-center gap-4 transition-transform group-hover:scale-[0.98]">
              <span className="text-5xl drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">📝</span>
              <span className="text-2xl font-bold text-white tracking-wide">
                {creating ? "Creating..." : "New Blank Quiz"}
              </span>
            </div>
          </button>

          {/* AI Generator Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-pink-500/30 bg-gradient-to-b from-purple-900/20 to-slate-900/40 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl -z-10 group-hover:bg-pink-500/30 transition-all duration-700 pointer-events-none" />
            
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 drop-shadow-md">
              <span className="animate-pulse">✨</span> AI Quiz Magic
            </h2>
            <p className="text-sm text-slate-300 mb-6">Type a topic and our AI will generate a complete 5-question quiz instantly!</p>
            
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 90s Action Movies..."
                className="w-full p-4 rounded-2xl bg-slate-950/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 shadow-inner transition-all"
                disabled={generatingAi}
                onKeyDown={(e) => e.key === "Enter" && generateAiQuiz()}
              />
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">Number of Questions:</span>
                  <span className="text-pink-400 font-bold">{aiCount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={aiCount}
                  onChange={(e) => setAiCount(parseInt(e.target.value))}
                  disabled={generatingAi}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              <button
                onClick={generateAiQuiz}
                disabled={generatingAi || !aiPrompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-black text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2 mt-2"
              >
                {generatingAi ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : "Generate Quiz"}
              </button>
            </div>
            {aiError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium animate-shake text-center">{aiError}</div>}
          </div>

        </div>

        {/* Right Column: Library */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 bg-slate-900/30">
          {/* Feature 4: Quiz count badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              📚 Your Library
              {!loading && (
                <span className="text-base font-semibold bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                  {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
                </span>
              )}
            </h2>
            {/* Feature 6: Sort dropdown */}
            {!loading && quizzes.length > 0 && (
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-slate-800/80 border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-purple-500 appearance-none cursor-pointer"
              >
                <option value="newest">⏳ Newest First</option>
                <option value="oldest">⏳ Oldest First</option>
                <option value="alpha">🔤 Alphabetical</option>
              </select>
            )}
          </div>

          {/* Feature 3: Search bar */}
          {!loading && quizzes.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search quizzes by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>
          )}

          {/* Feature 7: Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : quizzes.length === 0 ? (
            /* Feature 5: Improved empty state */
            <div className="text-center py-24 rounded-2xl border-dashed border-2 border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center gap-5">
              <div className="text-8xl mb-2 animate-bounce" style={{ animationDuration: '2s' }}>🎯</div>
              <p className="text-slate-200 text-2xl font-bold">No quizzes yet — let&apos;s fix that!</p>
              <p className="text-slate-400 max-w-md">Create your first quiz from scratch or let AI generate one instantly. Your quiz library starts here.</p>
              <div className="flex gap-4 mt-4 flex-wrap justify-center">
                <button
                  onClick={createBlankQuiz}
                  disabled={creating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl font-bold text-white hover:scale-105 transition-all shadow-lg"
                >
                  📝 Create Blank Quiz
                </button>
                <button
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>('input[placeholder*="90s"]');
                    el?.focus();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-white hover:scale-105 transition-all shadow-lg"
                >
                  ✨ Try AI Generator
                </button>
              </div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border-dashed border-2 border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center gap-3">
              <span className="text-5xl opacity-60">🔍</span>
              <p className="text-slate-300 text-lg font-bold">No quizzes match &ldquo;{searchQuery}&rdquo;</p>
              <button onClick={() => setSearchQuery("")} className="text-purple-400 hover:text-purple-300 text-sm font-medium underline underline-offset-4">Clear search</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuizzes.map((q) => (
                <div 
                  key={q.id} 
                  className="group relative bg-slate-800/60 p-6 rounded-2xl border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-purple-500/20"
                  onClick={() => router.push(`/dashboard/${q.id}`)}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <h3 className="text-xl font-bold text-white mb-4 pr-20 leading-tight group-hover:text-purple-300 transition-colors">{q.title}</h3>
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-500">✍️</span> 
                      <span className="truncate">{q.author || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>📅</span> 
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Feature 1 & 2: Action buttons (delete + duplicate) */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={(e) => duplicateQuiz(q.id, e)}
                      title="Duplicate quiz"
                      className="w-9 h-9 rounded-xl bg-slate-700/80 hover:bg-blue-600 flex items-center justify-center text-sm transition-colors backdrop-blur-sm"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => deleteQuiz(q.id, e)}
                      title="Delete quiz"
                      className="w-9 h-9 rounded-xl bg-slate-700/80 hover:bg-red-600 flex items-center justify-center text-sm transition-colors backdrop-blur-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
