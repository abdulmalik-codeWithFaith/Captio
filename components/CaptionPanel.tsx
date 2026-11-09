"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Pause, PictureInPicture2, Play, Square, Trash2 } from "lucide-react";
import type { CaptionLine, CaptionStatus } from "../lib/useLiveCaptions";

interface Props {
  lines: CaptionLine[];
  status: CaptionStatus;
  paused: boolean;
  error: string | null;
  onTogglePause: () => void;
  onClear: () => void;
  onStop: () => void;
  onReturn: () => void;
  /** Clipboard of the window this panel lives in */
  copyText: (text: string) => Promise<void>;
}

/** Full-window caption view for the Picture-in-Picture window. Resize it with the OS window edges. */
export default function CaptionPanel({
  lines,
  status,
  paused,
  error,
  onTogglePause,
  onClear,
  onStop,
  onReturn,
  copyText,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  async function copyAll() {
    try {
      await copyText(lines.map((l) => l.text).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked */
    }
  }

  const label = paused ? "Paused" : status === "listening" ? "Listening" : "Starting";
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white";

  return (
    <div className="flex h-screen flex-col bg-ink text-white">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/10 px-3 py-1">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "listening" && !paused ? "animate-pulse bg-emerald-400" : "bg-white/40"
          }`}
          aria-hidden
        />
        <span className="flex-1 pl-1 text-xs font-medium text-white/80" aria-live="polite">
          {label}
        </span>
        <button className={btn} onClick={onTogglePause} aria-label={paused ? "Resume" : "Pause"} title={paused ? "Resume" : "Pause"}>
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button className={btn} onClick={copyAll} aria-label="Copy transcript" title="Copy transcript">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button className={btn} onClick={onClear} aria-label="Clear captions" title="Clear captions">
          <Trash2 size={16} />
        </button>
        <button className={btn} onClick={onReturn} aria-label="Return to page" title="Return to page">
          <PictureInPicture2 size={16} />
        </button>
        <button className={btn} onClick={onStop} aria-label="Stop captions" title="Stop captions">
          <Square size={14} />
        </button>
      </div>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {lines.length === 0 ? (
          <p className="text-white/60">
            {status === "listening"
              ? "Waiting for speech. Captions appear a few seconds after someone talks."
              : "Captions will appear here."}
          </p>
        ) : (
          <div className="space-y-2 text-lg leading-snug">
            {lines.map((l, i) => (
              <p key={l.id} className={i === lines.length - 1 ? "text-caption" : "text-white/70"}>
                {l.text}
              </p>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}