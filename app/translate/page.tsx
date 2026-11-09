"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft, Mic, Monitor, Play, Square } from "lucide-react";
import CaptionWindow from "../../components/CaptionWindow";
import CaptionPanel from "../../components/CaptionPanel";
import { usePictureInPicture } from "../../lib/usePictureInPicture";
import { useLiveCaptions, type AudioSource } from "../../lib/useLiveCaptions";

const SOURCES: {
  id: AudioSource;
  title: string;
  hint: string;
  icon: typeof Mic;
}[] = [
  {
    id: "tab",
    title: "Browser tab",
    hint: "Best for Google Meet, YouTube or online classes. Choose the tab and turn on Share tab audio.",
    icon: Monitor,
  },
  {
    id: "mic",
    title: "Microphone",
    hint: "Best for in-person talks, or when the speaker plays through your speakers.",
    icon: Mic,
  },
];

export default function TranslatePage() {
  const { status, error, lines, paused, level, start, stop, setPaused, clear } =
    useLiveCaptions();
  const { supported: pipSupported, pipWindow, open: openPip, close: closePip } =
    usePictureInPicture();
  const [source, setSource] = useState<AudioSource>("tab");
  const [tabSupported, setTabSupported] = useState(true);

  // getDisplayMedia is missing on most phones
  useEffect(() => {
    const ok = !!navigator.mediaDevices?.getDisplayMedia;
    setTabSupported(ok);
    if (!ok) setSource("mic");
  }, []);

  const running = status !== "idle";

  // Close the always-on-top window when captions stop
  useEffect(() => {
    if (status === "idle") closePip();
  }, [status, closePip]);

  const handleStop = () => {
    stop();
    closePip();
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden />
        Back
      </Link>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Live captions
      </h1>
      <p className="mt-3 max-w-[34rem] leading-relaxed text-muted">
        Choose what to listen to. Captions appear in English in a window you can
        move, resize and make transparent.
      </p>

      <fieldset className="mt-8" disabled={running}>
        <legend className="mb-3 font-display text-lg font-semibold">
          Audio source
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOURCES.map(({ id, title, hint, icon: Icon }) => {
            const unavailable = id === "tab" && !tabSupported;
            const selected = source === id;
            return (
              <label
                key={id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
                  selected
                    ? "border-signal bg-surface"
                    : "border-line bg-surface/60 hover:border-signal/50"
                } ${unavailable || running ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name="source"
                  value={id}
                  checked={selected}
                  disabled={unavailable || running}
                  onChange={() => setSource(id)}
                  className="sr-only"
                />
                <Icon
                  size={22}
                  className={selected ? "text-signal" : "text-muted"}
                  aria-hidden
                />
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">
                    {unavailable
                      ? "Not supported in this browser. Use Chrome or Edge on a computer."
                      : hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {running ? (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition-colors hover:bg-ink/85"
          >
            <Square size={16} aria-hidden />
            Stop captions
          </button>
        ) : (
          <button
            onClick={() => start(source)}
            className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white transition-colors hover:bg-signal-deep"
          >
            <Play size={16} aria-hidden />
            Start captions
          </button>
        )}

        {/* Input level: confirms audio is actually arriving */}
        {running && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Audio level</span>
            <div
              className="h-2 w-28 overflow-hidden rounded-full bg-line"
              role="meter"
              aria-label="Audio level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(Math.min(level * 300, 100))}
            >
              <div
                className="h-full bg-signal transition-[width] duration-100"
                style={{ width: `${Math.min(level * 300, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {!running && error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!running && lines.length > 0 && (
        <section className="mt-10" aria-labelledby="last">
          <h2 id="last" className="font-display text-lg font-semibold">
            Last session
          </h2>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-line bg-surface p-4 leading-relaxed">
            {lines.map((l) => (
              <p key={l.id}>{l.text}</p>
            ))}
          </div>
          <button
            onClick={clear}
            className="mt-3 text-sm font-semibold text-signal hover:text-signal-deep"
          >
            Clear transcript
          </button>
        </section>
      )}

      {running && !pipWindow && (
        <CaptionWindow
          lines={lines}
          status={status}
          paused={paused}
          error={error}
          onTogglePause={() => setPaused(!paused)}
          onClear={clear}
          onStop={handleStop}
          onPopOut={pipSupported ? () => void openPip() : undefined}
        />
      )}

      {running &&
        pipWindow &&
        createPortal(
          <CaptionPanel
            lines={lines}
            status={status}
            paused={paused}
            error={error}
            onTogglePause={() => setPaused(!paused)}
            onClear={clear}
            onStop={handleStop}
            onReturn={closePip}
            copyText={(text) => pipWindow.navigator.clipboard.writeText(text)}
          />,
          pipWindow.document.body
        )}
    </main>
  );
}