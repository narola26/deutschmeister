const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatWithGroq(messages: Message[], temperature = 0.7) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages,
      temperature,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Groq API error: ${res.status} ${error}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export const SYSTEM_PROMPT = `You are DeutschMeister, an expert German language tutor. You help students learn German from absolute beginner (A1) to professional fluency (B2).

Your teaching style:
- Always provide the German word/phrase, its English translation, and an example sentence
- Explain grammar rules clearly with simple examples
- Correct mistakes gently and explain why something is wrong
- Use the student's current level to adjust difficulty
- Focus on practical, everyday German and professional/workplace vocabulary
- When speaking German, also provide the English translation in parentheses

You are patient, encouraging, and systematic. You celebrate progress and make learning fun.`;
