"use client";

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-slate-800/80 animate-shimmer relative overflow-hidden ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
}

export function QuizCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-4">
      {/* Emoji placeholder */}
      <ShimmerBar className="w-12 h-12 rounded-xl" />
      {/* Title */}
      <ShimmerBar className="w-3/4 h-5" />
      {/* Description line 1 */}
      <ShimmerBar className="w-full h-3" />
      {/* Description line 2 */}
      <ShimmerBar className="w-2/3 h-3" />
      {/* Footer row */}
      <div className="flex items-center gap-2 pt-2">
        <ShimmerBar className="w-16 h-3" />
        <ShimmerBar className="w-10 h-3" />
      </div>
    </div>
  );
}

export function QuestionSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 space-y-5">
      {/* Question text */}
      <ShimmerBar className="w-full h-6" />
      <ShimmerBar className="w-4/5 h-6" />
      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <ShimmerBar className="h-14 rounded-xl" />
        <ShimmerBar className="h-14 rounded-xl" />
        <ShimmerBar className="h-14 rounded-xl" />
        <ShimmerBar className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

export function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return <ShimmerBar className={`${sizeMap[size]} rounded-full`} />;
}
