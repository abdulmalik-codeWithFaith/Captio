"use client";

import { Sparkles, X } from "lucide-react";
import type { AnswerState } from "../lib/useAnswers";

export interface Assist {
  answer: AnswerState;
  auto: boolean;
  onToggleAuto: () => void;
  onAskNow: () => void;
  onDismiss: () => void;
}

/** Hide the brief moment where a "NO_QUESTION" reply is still streaming in. */
function isPlaceholder(text: string) {
  const t = text.trim();
  return t.length > 0 && "NO_QUESTION".startsWith(t);
}

export default function AnswerCard({ answer, auto, onToggleAuto, onAskNow, onDismiss }: Assist) {
  const btn =
    "rounded-md px-2 py-1 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white";
  const showText = answer.text && !isPlaceholder(answer.text);

  return (
    <section
      aria-label="Suggested answer"
      className="max-h-[55%] shrink-0 overflow-y-auto border-b border-white/10 bg-white/5 px-4 py-3"
    >
      <div className="flex items-center gap-1 text-xs text-white/70">
        <Sparkles size={14} aria-hidden />
        <span className="flex-1 font-medium">Suggested answer</span>
        <button
          role="switch"
          aria-checked={auto}
          onClick={onToggleAuto}
          className={`${btn} ${auto ? "bg-white/20" : ""}`}
          title="Automatically answer questions"
        >
          Auto {auto ? "on" : "off"}
        </button>
        <button onClick={onAskNow} className={btn}>
          Answer now
        </button>
        {answer.status !== "idle" && (
          <button onClick={onDismiss} className={btn} aria-label="Dismiss answer">
            <X size={14} />
          </button>
        )}
      </div>

      {answer.question && answer.status !== "idle" && (
        <p className="mt-2 line-clamp-2 text-xs italic text-white/60">Q: {answer.question}</p>
      )}

      {answer.status === "idle" && (
        <p className="mt-2 text-sm text-white/60">
          {auto
            ? "Listening for questions."
            : "Auto is off. Press Answer now after a question."}
        </p>
      )}
      {answer.status === "streaming" && !showText && (
        <p className="mt-2 text-sm text-white/60">Thinking</p>
      )}
      {showText && (
        <p className="mt-2 text-base leading-snug text-white">
          {answer.text}
          {answer.status === "streaming" && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-caption align-middle" aria-hidden />
          )}
        </p>
      )}
      {answer.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {answer.error}
        </p>
      )}
    </section>
  );
}