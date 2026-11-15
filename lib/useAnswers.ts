"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CaptionLine } from "./useLiveCaptions";
import { isQuestion } from "./detectQuestion";

export interface AnswerState {
  question: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error: string | null;
}

const EMPTY: AnswerState = { question: "", text: "", status: "idle", error: null };
const CONTEXT_LINES = 10;

interface Options {
  lines: CaptionLine[];
  enabled: boolean;
  auto: boolean;
  paused: boolean;
  background: string;
}

export function useAnswers({ lines, enabled, auto, paused, background }: Options) {
  const [answer, setAnswer] = useState<AnswerState>(EMPTY);
  const abortRef = useRef<AbortController | null>(null);
  const lastSeen = useRef(-1);
  const linesRef = useRef(lines);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const ask = useCallback(
    async (question: string) => {
      abortRef.current?.abort(); // the newest question wins
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const transcript = linesRef.current
        .slice(-CONTEXT_LINES)
        .map((l) => l.text)
        .join("\n");

      setAnswer({ question, text: "", status: "streaming", error: null });
      try {
        const res = await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, transcript, background }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          setAnswer((a) => ({
            ...a,
            status: "error",
            error: data.error ?? "Could not generate an answer.",
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAnswer((a) => ({ ...a, text }));
        }
        if (text.trim() === "NO_QUESTION") setAnswer(EMPTY);
        else setAnswer((a) => ({ ...a, status: "done" }));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setAnswer((a) => ({ ...a, status: "error", error: "Could not reach the server." }));
      }
    },
    [background]
  );

  // Auto mode: look at each new caption line for a question.
  useEffect(() => {
    if (!enabled) return;
    const fresh = lines.filter((l) => l.id > lastSeen.current);
    if (fresh.length === 0) return;
    const last = fresh[fresh.length - 1];
    lastSeen.current = last.id;
    if (!auto || paused) return;

    // Segments are cut every few seconds, so a question can span two lines.
    const prev = lines[lines.findIndex((l) => l.id === last.id) - 1];
    const candidate =
      prev && !/[.?!]$/.test(prev.text.trim()) ? `${prev.text} ${last.text}` : last.text;
    if (isQuestion(candidate)) void ask(candidate);
  }, [lines, enabled, auto, paused, ask]);

  const askNow = useCallback(() => {
    const recent = linesRef.current
      .slice(-2)
      .map((l) => l.text)
      .join(" ");
    if (recent.trim()) void ask(recent);
  }, [ask]);

  const dismiss = useCallback(() => {
    abortRef.current?.abort();
    setAnswer(EMPTY);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { answer, askNow, dismiss };
}