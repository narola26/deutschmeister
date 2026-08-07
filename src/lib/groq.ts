const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Verified live on the Groq free tier. */
export const MODEL = "llama-3.3-70b-versatile";
export const FAST_MODEL = "llama-3.1-8b-instant";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatWithGroq(
  messages: Message[],
  opts: { temperature?: number; json?: boolean; model?: string } = {}
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? MODEL,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: 2048,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

/**
 * The AI is a marker and a coach, never an author of the syllabus.
 * It corrects what the learner produced against rules that live in
 * the fixed content — it does not invent grammar or vocabulary.
 */
export const SYSTEM_PROMPT = `You are Sprachstufe, an exacting but encouraging German tutor.

Rules you never break:
- Correct German only. If you are unsure of a gender, plural or form, say so rather than guessing.
- Explain every correction in plain English so the learner understands the rule, not just the fix.
- Judge work against the learner's stated CEFR level. Do not penalise a beginner for missing advanced structures.
- Be specific. "Word order is wrong" is useless; "the verb must be second — Heute ich gehe should be Heute gehe ich" is useful.
- Never invent vocabulary the learner has not been taught when a simpler word exists.`;
