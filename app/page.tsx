"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Copy,
  GripHorizontal,
  Languages,
  Mic,
  Monitor,
  Pause,
} from "lucide-react";

const STEPS = [
  {
    icon: Monitor,
    title: "Pick what to listen to",
    body: "Share a browser tab, such as Google Meet or YouTube, or use your microphone.",
  },
  {
    icon: Languages,
    title: "We detect and translate",
    body: "Speech is recognized in its original language or accent and turned into English.",
  },
  {
    icon: GripHorizontal,
    title: "Read in a floating window",
    body: "Move the caption window anywhere and keep your eyes on the meeting.",
  },
];

/** Static illustration of the caption window. Not live output. */
function CaptionWindowExample() {
  const area = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={area}
      className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-line bg-[#dfe5ef] sm:h-[400px]"
    >
      {/* A stand-in for the meeting the person is watching */}
      <div className="absolute inset-x-6 top-6 grid grid-cols-2 gap-3 opacity-70">
        <div className="h-28 rounded-lg bg-[#c7d0df] sm:h-36" />
        <div className="h-28 rounded-lg bg-[#b9c4d7] sm:h-36" />
      </div>
      <p className="absolute left-6 top-[10.5rem] text-sm text-muted sm:top-[13rem]">
        Drag the caption window anywhere.
      </p>

      <motion.div
        drag
        dragConstraints={area}
        dragMomentum={false}
        dragElastic={0.05}
        whileDrag={{ scale: 1.02 }}
        className="absolute bottom-6 left-1/2 w-[min(92%,30rem)] -translate-x-1/2 cursor-grab rounded-xl bg-ink p-4 text-white shadow-xl shadow-ink/30 active:cursor-grabbing"
        role="group"
        aria-label="Example caption window"
      >
        <div className="mb-3 flex items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-2">
            <GripHorizontal size={16} aria-hidden />
            Example. Not live.
          </span>
          <span className="flex items-center gap-3">
            <Pause size={14} aria-hidden />
            <Copy size={14} aria-hidden />
          </span>
        </div>
        <p className="text-lg leading-snug sm:text-xl">
          <span className="text-white/60">Let&rsquo;s revisit the release date </span>
          <span className="text-caption">
            once the API changes are reviewed on Thursday.
          </span>
        </p>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Captio
        </Link>
        <Link
          href="/translate"
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-signal hover:text-signal"
        >
          Open captions
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-14">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Understand every speaker, whatever the accent or language.
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted">
              Captio listens to a meeting, video or class and shows live English
              captions in a window you can move. No account, no waiting for the
              recording.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/translate"
                className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white transition-colors hover:bg-signal-deep"
              >
                Start captions
                <ArrowRight size={18} aria-hidden />
              </Link>
              <span className="flex items-center gap-2 text-sm text-muted">
                <Mic size={16} aria-hidden />
                Works with your mic or a shared tab
              </span>
            </div>
          </div>

          <CaptionWindowExample />
        </section>

        {/* How it works: a real sequence, so numbered */}
        <section
          aria-labelledby="how"
          className="border-t border-line bg-surface"
        >
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
            <h2
              id="how"
              className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
            >
              How it works
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper font-display font-bold text-signal">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                      {title}
                      <Icon size={16} className="text-muted" aria-hidden />
                    </h3>
                    <p className="mt-1 max-w-[26rem] leading-relaxed text-muted">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Honest limits, stated up front */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            What to expect
          </h2>
          <p className="mt-4 max-w-[40rem] leading-relaxed text-muted">
            Tab audio capture works in Chrome and Edge on desktop, and you
            choose Share tab audio when prompted. A website can&rsquo;t listen
            to other apps on your computer, so for those, use your microphone or
            a browser tab.
          </p>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-6 text-sm text-muted sm:px-8">
          Captions are generated automatically and may contain errors.
        </div>
      </footer>
    </MotionConfig>
  );
}