// Fast, free, client-side check for "was a question just asked?".
// It is deliberately generous. The model replies NO_QUESTION when it is not one.

const STARTERS =
  /^(who|what|when|where|why|how|which|whose|can|could|would|will|do|does|did|is|are|was|were|have|has|should|tell me|walk me through|describe|explain|talk (to me )?about|give me an example)\b/i;

const FILLER = /^(right|ok|okay|yeah|yes|no|you know|isn't it|aren't you)\s*\?$/i;

export function isQuestion(text: string): boolean {
  const t = text.trim();
  if (t.length < 8 || FILLER.test(t)) return false;
  if (t.endsWith("?")) return true;

  // Whisper sometimes drops the "?", so also check how the last sentence starts.
  const sentences = t.split(/(?<=[.!?])\s+/);
  const last = sentences[sentences.length - 1] ?? "";
  return STARTERS.test(last) && last.split(/\s+/).length >= 4;
}