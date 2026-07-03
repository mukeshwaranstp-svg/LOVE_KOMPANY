import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Sparkles,
  Crown,
  RefreshCw,
  Plus,
  X,
  Trophy,
  Share2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "landing" | "loading" | "results";

interface CrushResult {
  name: string;
  key: string;
  label: string;
  emoji: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  percentage: number;
}

interface AppErrors {
  yourName?: string;
  crushes?: string;
}

// ─── FLAMES Data & Algorithm ──────────────────────────────────────────────────

const FLAMES_INFO: Record<
  string,
  { label: string; emoji: string; description: string; colorFrom: string; colorTo: string }
> = {
  F: {
    label: "Friends",
    emoji: "🤝",
    description: "A wonderful friendship filled with laughter and endless good vibes.",
    colorFrom: "#59C3FF",
    colorTo: "#3B82F6",
  },
  L: {
    label: "Love",
    emoji: "❤️",
    description: "Deep romantic connection — you two were absolutely made for each other!",
    colorFrom: "#FF5FA2",
    colorTo: "#EC4899",
  },
  A: {
    label: "Affection",
    emoji: "😊",
    description: "Warm, genuine care for one another — a truly beautiful bond.",
    colorFrom: "#F59E0B",
    colorTo: "#F97316",
  },
  M: {
    label: "Marriage",
    emoji: "💍",
    description: "Soulmates for life! A stunning forever awaits you both.",
    colorFrom: "#7B61FF",
    colorTo: "#A855F7",
  },
  E: {
    label: "Enemy",
    emoji: "⚔️",
    description: "Sparks fly between you — but not always the romantic kind!",
    colorFrom: "#EF4444",
    colorTo: "#F97316",
  },
  S: {
    label: "Sibling",
    emoji: "👫",
    description: "Close as family — a lifelong bond you can always count on.",
    colorFrom: "#10B981",
    colorTo: "#06B6D4",
  },
};

function calcFlames(name1: string, name2: string): CrushResult {
  const a = name1.toLowerCase().replace(/\s+/g, "").split("");
  const b = name2.toLowerCase().replace(/\s+/g, "").split("");

  for (let i = 0; i < a.length; i++) {
    if (!a[i]) continue;
    const j = b.indexOf(a[i]);
    if (j !== -1) {
      a[i] = "";
      b[j] = "";
    }
  }

  const remaining = [...a, ...b].filter(Boolean).length;

  const totalLetters = name1.replace(/\s+/g, "").length + name2.replace(/\s+/g, "").length;

  const commonLetters = totalLetters - remaining;

  // Base percentage
  let percentage = Math.round(
      (commonLetters / totalLetters) * 100
  );

  // Bonus points
  if (
      name1[0].toLowerCase() === name2[0].toLowerCase()
  ) {
      percentage += 10;
  }

  if (
      name1[name1.length - 1].toLowerCase() ===
      name2[name2.length - 1].toLowerCase()
  ) {
      percentage += 5;
  }

  // Don't exceed 100
  percentage = Math.min(percentage, 100);

  let key = "";
  if (percentage <= 15) {
      key = "S";
  }else if (percentage <= 30) {
    key = "E";
  }else if (percentage <= 50) {
    key = "F";
  }else if (percentage <= 70) {
    key = "A";
  }else if (percentage <= 90) {
    key = "L";
  }else {
    key = "M";
  }

  
  const info = FLAMES_INFO[key];

  return {
    name: name2,
    key,
    percentage,
    ...info,
  };

  }

const LOADING_MESSAGES = [
  { icon: "❤️", text: "Removing common letters..." },
  { icon: "✨", text: "Calculating compatibility..." },
  { icon: "💖", text: "Finding your best match..." },
  { icon: "🎉", text: "Preparing your results..." },
];

// ─── Shared UI Components ─────────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-3xl border border-white/10 ${className}`}
      style={{
        background: "rgba(255,255,255,0.055)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: glow
          ? "0 0 0 1.5px rgba(250,204,21,0.35), 0 8px 60px rgba(250,204,21,0.12), 0 4px 40px rgba(0,0,0,0.4)"
          : "0 4px 40px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

function GradientButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden group transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${className}`}
      style={{
        background: "linear-gradient(135deg, #FF5FA2 0%, #7B61FF 55%, #59C3FF 100%)",
      }}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  label,
  error,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  error?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-white/50 pl-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full px-5 py-4 rounded-2xl text-white outline-none transition-all duration-200 text-base`}
        style={{
          background: "rgba(255,255,255,0.07)",
          border: error ? "1.5px solid rgba(248,113,113,0.5)" : "1.5px solid rgba(255,255,255,0.1)",
          color: "#ffffff",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(255,95,162,0.5)";
          e.target.style.boxShadow = "0 0 0 4px rgba(255,95,162,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? "rgba(248,113,113,0.5)"
            : "rgba(255,255,255,0.1)";
          e.target.style.boxShadow = "none";
        }}
      />
      {error && <p className="text-red-400/80 text-xs pl-1">{error}</p>}
    </div>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar({
  showAbout,
}: {
  showAbout?: () => void;
}) {
  return (
    <nav className="flex items-center justify-between px-6 py-5 md:px-12">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF5FA2, #7B61FF)" }}
        >
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span
          className="font-black text-lg text-white tracking-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
        LOVE{" "}
          <span style={{ color: "#FF5FA2" }}>kompeny</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {showAbout && (
          <button
            onClick={showAbout}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 text-white/60 hover:text-white text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            About
          </button>
        )}
      </div>
    </nav>
  );
}

// ─── Landing Screen ───────────────────────────────────────────────────────────

function LandingScreen({
  yourName,
  setYourName,
  crushNames,
  updateCrush,
  removeCrush,
  addCrush,
  handleSubmit,
  errors,
  showAbout,
}: {
  yourName: string;
  setYourName: (v: string) => void;
  crushNames: string[];
  updateCrush: (i: number, v: string) => void;
  removeCrush: (i: number) => void;
  addCrush: () => void;
  handleSubmit: () => void;
  errors: AppErrors;
  showAbout: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar showAbout={showAbout} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-14">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs text-white/50 mb-7 font-medium uppercase tracking-wider"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#FF5FA2" }} />
            Classic game. Modern experience.
          </motion.div>

          <h1
            className="text-5xl md:text-[4.5rem] font-black text-white leading-[1.05] mb-5 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Discover Your{" "}
            <br className="hidden md:block" />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #FF5FA2 0%, #7B61FF 50%, #59C3FF 100%)",
              }}
            >
              Fun Compatibility
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/40 max-w-md mx-auto font-light leading-relaxed">
            Classic FLAMES with a modern, delightful experience.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-7 md:p-8">
            <div className="space-y-5">
              <InputField
                value={yourName}
                onChange={setYourName}
                placeholder="Enter your name..."
                label="Your Name"
                error={errors.yourName}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />

              <div className="space-y-2.5">
                <label
                  className="text-xs font-semibold text-white/50 pl-1 uppercase tracking-wider block"
                >
                  Crush Name(s)
                </label>

                {crushNames.map((name, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="flex-1">
                      <InputField
                        value={name}
                        onChange={(v) => updateCrush(i, v)}
                        placeholder={`Crush ${i + 1}...`}
                        error={i === 0 ? errors.crushes : undefined}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      />
                    </div>
                    {crushNames.length > 1 && (
                      <button
                        onClick={() => removeCrush(i)}
                        className="mt-0.5 flex-shrink-0 w-[54px] h-[54px] rounded-2xl border border-red-400/20 hover:border-red-400/40 hover:bg-red-400/10 transition-all duration-200 flex items-center justify-center text-red-400/50 hover:text-red-400"
                        style={{ background: "rgba(248,113,113,0.06)" }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}

                {crushNames.length < 6 && (
                  <button
                    onClick={addCrush}
                    className="w-full py-3 rounded-2xl border border-dashed border-white/15 text-white/35 hover:text-white/60 hover:border-white/30 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 group"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    Add Another Crush
                  </button>
                )}
              </div>

              <GradientButton onClick={handleSubmit} className="w-full text-base">
                <span className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 fill-white" />
                  Find Best Match
                </span>
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-white/20 text-xs text-center"
        >
          For entertainment purposes only. ✨
        </motion.p>
      </main>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({
  progress,
  msgIdx,
}: {
  progress: number;
  msgIdx: number;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="p-10 md:p-14 w-full max-w-sm text-center">
        {/* Animated heart */}
        <motion.div
          className="text-6xl mb-7 inline-block select-none"
          animate={{ scale: [1, 1.22, 1, 1.16, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          💖
        </motion.div>

        <h2
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Finding your perfect match...
        </h2>

        <div className="h-7 flex items-center justify-center mb-7">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-white/45 text-sm"
            >
              {LOADING_MESSAGES[msgIdx].icon} {LOADING_MESSAGES[msgIdx].text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden mb-3"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
            style={{
              background: "linear-gradient(90deg, #FF5FA2, #7B61FF, #59C3FF)",
            }}
          />
        </div>
        <p className="text-white/25 text-xs font-mono">{progress}%</p>
      </GlassCard>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({
  result,
  rank,
  isBest,
}: {
  result: CrushResult;
  rank: number;
  isBest: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + rank * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard glow={isBest} className="p-5 md:p-6 hover:border-white/20 transition-all duration-200">
        {isBest && (
          <div className="flex items-center gap-1.5 mb-4">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">
              Best Match
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${result.colorFrom}, ${result.colorTo})`,
            }}
          >
            {result.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3
                className="font-bold text-white text-base truncate"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {result.name}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-lg">{result.emoji}</span>
                <span
                  className="text-xs font-black px-3 py-1 rounded-xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${result.colorFrom}, ${result.colorTo})`,
                  }}
                >
                  {result.percentage}%
                </span>
              </div>
            </div>

            <p className="text-white/35 text-xs leading-relaxed mb-2.5 line-clamp-1">
              {result.description}
            </p>

            <div
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 text-white/80"
              style={{
                background: `${result.colorFrom}22`,
                border: `1px solid ${result.colorFrom}40`,
              }}
            >
              {result.emoji} {result.label}
            </div>
          </div>
        </div>

        {/* Mini bar */}
        <div
          className="mt-4 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${result.percentage}%` }}
            transition={{ duration: 0.9, delay: 0.4 + rank * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: `linear-gradient(90deg, ${result.colorFrom}, ${result.colorTo})`,
            }}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  results,
  yourName,
  handleReset,
  showToast,
}: {
  results: CrushResult[];
  yourName: string;
  handleReset: () => void;
  showToast: (msg: string) => void;
}) {
  const best = results[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <div className="px-6 py-5 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF5FA2, #7B61FF)" }}
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span
            className="font-black text-lg text-white tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            FLAMES <span style={{ color: "#FF5FA2" }}>Reimagined</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 text-white/60 hover:text-white text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 pb-14">
        <div className="max-w-lg mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 pt-4"
          >
            <p className="text-white/35 text-sm mb-1.5">Results for</p>
            <h1
              className="text-3xl md:text-4xl font-black text-white mb-1.5 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {yourName}
              {"'"}s{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #FF5FA2, #7B61FF)",
                }}
              >
                Compatibility
              </span>
            </h1>
            <p className="text-white/30 text-xs uppercase tracking-wider">
              Ranked from most to least compatible
            </p>
          </motion.div>

          {/* Best match hero */}
          {best && (
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5"
            >
              <GlassCard glow className="p-7 md:p-9 text-center relative overflow-hidden">
                {/* Ambient glow behind avatar */}
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${best.colorFrom}, transparent 65%)`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 mb-5">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-black text-xs uppercase tracking-widest">
                      Best Match
                    </span>
                  </div>

                  {/* Avatar */}
                  <motion.div
                    className="w-20 h-20 rounded-[22px] flex items-center justify-center text-white font-black text-2xl mx-auto mb-5 shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${best.colorFrom}, ${best.colorTo})`,
                    }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {best.name.slice(0, 2).toUpperCase()}
                  </motion.div>

                  <h2
                    className="text-2xl font-black text-white mb-2"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {best.name}
                  </h2>

                  {/* Big percentage */}
                  <div
                    className="text-5xl font-black text-transparent bg-clip-text mb-4 leading-none"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${best.colorFrom}, ${best.colorTo})`,
                    }}
                  >
                    {best.percentage}%
                  </div>

                  {/* Result badge */}
                  <div
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-white mb-4 text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${best.colorFrom}, ${best.colorTo})`,
                    }}
                  >
                    <span className="text-base">{best.emoji}</span>
                    <span>{best.label}</span>
                  </div>

                  <p className="text-white/45 text-sm max-w-xs mx-auto leading-relaxed">
                    {best.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Rest of results */}
          {results.length > 1 && (
            <div className="mb-6">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest pl-1 mb-3">
                All Results
              </p>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <ResultCard key={r.name + i} result={r} rank={i} isBest={i === 0} />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const text = `🔥 ${yourName}'s FLAMES Results: ${results.map((r) => `${r.name} → ${r.emoji} ${r.label} (${r.percentage}%)`).join(", ")}`;
                navigator.clipboard?.writeText(text).catch(() => {});
                showToast("🎉 Results copied to clipboard!");
              }}
              className="flex-1 py-4 rounded-2xl border border-white/12 text-white/50 hover:text-white hover:border-white/25 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <GradientButton onClick={handleReset} className="flex-1 text-sm">
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </span>
            </GradientButton>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── About Modal ──────────────────────────────────────────────────────────────

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h2
              className="text-xl font-black text-white mb-3"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              About FLAMES
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-4">
              FLAMES is a classic childhood game used to predict the relationship between two people.
              Each letter stands for:{" "}
              <span style={{ color: "#FF5FA2" }}>F</span>riendship,{" "}
              <span style={{ color: "#FF5FA2" }}>L</span>ove,{" "}
              <span style={{ color: "#FF5FA2" }}>A</span>ffection,{" "}
              <span style={{ color: "#FF5FA2" }}>M</span>arriage,{" "}
              <span style={{ color: "#FF5FA2" }}>E</span>nemy,{" "}
              <span style={{ color: "#FF5FA2" }}>S</span>ibling.
            </p>
            <p className="text-white/25 text-xs">
              This is a modern reimagining purely for fun. ✨
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [yourName, setYourName] = useState("");
  const [crushNames, setCrushNames] = useState(["", ""]);
  const [results, setResults] = useState<CrushResult[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<AppErrors>({});
  const [showAbout, setShowAbout] = useState(false);

  // Loading orchestration
  useEffect(() => {
    if (screen !== "loading") return;
    setLoadingProgress(0);
    setLoadingMsgIdx(0);

    const prog = setInterval(
      () => setLoadingProgress((p) => Math.min(p + 2, 100)),
      46
    );
    const msg = setInterval(
      () => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length),
      750
    );
    const done = setTimeout(() => setScreen("results"), 3000);

    return () => {
      clearInterval(prog);
      clearInterval(msg);
      clearTimeout(done);
    };
  }, [screen]);

  const handleSubmit = () => {
    const errs: AppErrors = {};
    if (!yourName.trim()) errs.yourName = "Please enter your name";
    const valid = crushNames.filter((n) => n.trim());
    if (!valid.length) errs.crushes = "Add at least one crush name";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    const res = valid.map((c) => calcFlames(yourName.trim(), c.trim()));
    res.sort((a, b) => b.percentage - a.percentage);
    setResults(res);
    setScreen("loading");
  };

  const handleReset = () => {
    setYourName("");
    setCrushNames(["", ""]);
    setResults([]);
    setScreen("landing");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Generate deterministic sparkle positions
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    top: `${(i * 17.3) % 95}%`,
    left: `${(i * 23.7) % 98}%`,
    delay: `${(i * 0.6) % 4}s`,
    size: 8 + (i % 3) * 4,
  }));

  return (
    <>
      <style>{`
        @keyframes floatHeart {
          0%   { transform: translateY(0) rotate(-12deg) scale(1);   opacity: 0; }
          5%   { opacity: 0.9; }
          95%  { opacity: 0.25; }
          100% { transform: translateY(-110vh) rotate(12deg) scale(0.8); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50%       { opacity: 0.7; transform: scale(1) rotate(180deg); }
        }
        .float-heart { animation: floatHeart linear infinite; }
        .twinkle     { animation: twinkle ease-in-out infinite; }
        * { scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="min-h-screen relative overflow-x-hidden"
        style={{
          background: "#09021A",
          color: "#ffffff",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ── Animated gradient orbs ── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              top: "-20%",
              left: "-8%",
              width: "55%",
              height: "60%",
              background: "#FF5FA2",
              opacity: 0.18,
              filter: "blur(100px)",
              animationDuration: "4s",
            }}
          />
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              bottom: "-15%",
              right: "-8%",
              width: "60%",
              height: "55%",
              background: "#7B61FF",
              opacity: 0.16,
              filter: "blur(120px)",
              animationDuration: "5.5s",
              animationDelay: "1.5s",
            }}
          />
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              top: "35%",
              right: "10%",
              width: "38%",
              height: "38%",
              background: "#59C3FF",
              opacity: 0.1,
              filter: "blur(80px)",
              animationDuration: "6.5s",
              animationDelay: "3s",
            }}
          />
        </div>

        {/* ── Floating hearts ── */}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="fixed pointer-events-none z-[1] float-heart select-none"
            style={{
              left: `${(i * 8.9) % 100}%`,
              bottom: "-50px",
              fontSize: `${13 + (i * 4) % 16}px`,
              color: i % 3 === 0 ? "#FF5FA2" : i % 3 === 1 ? "#7B61FF" : "#59C3FF",
              opacity: 0.12 + (i % 5) * 0.05,
              animationDelay: `${(i * 1.4) % 11}s`,
              animationDuration: `${12 + (i * 2.1) % 9}s`,
            }}
          >
            ♥
          </div>
        ))}

        {/* ── Sparkle particles ── */}
        {sparkles.map((s, i) => (
          <div
            key={i}
            className="fixed pointer-events-none z-[1] twinkle"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
              animationDuration: `${2.5 + (i % 4) * 0.8}s`,
            }}
          >
            <svg
              width={s.size}
              height={s.size}
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z"
                fill="white"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        ))}

        {/* ── Screens ── */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {screen === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <LandingScreen
                  yourName={yourName}
                  setYourName={setYourName}
                  crushNames={crushNames}
                  updateCrush={(i, v) => {
                    const u = [...crushNames];
                    u[i] = v;
                    setCrushNames(u);
                  }}
                  removeCrush={(i) => {
                    if (crushNames.length > 1)
                      setCrushNames(crushNames.filter((_, j) => j !== i));
                  }}
                  addCrush={() => {
                    if (crushNames.length < 6)
                      setCrushNames([...crushNames, ""]);
                  }}
                  handleSubmit={handleSubmit}
                  errors={errors}
                  showAbout={() => setShowAbout(true)}
                />
              </motion.div>
            )}

            {screen === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <LoadingScreen
                  progress={loadingProgress}
                  msgIdx={loadingMsgIdx}
                />
              </motion.div>
            )}

            {screen === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ResultsScreen
                  results={results}
                  yourName={yourName}
                  handleReset={handleReset}
                  showToast={showToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── About modal ── */}
        <AnimatePresence>
          {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        </AnimatePresence>

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 60, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 60, x: "-50%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-8 left-1/2 z-50 px-6 py-3 rounded-2xl border border-white/20 text-white text-sm font-medium shadow-2xl whitespace-nowrap"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
