"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAudio } from "@/hooks/useAudio";

interface Player {
  id: number;
  nickname: string;
  avatar: string;
  score: number;
  lastEmote: string | null;
  lastEmoteTime: number | null;
  streak: number;
}

interface CurrentQuestion {
  id: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  timeLimit: number;
  questionStartedAt: string | null;
  correctOption?: number;
  imageUrl: string | null;
}

interface GameState {
  game: { id: number; pin: string; status: string; currentQuestionIndex: number; questionCount: number; quizTitle: string; };
  players: Player[];
  currentQuestion: CurrentQuestion | null;
  answerCounts: Record<number, number> | null;
}

const OPTION_COLORS = [
  "bg-[#e21b3c]", // Red
  "bg-[#1368ce]", // Blue
  "bg-[#d89e00]", // Yellow
  "bg-[#26890c]", // Green
];

const OPTION_SHAPES = ["▲", "●", "◆", "■"];

function HostContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pin = params.pin as string;
  const token = searchParams.get("token");

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { playSound, stopSound } = useAudio();
  const [activeEmotes, setActiveEmotes] = useState<{ id: string, emoji: string, x: number }[]>([]);
  const [domain, setDomain] = useState("Loading...");

  // Sound ref tracking
  const currentStatusRef = useRef<string | null>(null);

  useEffect(() => {
    setDomain(window.location.host);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${pin}?token=${token}`);
      const data = await res.json();
      if (res.ok) {
        setGameState(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [pin, token]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const [audioEnabled, setAudioEnabled] = useState(false);

  // Handle Sounds based on game status
  useEffect(() => {
    if (!gameState || !audioEnabled) return;
    const status = gameState.game.status;
    
    if (status !== currentStatusRef.current) {
      // Status changed!
      stopSound(); // stop previous looping sound
      
      if (status === "lobby") {
        playSound("lobby", true);
      } else if (status === "question") {
        playSound("countdown", true);
      } else if (status === "leaderboard") {
        // playSound("leaderboard"); // Optional
      }
      currentStatusRef.current = status;
    }
  }, [gameState?.game.status, playSound, stopSound, audioEnabled]);

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
    if (!audioEnabled && gameState?.game.status === "lobby") {
       playSound("lobby", true);
    } else {
       stopSound();
    }
  };

  // Handle Floating Emotes
  useEffect(() => {
    if (!gameState) return;
    
    const now = Date.now();
    const recentEmotes = gameState.players.filter(p => p.lastEmote && p.lastEmoteTime && (now - p.lastEmoteTime < 2000));
    
    if (recentEmotes.length > 0) {
      const newEmotes = recentEmotes.map(p => ({
        id: `${p.id}-${p.lastEmoteTime}`,
        emoji: p.lastEmote as string,
        x: Math.random() * 80 + 10 
      }));
      
      setActiveEmotes(prev => {
        const uniqueNew = newEmotes.filter(ne => !prev.find(ae => ae.id === ne.id));
        if (uniqueNew.length === 0) return prev;
        
        setTimeout(() => {
          setActiveEmotes(current => current.filter(ae => !uniqueNew.find(ne => ne.id === ae.id)));
        }, 3000);
        
        return [...prev, ...uniqueNew];
      });
    }
  }, [gameState]);

  // Timer logic for questions
  useEffect(() => {
    if (gameState?.game.status !== "question" || !gameState.currentQuestion?.questionStartedAt) {
      return;
    }

    const start = new Date(gameState.currentQuestion.questionStartedAt).getTime();
    const limitMs = gameState.currentQuestion.timeLimit * 1000;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - start;
      const remaining = Math.max(0, limitMs - elapsed);
      setTimeLeft(remaining / 1000);

      // Auto-transition to results if time runs out
      if (remaining <= 0) {
        handleControl("next"); // Move to results
      }
    };

    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [gameState?.game.status, gameState?.currentQuestion?.questionStartedAt]);

  const handleControl = async (action: string) => {
    await fetch(`/api/games/${pin}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    fetchState();
  };

  const handleKick = async (playerId: number) => {
    try {
      await fetch(`/api/games/${pin}/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, playerId }),
      });
      fetchState();
    } catch (e) {
      console.error("Failed to kick player", e);
    }
  };

  const FloatingEmotes = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[100]">
      {activeEmotes.map(emote => (
        <div
          key={emote.id}
          className="absolute bottom-0 text-5xl animate-float-up"
          style={{ left: `${emote.x}%` }}
        >
          {emote.emoji}
        </div>
      ))}
    </div>
  );

  if (!gameState) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  const { game, players, currentQuestion, answerCounts } = gameState;

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-10"></div>

      <FloatingEmotes />

      <header className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center glass-panel z-10 sticky top-0 gap-4 md:gap-0">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 w-full md:w-auto">
          <button 
            onClick={() => router.push('/')}
            className="p-3 rounded-full hover:bg-white/10 transition-colors mr-0 md:mr-2 flex-shrink-0"
            title="End game and return to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="bg-white/10 px-4 md:px-6 py-2 md:py-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Game PIN</span>
            <span className="text-2xl md:text-4xl font-black text-white tracking-widest">{game.pin}</span>
          </div>
          {game.quizTitle && (
            <div className="px-3 md:px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30 text-center max-w-[200px] md:max-w-none">
              <span className="font-bold text-purple-300 text-sm md:text-base truncate block">{game.quizTitle}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
          <button 
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${audioEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">👥</span>
            <span className="text-2xl md:text-3xl font-black">{players.length}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full max-w-6xl mx-auto overflow-hidden">
        {game.status === "lobby" && (
          <div className="w-full h-full flex flex-col pt-4 md:pt-10">
            <div className="text-center mb-6 md:mb-12 animate-slide-up">
              <h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 md:mb-4 px-2">
                Join at {domain}
              </h1>
              <p className="text-lg md:text-2xl text-slate-300">Waiting for players to join...</p>
            </div>
            
            <div className="flex-1 w-full bg-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/10 backdrop-blur-sm overflow-y-auto">
              {players.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-2xl font-bold italic">
                  No players yet...
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  {players.map((p) => (
                    <div key={p.id} className="group relative bg-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-xl animate-pop-in border border-slate-700 shadow-lg hover:scale-105 transition-transform overflow-hidden cursor-default">
                      <span>{p.avatar}</span>
                      <span>{p.nickname}</span>
                      {/* Kick Overlay */}
                      <button 
                        onClick={() => handleKick(p.id)}
                        className="absolute inset-0 bg-red-600/90 text-white font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        KICK
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => handleControl("start")}
                disabled={players.length === 0}
                className="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-black rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
              >
                START GAME
              </button>
            </div>
          </div>
        )}

        {game.status === "question" && currentQuestion && (
          <div className="w-full flex flex-col items-center animate-pop-in">
            <div className="flex justify-between w-full mb-8 items-end px-4">
              <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700 shadow-lg">
                <span className="text-xl font-bold text-slate-300">Question {game.currentQuestionIndex + 1} of {game.questionCount}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center w-24 h-24 bg-slate-900 rounded-full border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  <span className="text-5xl font-black text-white">
                    {Math.ceil(timeLeft)}
                  </span>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="48" cy="48" r="46"
                      fill="none"
                      stroke="rgba(168,85,247,0.2)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="48" cy="48" r="46"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 46}
                      strokeDashoffset={2 * Math.PI * 46 * (1 - timeLeft / currentQuestion.timeLimit)}
                      className="transition-all duration-100 ease-linear"
                    />
                  </svg>
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700 shadow-lg">
                <span className="text-xl font-bold text-slate-300">{Object.values(answerCounts || {}).reduce((a,b)=>a+b,0)} Answers</span>
              </div>
            </div>

            <div className="w-full text-center bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/20 mb-8 max-w-4xl mx-auto">
              <h2 className="text-5xl font-black leading-tight text-white">{currentQuestion.questionText}</h2>
              {currentQuestion.imageUrl && (
                <div className="mt-8 flex justify-center">
                  <img src={currentQuestion.imageUrl} alt="Question Image" className="max-h-64 rounded-xl border-4 border-white/20 shadow-xl" />
                </div>
              )}
            </div>

            <div className={`grid gap-6 w-full max-w-5xl mx-auto ${(!currentQuestion.option3 && !currentQuestion.option4) ? 'grid-cols-2 max-w-3xl' : 'grid-cols-2'}`}>
              {[
                { opt: currentQuestion.option1, idx: 1 },
                { opt: currentQuestion.option2, idx: 2 },
                { opt: currentQuestion.option3, idx: 3 },
                { opt: currentQuestion.option4, idx: 4 },
              ]
              .filter(item => !!item.opt)
              .map((item) => (
                <div
                  key={item.idx}
                  className={`${OPTION_COLORS[item.idx - 1]} p-8 rounded-2xl flex items-center gap-6 shadow-[0_8px_0_rgba(0,0,0,0.2)] transform transition-transform`}
                >
                  <div className="w-16 h-16 bg-black/20 rounded-xl flex items-center justify-center">
                    <span className="text-4xl text-white/90 filter drop-shadow-md">{OPTION_SHAPES[item.idx - 1]}</span>
                  </div>
                  <span className="text-3xl font-bold text-white filter drop-shadow-md">{item.opt}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex gap-4">
               <button
                  onClick={() => handleControl("next")}
                  className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Skip Timer
               </button>
            </div>
          </div>
        )}

        {game.status === "results" && currentQuestion && (
          <div className="w-full flex flex-col items-center animate-slide-up">
            <h2 className="text-4xl font-black mb-8">Results</h2>
            <div className={`grid gap-6 w-full mb-12 items-end h-64 border-b-2 border-slate-700 pb-2 ${(!currentQuestion.option3 && !currentQuestion.option4) ? 'grid-cols-2 max-w-2xl' : 'grid-cols-4 max-w-4xl'}`}>
              {[1, 2, 3, 4]
                .filter(idx => {
                   if (idx === 3) return !!currentQuestion.option3;
                   if (idx === 4) return !!currentQuestion.option4;
                   return true;
                })
                .map((idx) => {
                const count = answerCounts?.[idx] || 0;
                const total = Object.values(answerCounts || {}).reduce((a,b)=>a+b,0) || 1;
                const heightPercentage = Math.max((count / total) * 100, 5); // min 5% for visibility
                const isCorrect = currentQuestion.correctOption === idx;

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-3xl font-black text-slate-300 mb-2">{count}</span>
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-1000 ease-out flex items-center justify-center relative ${isCorrect ? OPTION_COLORS[idx-1] : 'bg-slate-700 opacity-50'}`}
                      style={{ height: `${heightPercentage}%` }}
                    >
                      {isCorrect && <span className="absolute -top-12 text-4xl animate-bounce">✨</span>}
                    </div>
                    {/* Shape under the bar representing x-axis label */}
                    <div className={`${OPTION_COLORS[idx-1]} w-full h-12 flex items-center justify-center rounded-b-xl shadow-inner mt-0.5`}>
                      <span className="text-3xl text-white drop-shadow-md">{OPTION_SHAPES[idx-1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => handleControl("next")}
              className="px-12 py-5 bg-blue-600 text-white rounded-full font-black text-2xl hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              Next
            </button>
          </div>
        )}

        {game.status === "leaderboard" && (
          <div className="w-full flex flex-col items-center animate-slide-up">
            <h2 className="text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Top Players</h2>
            <div className="flex flex-col gap-4 w-full max-w-2xl">
              {players
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((p, index) => (
                  <div key={p.id} className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl flex justify-between items-center border border-slate-700 shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {index + 1}
                      </div>
                      <span className="text-3xl">{p.avatar}</span>
                      <span className="text-2xl font-bold">{p.nickname}</span>
                      {p.streak > 2 && (
                        <span className="text-xl bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
                          🔥 {p.streak}
                        </span>
                      )}
                    </div>
                    <span className="text-3xl font-black text-yellow-400">{p.score}</span>
                  </div>
                ))}
            </div>
            <button
              onClick={() => handleControl("next")}
              className="mt-12 px-12 py-5 bg-blue-600 text-white rounded-full font-black text-2xl hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              Next Question
            </button>
          </div>
        )}

        {game.status === "finished" && (
          <div className="w-full flex flex-col items-center animate-slide-up">
            <h2 className="text-7xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Podium</h2>
            
            <div className="flex items-end justify-center gap-6 h-96 w-full max-w-4xl border-b-4 border-slate-700 pb-4">
              {/* 2nd Place */}
              {players.length > 1 && (
                <div className="flex flex-col items-center w-48 animate-pop-in" style={{animationDelay: "0.5s"}}>
                  <span className="text-6xl mb-4">{players[1].avatar}</span>
                  <span className="text-2xl font-bold mb-2">{players[1].nickname}</span>
                  <span className="font-black text-yellow-400 mb-4">{players[1].score}</span>
                  <div className="w-full h-48 bg-gradient-to-t from-slate-300 to-slate-400 rounded-t-xl flex justify-center pt-4 shadow-[0_0_30px_rgba(203,213,225,0.3)]">
                    <span className="text-4xl font-black text-slate-600">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {players.length > 0 && (
                <div className="flex flex-col items-center w-56 relative animate-pop-in">
                  <div className="absolute -top-16 text-6xl animate-bounce">👑</div>
                  <span className="text-7xl mb-4">{players[0].avatar}</span>
                  <span className="text-3xl font-black mb-2">{players[0].nickname}</span>
                  <span className="font-black text-2xl text-yellow-400 mb-4">{players[0].score}</span>
                  <div className="w-full h-64 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-xl flex justify-center pt-4 shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                    <span className="text-5xl font-black text-yellow-700">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {players.length > 2 && (
                <div className="flex flex-col items-center w-48 animate-pop-in" style={{animationDelay: "1s"}}>
                  <span className="text-6xl mb-4">{players[2].avatar}</span>
                  <span className="text-2xl font-bold mb-2">{players[2].nickname}</span>
                  <span className="font-black text-yellow-400 mb-4">{players[2].score}</span>
                  <div className="w-full h-32 bg-gradient-to-t from-amber-600 to-amber-700 rounded-t-xl flex justify-center pt-4 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                    <span className="text-4xl font-black text-amber-900">3</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/")}
              className="mt-16 px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-xl hover:bg-slate-700 transition"
            >
              End Game
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function HostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-4xl text-white">⏳ Loading Game...</div>}>
      <HostContent />
    </Suspense>
  );
}
