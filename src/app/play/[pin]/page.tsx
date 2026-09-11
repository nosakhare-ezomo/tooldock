"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAudio } from "@/hooks/useAudio";

interface Player {
  id: number;
  nickname: string;
  avatar: string;
  score: number;
  lastCorrect: boolean | null;
  lastPoints: number;
  streak: number;
  powerUp: string | null;
  isFrozen: boolean;
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
}

interface GameState {
  game: { id: number; pin: string; status: string; currentQuestionIndex: number; questionCount: number };
  players: Player[];
  currentQuestion: CurrentQuestion | null;
  answerCounts: Record<number, number> | null;
}

const OPTION_COLORS = [
  "bg-[#e21b3c] hover:bg-[#ff2d4a]",
  "bg-[#1368ce] hover:bg-[#1a7aff]",
  "bg-[#d89e00] hover:bg-[#f0b400]",
  "bg-[#26890c] hover:bg-[#30a810]",
];

const OPTION_SHAPES = ["▲", "●", "◆", "■"];

// Feature 1: Expanded Avatar Gallery - 24 emojis
const AVATARS = [
  "🦊", "🐶", "🐱", "🐼", "🦁", "🐸", "🐵", "🦄",
  "🐲", "🦈", "🦅", "🐺", "🦖", "🐙", "🦜", "🐝",
  "🍕", "🌮", "🎸", "🚀", "🤖", "🎨", "🏆", "🌟",
];

const ADJECTIVES = ["Fast", "Smart", "Brave", "Cool", "Epic", "Happy", "Lucky", "Super", "Mighty", "Cosmic"];
const NOUNS = ["Tiger", "Panda", "Dragon", "Eagle", "Shark", "Wolf", "Ninja", "Robot", "Wizard", "Racer"];

// Feature 6: Expanded Emoji Reactions - 12 emojis
const REACTION_EMOJIS = ["😂", "🔥", "😱", "🎉", "💀", "🤔", "👏", "❤️", "😎", "🤯", "🥳", "👀"];

function PlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pin = params.pin as string;
  const playerIdParam = searchParams.get("playerId");

  // ALL hooks MUST be called before any conditional returns (React rule)
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(playerIdParam ? parseInt(playerIdParam) : null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; points: number; totalScore: number; streak: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [previousStatus, setPreviousStatus] = useState<string>("");
  const [powerUpActive, setPowerUpActive] = useState(false);
  const { playSound } = useAudio();

  // Join screen state
  const [joinNickname, setJoinNickname] = useState("");
  const [joinAvatar, setJoinAvatar] = useState(AVATARS[0]);
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Feature 7: Answer feedback flash state
  const [showAnswerFlash, setShowAnswerFlash] = useState(false);

  // Feature 5: Speed bonus flash state
  const [showSpeedBonus, setShowSpeedBonus] = useState(false);

  // Feature 12: Answer lock-in animation state
  const [lockedInAnswer, setLockedInAnswer] = useState<number | null>(null);

  // Feature 4: Streak milestone celebration state
  const [streakMilestone, setStreakMilestone] = useState<string | null>(null);

  // Feature 8: Waiting dots animation
  const [waitingDots, setWaitingDots] = useState("");

  // Ref for answer time tracking (Feature 5)
  const answerTimeRef = useRef<number | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${pin}`);
      const data = await res.json();
      if (res.ok) {
        setGameState(data);
      }
    } catch (err) {
      console.error("Failed to fetch game state:", err);
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Reset answer state when question changes
  useEffect(() => {
    if (gameState) {
      if (gameState.game.status === "question" && previousStatus !== "question") {
        setSelectedAnswer(null);
        setAnswerResult(null);
        setPowerUpActive(false);
        setShowAnswerFlash(false);
        setShowSpeedBonus(false);
        setLockedInAnswer(null);
        setStreakMilestone(null);
        answerTimeRef.current = null;
      }
      setPreviousStatus(gameState.game.status);
    }
  }, [gameState?.game.status, previousStatus]);

  // Timer logic
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
    };

    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [gameState?.game.status, gameState?.currentQuestion?.questionStartedAt, gameState?.currentQuestion?.timeLimit]);

  // Feature 8: Waiting dots animation
  useEffect(() => {
    if (gameState?.game.status === "results" || gameState?.game.status === "leaderboard") {
      const interval = setInterval(() => {
        setWaitingDots(prev => prev.length >= 3 ? "" : prev + ".");
      }, 500);
      return () => clearInterval(interval);
    }
    setWaitingDots("");
  }, [gameState?.game.status]);

  // Feature 7 & 4: Handle answer flash and streak milestone when result comes in
  useEffect(() => {
    if (answerResult) {
      setShowAnswerFlash(true);
      const timer = setTimeout(() => setShowAnswerFlash(false), 1200);

      // Feature 4: Check streak milestones
      if (answerResult.streak === 3 || answerResult.streak === 5 || answerResult.streak === 10) {
        playSound("levelup");
        if (answerResult.streak >= 10) {
          setStreakMilestone("👑 LEGEND!");
        } else if (answerResult.streak >= 5) {
          setStreakMilestone("⚡ UNSTOPPABLE!");
        } else {
          setStreakMilestone("🔥 ON FIRE!");
        }
        const smTimer = setTimeout(() => setStreakMilestone(null), 3000);
        return () => { clearTimeout(timer); clearTimeout(smTimer); };
      }

      return () => clearTimeout(timer);
    }
  }, [answerResult, playSound]);

  const handleAnswer = async (optionIndex: number) => {
    if (!playerId || !gameState || gameState.game.status !== "question") return;
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (currentPlayer?.isFrozen) {
      playSound("wrong");
      return;
    }

    // Feature 12: Lock-in animation
    setLockedInAnswer(optionIndex);
    setTimeout(() => {
      setSelectedAnswer(optionIndex);
      setLockedInAnswer(null);
    }, 300);

    // Record answer time for speed bonus calculation
    answerTimeRef.current = timeLeft;

    try {
      const res = await fetch(`/api/games/${pin}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playerId, 
          selectedOption: optionIndex,
          usePowerUp: powerUpActive
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswerResult(data);
        if (data.isCorrect) {
          playSound("correct");
          // Feature 5: Speed bonus check (answered in first 25% of timer)
          if (gameState.currentQuestion && answerTimeRef.current !== null) {
            const totalTime = gameState.currentQuestion.timeLimit;
            const timeWhenAnswered = answerTimeRef.current;
            const elapsedFraction = 1 - (timeWhenAnswered / totalTime);
            if (elapsedFraction <= 0.25) {
              setShowSpeedBonus(true);
              setTimeout(() => setShowSpeedBonus(false), 2000);
            }
          }
        } else {
          playSound("wrong");
        }
      } else {
        setSelectedAnswer(null);
      }
    } catch (err) {
      console.error("Answer failed:", err);
      setSelectedAnswer(null);
    }
  };

  const handleEmote = async (emote: string) => {
    if (!playerId) return;
    try {
      await fetch(`/api/games/${pin}/emote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, emote }),
      });
      const el = document.getElementById("emote-btn-" + emote);
      if (el) {
        el.style.transform = "scale(1.5)";
        setTimeout(() => el.style.transform = "scale(1)", 200);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateRandomName = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 99);
    setJoinNickname(`${adj}${noun}${num}`);
    setJoinError("");
  };

  // Feature 15: Random avatar picker
  const pickRandomAvatar = () => {
    const available = AVATARS.filter(a => a !== joinAvatar);
    const random = available[Math.floor(Math.random() * available.length)];
    setJoinAvatar(random);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinNickname.trim();
    if (!trimmed) { setJoinError("Please enter a nickname"); return; }
    // Feature 15: Input validation
    if (trimmed.length < 2) { setJoinError("Nickname must be at least 2 characters"); return; }
    if (trimmed.length > 15) { setJoinError("Nickname must be 15 characters or less"); return; }
    setIsJoining(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/games/${pin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed, avatar: joinAvatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join game");
      
      window.history.replaceState({}, '', `/play/${pin}?playerId=${data.playerId}`);
      setPlayerId(data.playerId);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join game");
      setIsJoining(false);
    }
  };

  // Helper: Get player rank (Feature 3, 14)
  const getPlayerRank = (): number => {
    if (!gameState || !playerId) return 0;
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
    const idx = sorted.findIndex(p => p.id === playerId);
    return idx + 1;
  };

  // Helper: Get player accuracy (Feature 3)
  const getPlayerAccuracy = (): number => {
    if (!gameState || !playerId) return 0;
    const questionIndex = gameState.game.currentQuestionIndex;
    if (questionIndex <= 0) return 0;
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) return 0;
    // Estimate: We track correct answers by looking at streak relative to total questions
    // Since we don't have total correct count, use score heuristic
    // Best we can do: if score > 0, they've answered some correctly
    const totalQuestions = questionIndex + (gameState.game.status === "question" ? 0 : 1);
    if (totalQuestions === 0) return 0;
    // Simple heuristic: streak tells us recent correct count
    // For accurate %, we'll estimate based on score / avg potential score
    const avgPointsPerQ = 1000;
    const estimatedCorrect = Math.round(currentPlayer.score / avgPointsPerQ);
    return Math.min(100, Math.round((estimatedCorrect / totalQuestions) * 100));
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-6xl">🌀</div>
      </div>
    );
  }

  // --- GAME NOT FOUND / JOIN SCREEN ---
  if (!gameState || !playerId) {
    if (!gameState) {
       return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
          <h1 className="text-3xl font-bold mb-4 text-white">Game Not Found</h1>
          <button onClick={() => window.location.href = "/"} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition">
            Go Home
          </button>
        </div>
      );
    }

    // Feature 15: Enhanced Join Screen with random avatar button and input validation
    const nicknameLength = joinNickname.trim().length;
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/30 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        
        <div className="z-10 w-full max-w-md flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
              Join Game
            </h1>
            <p className="text-purple-300 font-bold tracking-widest text-xl">PIN: {pin}</p>
          </div>

          <div className="w-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl -mx-4 -my-4 -z-10 blur-xl opacity-50" />
            <form onSubmit={handleJoinSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nickname"
                    value={joinNickname}
                    onChange={(e) => { setJoinNickname(e.target.value); setJoinError(""); }}
                    className="w-full text-center text-2xl md:text-3xl font-black py-4 pl-4 pr-16 rounded-2xl bg-black/40 text-white placeholder:text-white/20 border-2 border-white/5 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                    maxLength={15}
                    disabled={isJoining}
                  />
                  <button
                    type="button"
                    onClick={generateRandomName}
                    title="Spin for random name"
                    disabled={isJoining}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-3xl hover:rotate-180 transition-transform duration-500"
                  >
                    🎲
                  </button>
                </div>
                {/* Feature 15: Character limit feedback */}
                <div className="flex justify-between px-2">
                  <span className={`text-xs font-medium transition-colors ${nicknameLength === 0 ? 'text-slate-500' : nicknameLength < 2 ? 'text-amber-400' : 'text-green-400'}`}>
                    {nicknameLength === 0 ? "Enter a nickname" : nicknameLength < 2 ? "Too short" : "✓ Looks good"}
                  </span>
                  <span className={`text-xs font-medium ${nicknameLength > 12 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {nicknameLength}/15
                  </span>
                </div>
              </div>

              {/* Feature 1: Expanded avatar gallery - scrollable 4-column grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avatar</p>
                  {/* Feature 15: Random avatar button */}
                  <button
                    type="button"
                    onClick={pickRandomAvatar}
                    disabled={isJoining}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    🎲 Random
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl scrollbar-thin">
                  <div className="grid grid-cols-4 gap-2 p-1">
                    {AVATARS.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setJoinAvatar(a)}
                        className={`text-2xl p-2 rounded-xl transition-all duration-200 ${joinAvatar === a ? "bg-purple-500/50 scale-110 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "hover:bg-white/10 opacity-70 hover:opacity-100"}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {joinError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium text-center animate-shake">
                  {joinError}
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining || !joinNickname.trim() || joinNickname.trim().length < 2}
                className="w-full py-4 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] flex justify-center items-center gap-2"
              >
                {isJoining ? "Joining..." : "Go!"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // --- MAIN GAME VIEW ---
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const playerRank = getPlayerRank();
  const totalPlayers = gameState.players.length;

  // Feature 6: Expanded emote bar with horizontal scroll
  const EmoteBar = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[90vw] bg-slate-900/80 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-2xl z-50">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {REACTION_EMOJIS.map(emoji => (
          <button
            key={emoji}
            id={`emote-btn-${emoji}`}
            onClick={() => handleEmote(emoji)}
            className="text-2xl md:text-3xl hover:scale-125 transition-transform duration-200 active:scale-90 shrink-0"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center max-w-lg mx-auto relative">
      {/* Feature 7: Answer feedback fullscreen flash */}
      {showAnswerFlash && answerResult && (
        <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none animate-pop-in ${answerResult.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'}`}
          style={{ animation: 'pop-in 0.3s ease-out, fadeOut 0.5s ease-in 0.7s forwards' }}
        >
          <span className="text-[120px] md:text-[160px] font-black drop-shadow-2xl">
            {answerResult.isCorrect ? "✓" : "✗"}
          </span>
          {answerResult.points > 0 && (
            <span className="text-3xl font-black text-white animate-float-up">
              +{answerResult.points}
            </span>
          )}
        </div>
      )}

      {/* Feature 5: Speed bonus flash */}
      {showSpeedBonus && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] animate-pop-in">
          <div className="bg-yellow-500/90 text-black font-black text-lg px-6 py-3 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-pulse">
            ⚡ Speed Bonus!
          </div>
        </div>
      )}

      {/* Feature 4: Streak milestone banner */}
      {streakMilestone && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] animate-pop-in">
          <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 text-white font-black text-2xl md:text-3xl px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.6)] animate-pulse-glow">
            {streakMilestone}
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl backdrop-blur-sm">
          <span className="text-2xl">{currentPlayer?.avatar}</span>
          <span className="font-bold">{currentPlayer?.nickname}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Feature 9: Power-Up badge */}
          {currentPlayer?.powerUp && !powerUpActive && (
            <button
              onClick={() => setPowerUpActive(true)}
              className="relative group"
              title="Activate power-up"
            >
              <div className={`px-3 py-2 rounded-xl font-black text-sm transition-all ${
                currentPlayer.powerUp === '2x'
                  ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]'
                  : 'bg-blue-500/30 border border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]'
              } animate-pulse-glow`}>
                {currentPlayer.powerUp === '2x' ? '2X' : '❄️'}
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white/50 group-hover:text-white/80 transition-colors whitespace-nowrap">
                Tap to use
              </span>
            </button>
          )}
          {powerUpActive && (
            <div className="px-3 py-2 rounded-xl font-black text-sm bg-green-500/30 border border-green-500/50 text-green-300 animate-pulse">
              ACTIVE
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-slate-400">Score</span>
            <span className="font-black text-xl text-yellow-400">{currentPlayer?.score || 0}</span>
          </div>
        </div>
      </div>
      
      {powerUpActive && (
        <div className="absolute inset-0 bg-blue-500/20 z-10 pointer-events-none animate-pulse"></div>
      )}

      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {gameState.game.status === "lobby" && (
          <div className="text-center animate-slide-up">
            <div className="w-32 h-32 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
              <span className="text-6xl animate-float">⏳</span>
            </div>
            <h2 className="text-3xl font-black mb-2">You&apos;re in!</h2>
            <p className="text-slate-400 text-lg">See your nickname on screen</p>
          </div>
        )}

        {gameState.game.status === "question" && gameState.currentQuestion && (
          <div className="w-full h-full flex flex-col pt-8">
            {/* Feature 10: Question number display */}
            <div className="text-center mb-3">
              <span className="text-sm font-bold text-slate-400 bg-slate-800/60 px-4 py-1 rounded-full">
                Question {gameState.game.currentQuestionIndex + 1} of {gameState.game.questionCount}
              </span>
            </div>

            {/* Timer bar - Feature 11: pulses red when < 5s */}
            <div className={`w-full h-3 bg-slate-800 rounded-full mb-8 overflow-hidden relative transition-all ${timeLeft < 5 && timeLeft > 0 ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
              <div 
                className={`absolute top-0 left-0 h-full ${timeLeft < 5 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                style={{
                  width: `${(timeLeft / gameState.currentQuestion.timeLimit) * 100}%`,
                  transition: "width 1s linear"
                }}
              />
            </div>

            {selectedAnswer ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pop-in">
                {/* Feature 3: Personal stats after answering */}
                {answerResult ? (
                  <div className="text-center space-y-4">
                    <div className={`text-5xl mb-2 animate-pop-in ${answerResult.isCorrect ? '' : ''}`}>
                      {answerResult.isCorrect ? "✨" : "😔"}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {answerResult.isCorrect ? "Correct!" : "Not quite..."}
                    </h2>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {/* Rank */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 font-medium">Rank</p>
                        <p className="text-xl font-black text-purple-400">#{playerRank}</p>
                        <p className="text-[10px] text-slate-500">of {totalPlayers}</p>
                      </div>
                      {/* Accuracy */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 font-medium">Accuracy</p>
                        <p className="text-xl font-black text-blue-400">{getPlayerAccuracy()}%</p>
                      </div>
                      {/* Streak */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-slate-400 font-medium">Streak</p>
                        <p className="text-xl font-black text-orange-400">
                          {answerResult.streak >= 10 ? "👑" : answerResult.streak >= 5 ? "⚡" : answerResult.streak >= 3 ? "🔥" : ""}
                          {answerResult.streak}
                        </p>
                      </div>
                    </div>
                    <div className="inline-block bg-black/20 rounded-xl px-6 py-3 mt-2">
                      <p className="text-lg font-bold text-white/90">+{answerResult.points} points</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-spin" style={{ animationDuration: '3s' }}>
                      <span className="text-4xl">🤔</span>
                    </div>
                    <h2 className="text-3xl font-bold">Waiting for others...</h2>
                  </>
                )}
              </div>
            ) : (
              /* Feature 11: Time pressure - pulse border red when < 5s */
              <div className={`grid gap-4 flex-1 ${(!gameState.currentQuestion.option3 && !gameState.currentQuestion.option4) ? 'grid-rows-2' : 'grid-cols-2'} ${timeLeft < 5 && timeLeft > 0 ? 'animate-pulse' : ''}`}>
                {[1, 2, 3, 4]
                  .filter(optIndex => {
                    if (optIndex === 3) return !!gameState.currentQuestion?.option3;
                    if (optIndex === 4) return !!gameState.currentQuestion?.option4;
                    return true;
                  })
                  .map((optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() => handleAnswer(optIndex)}
                    className={`${OPTION_COLORS[optIndex - 1]} rounded-2xl flex items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.2)] active:translate-y-2 active:shadow-none transition-all w-full h-full min-h-[120px] ${
                      /* Feature 12: Lock-in animation */
                      lockedInAnswer === optIndex ? 'scale-90' : ''
                    } ${timeLeft < 5 && timeLeft > 0 ? 'border-2 border-red-400/60' : ''}`}
                    style={{
                      transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
                    }}
                  >
                    <span className="text-6xl text-white/90 filter drop-shadow-md">{OPTION_SHAPES[optIndex - 1]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {gameState.game.status === "results" && answerResult && (
          <div className="text-center animate-slide-up flex flex-col items-center justify-center h-full">
            <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl ${
              answerResult.isCorrect 
                ? 'bg-gradient-to-b from-green-500 to-green-700 shadow-green-500/50' 
                : 'bg-gradient-to-b from-red-500 to-red-700 shadow-red-500/50'
            }`}>
              <div className="text-7xl mb-6 animate-pop-in">
                {answerResult.isCorrect ? "✨" : "❌"}
              </div>
              <h2 className="text-4xl font-black mb-2 text-white">
                {answerResult.isCorrect ? "Correct!" : "Incorrect"}
              </h2>

              {/* Feature 13: Correct answer reveal */}
              {!answerResult.isCorrect && gameState.currentQuestion?.correctOption && (
                <div className="mt-3 mb-3">
                  <p className="text-sm text-white/70 mb-2">The correct answer was:</p>
                  <div className="inline-flex items-center gap-2 bg-green-500/30 border-2 border-green-400 rounded-xl px-4 py-2">
                    <span className="text-xl">{OPTION_SHAPES[(gameState.currentQuestion.correctOption) - 1]}</span>
                    <span className="font-bold text-green-200">
                      {gameState.currentQuestion.correctOption === 1 ? gameState.currentQuestion.option1 :
                       gameState.currentQuestion.correctOption === 2 ? gameState.currentQuestion.option2 :
                       gameState.currentQuestion.correctOption === 3 ? gameState.currentQuestion.option3 :
                       gameState.currentQuestion.option4}
                    </span>
                  </div>
                </div>
              )}

              <div className="inline-block bg-black/20 rounded-xl px-6 py-3 mt-4">
                <p className="text-lg font-bold text-white/90">+{answerResult.points} points</p>
              </div>

              {/* Feature 4: Streak visual badges */}
              {answerResult.streak > 2 && (
                <p className="mt-4 text-orange-300 font-bold animate-streak-fire flex items-center justify-center gap-2">
                  <span>{answerResult.streak >= 10 ? "👑" : answerResult.streak >= 5 ? "⚡" : "🔥"}</span>
                  {answerResult.streak} Answer Streak{answerResult.streak >= 10 ? " — Legend!" : answerResult.streak >= 5 ? " — Unstoppable!" : " — On Fire!"}
                  <span>{answerResult.streak >= 10 ? "👑" : answerResult.streak >= 5 ? "⚡" : "🔥"}</span>
                </p>
              )}

              {/* Feature 14: Player rank display */}
              <div className="mt-4 flex items-center justify-center gap-2 text-white/70">
                <span className="text-sm font-medium">Your rank:</span>
                <span className="font-black text-lg text-yellow-300">#{playerRank}</span>
                <span className="text-sm font-medium">of {totalPlayers}</span>
              </div>
            </div>
          </div>
        )}

        {/* Feature 8: Waiting screen with results/no answer result yet */}
        {gameState.game.status === "results" && !answerResult && (
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-4 animate-float">⏳</div>
            <h2 className="text-3xl font-black mb-2">Time&apos;s up!</h2>
            <p className="text-slate-400 text-lg">Waiting for results{waitingDots}</p>
            {/* Feature 14: Player rank on waiting screen */}
            <div className="mt-4 flex items-center justify-center gap-2 text-white/50">
              <span className="text-sm font-medium">Current rank:</span>
              <span className="font-black text-lg text-yellow-300">#{playerRank}</span>
              <span className="text-sm font-medium">of {totalPlayers}</span>
            </div>
          </div>
        )}

        {gameState.game.status === "leaderboard" && (
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-4 animate-float">🏆</div>
            <h2 className="text-3xl font-black mb-2">Leaderboard Time!</h2>
            {/* Feature 8: Waiting animation with pulsing dots */}
            <p className="text-slate-400 text-lg">Look at the big screen{waitingDots}</p>
            {/* Feature 14: Player rank on leaderboard screen */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-white/50">Your rank:</span>
              <span className="font-black text-2xl text-yellow-300">#{playerRank}</span>
              <span className="text-sm font-medium text-white/50">of {totalPlayers}</span>
            </div>
          </div>
        )}

        {gameState.game.status === "finished" && (
          <div className="text-center animate-slide-up">
            <div className="text-7xl mb-6 animate-pop-in">🏁</div>
            <h2 className="text-4xl font-black mb-4">Game Over!</h2>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md inline-block">
              <p className="text-slate-300 mb-2">Final Score</p>
              <p className="text-5xl font-black text-yellow-400">{currentPlayer?.score || 0}</p>
              {/* Feature 14: Final rank */}
              <p className="text-lg font-bold text-purple-300 mt-2">Rank #{playerRank} of {totalPlayers}</p>
            </div>
            <button
              onClick={() => window.location.href = "/"}
              className="mt-8 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-200 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <EmoteBar />
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-4xl">⏳</div>}>
      <PlayContent />
    </Suspense>
  );
}
