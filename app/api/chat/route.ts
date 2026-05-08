import { NextResponse } from "next/server";

type InputMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY. Add it to your local environment file." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as { messages?: InputMessage[] };
    const messages = body?.messages;

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages were provided." }, { status: 400 });
    }

    const startedAt = Date.now();

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.4
      })
    });

    const responseData = (await groqResponse.json()) as GroqResponse & { error?: { message?: string } };

    if (!groqResponse.ok) {
      const errorText = responseData.error?.message || "Groq request failed.";
      return NextResponse.json({ error: errorText }, { status: groqResponse.status });
    }

    const responseTimeMs = Date.now() - startedAt;
    const promptTokens = responseData.usage?.prompt_tokens ?? 0;
    const completionTokens = responseData.usage?.completion_tokens ?? 0;
    const totalTokens = responseData.usage?.total_tokens ?? promptTokens + completionTokens;
    const tokensPerSecond = completionTokens > 0 && responseTimeMs > 0 ? completionTokens / (responseTimeMs / 1000) : 0;

    return NextResponse.json({
      message: responseData.choices?.[0]?.message?.content || "No response was generated.",
      modelName: responseData.model || "llama-3.3-70b-versatile",
      usage: {
        promptTokens,
        completionTokens,
        totalTokens
      },
      responseTimeMs,
      tokensPerSecond
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete request. Please verify your API key and try again." },
      { status: 500 }
    );
  }
}
