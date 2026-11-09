import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Short live segments are small. This only guards against abuse.
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Receives one short audio segment, detects its language and returns English text.
 * Uses Groq's hosted Whisper "translations" endpoint, which outputs English
 * for any supported input language and also handles English accents.
 * The API key stays on the server (GROQ_API_KEY in .env.local).
 */
export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "The server is missing GROQ_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  let audio: FormDataEntryValue | null;
  try {
    audio = (await req.formData()).get("audio");
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "No audio received." }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio segment too large." }, { status: 413 });
  }

  const body = new FormData();
  body.append("file", audio, audio.name || "segment.webm");
  body.append("model", "whisper-large-v3"); // the turbo model does not support translation
  body.append("response_format", "json");
  body.append("temperature", "0");

  const res = await fetch("https://api.groq.com/openai/v1/audio/translations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body,
  });

  if (res.status === 429) {
    return NextResponse.json(
      { error: "Free usage limit reached. Wait a minute and captions will resume." },
      { status: 429 }
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      { error: "The translation service had a problem. Trying the next segment." },
      { status: 502 }
    );
  }

  const data = (await res.json()) as { text?: string };
  return NextResponse.json({ text: (data.text ?? "").trim() });
}