import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq, SYSTEM_PROMPT } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const systemMessage = context
      ? `${SYSTEM_PROMPT}\n\nAdditional context: ${context}`
      : SYSTEM_PROMPT;

    const fullMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages,
    ];

    const reply = await chatWithGroq(fullMessages);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
