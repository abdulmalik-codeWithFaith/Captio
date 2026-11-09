"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioSource = "tab" | "mic";
export type CaptionStatus = "idle" | "starting" | "listening";
export interface CaptionLine {
  id: number;
  text: string;
}

// Each segment is a standalone audio file. 6s keeps latency low while staying
// under the free tier's 20 requests/minute.
const SEGMENT_MS = 6000;
// Segments quieter than this are skipped: saves quota and avoids Whisper
// inventing text from silence.
const SILENCE_PEAK = 0.02;

function pickMimeType(): string | undefined {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return options.find((m) => MediaRecorder.isTypeSupported(m));
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError")
      return "Permission was denied. Allow access and try again.";
    if (err.name === "NotFoundError") return "No microphone was found.";
  }
  return err instanceof Error ? err.message : "Could not start audio capture.";
}

export function useLiveCaptions() {
  const [status, setStatus] = useState<CaptionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<CaptionLine[]>([]);
  const [paused, setPausedState] = useState(false);
  const [level, setLevel] = useState(0);

  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const segmentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meterTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const peakRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const idRef = useRef(0);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (segmentTimer.current) clearTimeout(segmentTimer.current);
    if (meterTimer.current) clearInterval(meterTimer.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    recorderRef.current = null;
    setLevel(0);
    setStatus("idle");
  }, []);

  const sendSegment = useCallback(async (blob: Blob) => {
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const form = new FormData();
    form.append("audio", blob, `segment.${ext}`);
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Translation failed.");
        return;
      }
      setError(null);
      if (data.text) {
        setLines((prev) => [...prev, { id: idRef.current++, text: data.text }]);
      }
    } catch {
      setError("Could not reach the server. Check your connection.");
    }
  }, []);

  const start = useCallback(
    async (source: AudioSource) => {
      if (activeRef.current) return;
      setError(null);
      setStatus("starting");

      try {
        let stream: MediaStream;
        if (source === "mic") {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
        } else {
          // Browsers require video: true here even though we only use the audio.
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
          if (stream.getAudioTracks().length === 0) {
            stream.getTracks().forEach((t) => t.stop());
            throw new Error(
              "No audio was shared. Choose a browser tab and turn on Share tab audio."
            );
          }
        }

        streamRef.current = stream;
        activeRef.current = true;
        stream.getTracks().forEach((t) => t.addEventListener("ended", stop));

        const audioStream = new MediaStream(stream.getAudioTracks());

        // Level meter + silence detection
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        ctx.createMediaStreamSource(audioStream).connect(analyser);
        const buf = new Float32Array(analyser.fftSize);
        meterTimer.current = setInterval(() => {
          analyser.getFloatTimeDomainData(buf);
          let peak = 0;
          for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
          peakRef.current = Math.max(peakRef.current, peak);
          setLevel(peak);
        }, 100);

        const mimeType = pickMimeType();

        const runSegment = () => {
          if (!activeRef.current) return;
          const rec = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
          recorderRef.current = rec;
          const chunks: Blob[] = [];
          peakRef.current = 0;

          rec.ondataavailable = (e) => {
            if (e.data.size) chunks.push(e.data);
          };
          rec.onstop = () => {
            const peak = peakRef.current;
            runSegment(); // start the next segment right away
            if (pausedRef.current || peak < SILENCE_PEAK || chunks.length === 0) return;
            const blob = new Blob(chunks, { type: rec.mimeType });
            // Queue so captions always appear in order
            queueRef.current = queueRef.current.then(() => sendSegment(blob));
          };

          rec.start();
          segmentTimer.current = setTimeout(() => {
            if (rec.state !== "inactive") rec.stop();
          }, SEGMENT_MS);
        };

        runSegment();
        setStatus("listening");
      } catch (err) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        activeRef.current = false;
        setStatus("idle");
        setError(describeError(err));
      }
    },
    [sendSegment, stop]
  );

  const setPaused = useCallback((value: boolean) => {
    pausedRef.current = value;
    setPausedState(value);
  }, []);

  const clear = useCallback(() => setLines([]), []);

  useEffect(() => stop, [stop]); // clean up on unmount

  return { status, error, lines, paused, level, start, stop, setPaused, clear };
}