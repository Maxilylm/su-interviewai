"use client";

import { useState, useCallback } from "react";

// -- Types ------------------------------------------------------------------

interface Question {
  question: string;
  category: string;
  difficulty: number;
  rubric: string;
  followUps: string[];
}

// -- Constants --------------------------------------------------------------

const ROLES = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "Data Scientist",
  "DevOps",
  "Product Manager",
  "Designer",
  "QA",
];

const SENIORITIES = ["Junior", "Mid", "Senior", "Lead/Staff"];

const CATEGORY_COLORS: Record<string, string> = {
  Technical: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Behavioral: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "System Design": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Problem Solving": "bg-green-500/20 text-green-400 border-green-500/30",
  "Domain Knowledge": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Leadership: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Communication: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "Culture Fit": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const DEFAULT_BADGE = "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";

// -- Component --------------------------------------------------------------

export default function Home() {
  const [role, setRole] = useState("");
  const [seniority, setSeniority] = useState("");
  const [techStack, setTechStack] = useState("");
  const [focus, setFocus] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const canGenerate = role && seniority;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setExpandedCards(new Set());

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          seniority,
          techStack: techStack.trim() || undefined,
          focus: focus.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setQuestions(data.questions || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [canGenerate, role, seniority, techStack, focus]);

  const toggleCard = useCallback((index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = questions
      .map((q, i) => {
        let block = `${i + 1}. [${q.category}] (Difficulty: ${"*".repeat(q.difficulty)})\n`;
        block += `   ${q.question}\n`;
        block += `   Rubric: ${q.rubric}\n`;
        if (q.followUps.length > 0) {
          block += `   Follow-ups:\n`;
          q.followUps.forEach((f) => {
            block += `   - ${f}\n`;
          });
        }
        return block;
      })
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [questions]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
              iQ
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#fafafa] leading-tight">
                InterviewAI
              </h1>
              <p className="text-xs text-[#a1a1aa]">
                Smart Interview Question Generator
              </p>
            </div>
          </div>
          <a
            href="https://github.com/maxilylm/su-interviewai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-3 tracking-tight">
            Generate Interview Questions with AI
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            Select role and seniority, optionally add tech stack and focus area
            — get 10 tailored questions with rubrics and follow-ups.
          </p>
        </div>

        {/* Role Selection */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-[#d4d4d8] mb-3">
            Role <span className="text-indigo-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  role === r
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10"
                    : "border-[#262626] bg-[#141414] text-[#d4d4d8] hover:border-[#3f3f46] hover:bg-[#1a1a1a]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Seniority Selection */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-[#d4d4d8] mb-3">
            Seniority <span className="text-indigo-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SENIORITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeniority(s)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  seniority === s
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10"
                    : "border-[#262626] bg-[#141414] text-[#d4d4d8] hover:border-[#3f3f46] hover:bg-[#1a1a1a]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Optional Fields */}
        <section className="mb-8 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#d4d4d8] mb-1.5">
              Tech Stack <span className="text-[#71717a] text-xs">(optional, comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, AWS, PostgreSQL"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-[#fafafa] text-sm placeholder:text-[#52525b] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#d4d4d8] mb-1.5">
              Focus Area <span className="text-[#71717a] text-xs">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. system design, coding, behavioral"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-[#fafafa] text-sm placeholder:text-[#52525b] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
            />
          </div>
        </section>

        {/* Generate Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className={`relative px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 ${
              canGenerate && !loading
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-[#262626] text-[#52525b] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating Questions...
              </span>
            ) : (
              "Generate 10 Questions"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border border-[#262626] bg-[#141414] rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-24 h-5 rounded animate-shimmer" />
                  <div className="w-16 h-5 rounded animate-shimmer" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 rounded animate-shimmer" />
                  <div className="w-4/5 h-4 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {questions.length > 0 && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#fafafa]">
                Interview Questions
              </h3>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#262626] bg-[#141414] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy All Questions
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => {
                const isExpanded = expandedCards.has(i);
                return (
                  <div
                    key={i}
                    className="animate-fade-in-up border border-[#262626] bg-[#141414] rounded-xl overflow-hidden hover:border-[#3f3f46] transition-colors"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Card Header */}
                    <button
                      onClick={() => toggleCard(i)}
                      className="w-full px-5 py-4 flex items-start gap-4 text-left cursor-pointer"
                    >
                      {/* Question Number */}
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Badges Row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border ${
                              CATEGORY_COLORS[q.category] || DEFAULT_BADGE
                            }`}
                          >
                            {q.category}
                          </span>
                          <DifficultyStars difficulty={q.difficulty} />
                        </div>

                        {/* Question Text */}
                        <p className="text-sm text-[#e4e4e7] leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 text-[#71717a] flex-shrink-0 mt-1 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-[#262626]">
                        {/* Rubric */}
                        <div className="px-5 py-4 bg-[#0f0f0f]">
                          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">
                            What to Look For
                          </h4>
                          <p className="text-sm text-[#a1a1aa] leading-relaxed">
                            {q.rubric}
                          </p>
                        </div>

                        {/* Follow-ups */}
                        {q.followUps.length > 0 && (
                          <div className="px-5 py-4 border-t border-[#262626]/50">
                            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-3">
                              Follow-up Questions
                            </h4>
                            <ul className="space-y-2">
                              {q.followUps.map((f, fi) => (
                                <li
                                  key={fi}
                                  className="flex items-start gap-2 text-sm text-[#a1a1aa]"
                                >
                                  <span className="text-purple-500 mt-0.5 flex-shrink-0">
                                    &rarr;
                                  </span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-[#71717a]">
          Built with Groq + Llama 3.3 &middot; Questions are AI-generated
          &mdash; always review before using in interviews
        </div>
      </footer>
    </div>
  );
}

// -- Sub-components ---------------------------------------------------------

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <span className="flex items-center gap-0.5" title={`Difficulty: ${difficulty}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
            i < difficulty ? "text-amber-400" : "text-[#3f3f46]"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}
