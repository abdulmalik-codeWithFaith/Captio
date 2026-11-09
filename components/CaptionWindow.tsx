"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import {
  Check,
  Copy,
  GripHorizontal,
  Minus,
  Pause,
  Play,
  Square,
  Trash2,
  Maximize2,
} from "lucide-react";
import type { CaptionLine, CaptionStatus } from "../lib/useLiveCaptions";

interface Props {
  lines: CaptionLine[];
  status: CaptionStatus;
  paused: boolean;
  error: string | null;
  onTogglePause: () => void;
  onClear: () => void;
  onStop: () => void;
}

export default function CaptionWindow({
  lines,
  status,
  paused,
  error,
  onTogglePause,
  onClear,
  onStop,
}: Props) {
  const bounds = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const [opacity, setOpacity] = useState(0.92);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keep the newest caption in view
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(lines.map((l) => l.text).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked; nothing else to do */
    }
  }

  const statusLabel = paused
    ? "Paused"
    : status === "listening"
      ? "Listening"
      : status === "starting"
        ? "Starting"
        : "Stopped";

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white";

  return (
    <div ref={bounds} className="pointer-events-none fixed inset-0 z-50">
      <motion.div
        drag
        dragControls={controls}
        dragListener={false}
        dragConstraints={bounds}
        dragMomentum={false}
        dragElastic={0}
        role="region"
        aria-label="Live caption window"
        style={{ backgroundColor: `rgba(22, 32, 46, ${opacity})` }}
        className={`pointer-events-auto absolute inset-x-0 bottom-6 mx-auto flex w-[min(92vw,34rem)] min-w-[18rem] max-w-[95vw] flex-col overflow-hidden rounded-xl text-white shadow-2xl shadow-black/40 backdrop-blur ${
          minimized ? "" : "h-64 min-h-[9rem] resize"
        }`}
      >
        {/* Title bar: the only part that drags */}
        <div className="flex shrink-0 items-center gap-1 border-b border-white/10 px-2 py-1">
          <div
            onPointerDown={(e) => controls.start(e)}
            className="flex flex-1 cursor-grab touch-none items-center gap-2 py-1 active:cursor-grabbing"
          >
            <GripHorizontal size={16} className="text-white/60" aria-hidden />
            <span
              className={`h-2 w-2 rounded-full ${
                status === "listening" && !paused
                  ? "animate-pulse bg-emerald-400"
                  : "bg-white/40"
              }`}
              aria-hidden
            />
            <span className="text-xs font-medium text-white/80" aria-live="polite">
              {statusLabel}
            </span>
          </div>

          <label className="flex items-center" title="Window transparency">
            <span className="sr-only">Transparency</span>
            <input
              type="range"
              min={0.4}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="h-1 w-16 accent-[#ffd966]"
            />
          </label>

          <button className={btn} onClick={onTogglePause} aria-label={paused ? "Resume" : "Pause"} title={paused ? "Resume" : "Pause"}>
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button className={btn} onClick={copyAll} aria-label="Copy transcript" title="Copy transcript">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button className={btn} onClick={onClear} aria-label="Clear captions" title="Clear captions">
            <Trash2 size={16} />
          </button>
          <button
            className={btn}
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? "Restore" : "Minimize"}
            title={minimized ? "Restore" : "Minimize"}
          >
            {minimized ? <Maximize2 size={16} /> : <Minus size={16} />}
          </button>
          <button className={btn} onClick={onStop} aria-label="Stop captions" title="Stop captions">
            <Square size={14} />
          </button>
        </div>

        {!minimized && (
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
                  <p
                    key={l.id}
                    className={i === lines.length - 1 ? "text-[#ffd966]" : "text-white/70"}
                  >
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
        )}
      </motion.div>
    </div>
  );
}