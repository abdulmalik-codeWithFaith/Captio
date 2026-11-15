"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft, Captions, Mic, Monitor, Play, Sparkles, Square } from "lucide-react";
import CaptionWindow from "../../components/CaptionWindow";
import CaptionPanel from "../../components/CaptionPanel";
import type { Assist } from "../../components/AnswerCard";
import { useLiveCaptions, type AudioSource } from "../../lib/useLiveCaptions";
import { usePictureInPicture } from "../../lib/usePictureInPicture";
import { useAnswers } from "../../lib/useAnswers";

type Mode = "captions" | "answers";

const MAX_BACKGROUND = 4000;
const STORAGE_KEY = "captio:background";

const MODES: { id: Mode; title: string; hint: string; icon: typeof Mic }[] = [
  {
    id: "captions",
    title: "Captions only",
    hint: "Live English captions of what is being said.",
    icon: Captions,
  },
  {
    id: "answers",
    title: "Answer Questions",
    hint: "Captions plus a suggested answer when someone asks you a question.",
    icon: Sparkles,
  },
];

const SOURCES: { id: AudioSource; title: string; hint: string; icon: typeof Mic }[] = [
  {
    id: "tab",
    title: "Browser tab",
    hint: "Best for Google Meet, YouTube or online classes. Choose the tab and turn on Share tab audio. Only the other speakers are heard, not you.",
    icon: Monitor,
  },
  {
    id: "mic",
    title: "Microphone",
    hint: "Best for in-person talks, or when the speaker plays through your speakers. Your own voice is heard too.",
    icon: Mic,
  },
];

function ChoiceCard({
  name,
  value,
  selected,
  disabled,
  title,
  hint,
  icon: Icon,
  onSelect,
}: {
  name: string;
  value: string;
  selected: boolean;
  disabled: boolean;
  title: string;
  hint: string;
  icon: typeof Mic;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
        selected ? "border-signal bg-surface" : "border-line bg-surface/60 hover:border-signal/50"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      <Icon size={22} className={selected ? "text-signal" : "text-muted"} aria-hidden />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{hint}</span>
      </span>
    </label>
  );
}

export default function TranslatePage() {
  const { status, error, lines, paused, level, start, stop, setPaused, clear } =
    useLiveCaptions();
  const { supported: pipSupported, pipWindow, open: openPip, close: closePip } =
    usePictureInPicture();

  const [source, setSource] = useState<AudioSource>("tab");
  const [tabSupported, setTabSupported] = useState(true);
  const [mode, setMode] = useState<Mode>("captions");
  const [auto, setAuto] = useState(true);
  const [background, setBackground] = useState("");
  const [remember, setRemember] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const running = status !== "idle";

  const { answer, askNow, dismiss } = useAnswers({
    lines,
    enabled: running && mode === "answers",
    auto,
    paused,
    background,
  });

  // getDisplayMedia is missing on most phones
  useEffect(() => {
    const ok = !!navigator.mediaDevices?.getDisplayMedia;
    setTabSupported(ok);
    if (!ok) setSource("mic");
  }, []);

  // Optional: keep the background text on this device only
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBackground(saved);
        setRemember(true);
      }
    } catch {
      /* storage blocked */
    }
  }, []);
  useEffect(() => {
    try {
      if (remember) localStorage.setItem(STORAGE_KEY, background);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage blocked */
    }
  }, [remember, background]);

  useEffect(() => {
    if (status === "idle") {
      closePip();
      dismiss();
    }
  }, [status, closePip, dismiss]);

  const handleStop = () => {
    stop();
    closePip();
  };

  async function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 200_000) {
      setFileError("That file is too large. Use a .txt or .md file under 200 KB.");
      return;
    }
    setFileError(null);
    setBackground((await file.text()).slice(0, MAX_BACKGROUND));
  }

  const assist: Assist | undefined =
    mode === "answers"
      ? {
          answer,
          auto,
          onToggleAuto: () => setAuto((a) => !a),
          onAskNow: askNow,
          onDismiss: dismiss,
        }
      : undefined;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden />
        Back
      </Link>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Live captions
      </h1>
      <p className="mt-3 max-w-[34rem] leading-relaxed text-muted">
        Choose a mode and an audio source. Captions appear in English in a window you can move,
        resize and pop out above other apps.
      </p>

      <fieldset className="mt-8" disabled={running}>
        <legend className="mb-3 font-display text-lg font-semibold">Mode</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <ChoiceCard
              key={m.id}
              name="mode"
              value={m.id}
              selected={mode === m.id}
              disabled={running}
              title={m.title}
              hint={m.hint}
              icon={m.icon}
              onSelect={() => setMode(m.id)}
            />
          ))}
        </div>
      </fieldset>

      {mode === "answers" && (
        <section className="mt-6 rounded-xl border border-line bg-surface p-4" aria-labelledby="bg">
          <h2 id="bg" className="font-display text-lg font-semibold">
            Your background <span className="font-normal text-muted">(optional)</span>
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Paste your CV, skills or notes so answers use your real experience. Without it, answers
            are general and may contain [placeholders] for you to fill in.
          </p>
          <textarea
            value={background}
            onChange={(e) => setBackground(e.target.value.slice(0, MAX_BACKGROUND))}
            rows={6}
            placeholder="Example: 4 years as a React and Node.js developer. Built an invoicing app used by 200 shops. Led a team of 3."
            className="mt-3 w-full rounded-lg border border-line bg-paper p-3 text-sm leading-relaxed"
            aria-label="Your background"
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="text-muted">
              {background.length}/{MAX_BACKGROUND}
            </span>
            <label className="cursor-pointer font-semibold text-signal hover:text-signal-deep">
              Load a .txt or .md file
              <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={loadFile} className="sr-only" />
            </label>
            {background && (
              <button onClick={() => setBackground("")} className="font-semibold text-signal hover:text-signal-deep">
                Clear
              </button>
            )}
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember on this device
            </label>
          </div>
          {fileError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {fileError}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Detected questions, recent captions and this text are sent to Groq to write answers.
            Don&rsquo;t include passwords or anything you can&rsquo;t share. Use answers as
            suggestions, check them, and follow the rules of your meeting or interview.
          </p>
        </section>
      )}

      <fieldset className="mt-8" disabled={running}>
        <legend className="mb-3 font-display text-lg font-semibold">Audio source</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOURCES.map((s) => {
            const unavailable = s.id === "tab" && !tabSupported;
            return (
              <ChoiceCard
                key={s.id}
                name="source"
                value={s.id}
                selected={source === s.id}
                disabled={unavailable || running}
                title={s.title}
                hint={
                  unavailable
                    ? "Not supported in this browser. Use Chrome or Edge on a computer."
                    : s.hint
                }
                icon={s.icon}
                onSelect={() => setSource(s.id)}
              />
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {running ? (
          <button
            onClick={handleStop}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition-colors hover:bg-ink/85"
          >
            <Square size={16} aria-hidden />
            Stop
          </button>
        ) : (
          <button
            onClick={() => start(source)}
            className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white transition-colors hover:bg-signal-deep"
          >
            <Play size={16} aria-hidden />
            {mode === "answers" ? "Start with answers" : "Start captions"}
          </button>
        )}

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
          <button onClick={clear} className="mt-3 text-sm font-semibold text-signal hover:text-signal-deep">
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
          assist={assist}
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
            assist={assist}
          />,
          pipWindow.document.body
        )}
    </main>
  );
}