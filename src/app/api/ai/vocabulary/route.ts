import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { level, topic, count = 30 } = await request.json();

    const prompt = `Generate ${count} German vocabulary words for a ${level || "A1"} level student${topic ? ` about the topic: ${topic}` : ""}.

Return a JSON array with exactly ${count} objects, each having:
- "german": the German word (include article for nouns, e.g. "der Tisch")
- "english": the English translation
- "sentence": an example sentence in German using the word
- "sentence_translation": the English translation of the example sentence
- "type": one of "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "phrase"
- "gender": for nouns only, one of "der", "die", "das" (null for non-nouns)

Return ONLY the JSON array, no other text.`;

    const reply = await chatWithGroq(
      [{ role: "user", content: prompt }],
      0.8
    );

    const cleaned = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const words = JSON.parse(cleaned);

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Vocabulary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate vocabulary" },
      { status: 500 }
    );
  }
}
