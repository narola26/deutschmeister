import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq, SYSTEM_PROMPT } from "@/lib/groq";

export type Correction = {
  original: string;
  corrected: string;
  explanation: string;
  rule: string;
};

export type CorrectionResult = {
  score: number;
  corrections: Correction[];
  feedback: string;
  strengths: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { text, prompt, level, grammarFocus, vocabulary } = await request.json();

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Nothing to correct" }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: "Text is too long" }, { status: 400 });
    }

    const instruction = `A ${level ?? "A1"} learner was asked:

"${prompt ?? "Write a few sentences in German."}"

${grammarFocus ? `Today's grammar focus is: ${grammarFocus}\n` : ""}${
      Array.isArray(vocabulary) && vocabulary.length
        ? `Words they have been taught: ${vocabulary.slice(0, 40).join(", ")}\n`
        : ""
    }
They wrote:

"""
${text.trim()}
"""

Before writing your answer, work through the text once for each of these,
and put the results in "checks":
  a) every verb — is it conjugated correctly for its subject?
  b) every preposition — seit, mit, bei, von, zu, nach, aus and gegenüber ALWAYS
     take Dativ, so "seit ein Jahr" is wrong and must be "seit einem Jahr"
  c) every article — does its ending match the gender and case?
  d) the position of every verb in its clause

Then return JSON with exactly these keys:
{
  "checks": {"verbs": "...", "prepositions": "...", "articles": "...", "wordOrder": "..."},
  "score": a number between 0 and 1,
  "corrections": [{"original": the exact wrong fragment, "corrected": the fixed version, "explanation": why in plain English, "rule": a two-to-four word name for the rule}],
  "feedback": one or two encouraging sentences naming the single most useful thing to fix next,
  "strengths": up to three short phrases naming what they genuinely did well
}

CORRECTIONS ARE FOR LANGUAGE ERRORS ONLY. A correction must be one of:
- wrong verb conjugation
- wrong case, article or gender
- wrong word order
- wrong or non-existent word
- missing required word
- spelling

NEVER flag a sentence because it goes beyond the task, adds extra information,
or uses grammar above this level. Writing correct German that was not asked for
is a good thing and must not be corrected or penalised. If every sentence is
correct German, return an empty corrections array even if they ignored the task.

Check carefully for case after prepositions (seit, mit, bei, von, zu and nach
all take Dativ), and for the correct article ending.

SCORING: base the score only on how correct the German is. Do not deduct for
scope, length, or ambition. Text with no language errors scores above 0.9.

Do not invent errors to seem thorough.`;

    const raw = await chatWithGroq(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: instruction },
      ],
      { temperature: 0.3, json: true }
    );

    const parsed = JSON.parse(raw) as CorrectionResult;

    // Never trust a model to stay in range.
    const result: CorrectionResult = {
      score: Math.max(0, Math.min(1, Number(parsed.score) || 0)),
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections.slice(0, 12) : [],
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Correction failed:", error);
    return NextResponse.json(
      { error: "Could not mark that. Please try again." },
      { status: 500 }
    );
  }
}
