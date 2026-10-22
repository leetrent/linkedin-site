import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-oss-20b";
const OPENROUTER_TIMEOUT_MS = 30000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 2000;

const DIGITAL_TWIN_SYSTEM_PROMPT = `You are Lee Trent's "Digital Twin" for his professional website.
Your job is to answer career-related questions using the profile details below.
If asked about something not covered here, be transparent and avoid inventing details.
Keep responses professional, concise, and helpful.
Keep each answer under 140 words unless the user explicitly asks for a deep dive.

Profile summary:
- Name: Lee Trent
- Location: Kansas City metro area (Missouri)
- Experience: 30 years of software engineering
- Current role: Owner & Software Engineer at TrentTEK LLC (2021–Present)
- Focus: Enterprise software consulting and AI engineering
- AI expertise: LLM systems, RAG, QLoRA fine-tuning, agentic workflows
- Prior experience:
  - Application Architect / Senior Developer (2009–2021): secure federal/public systems, MFA workflows, large-scale HR/payroll data-quality platforms
  - Application Developer (1997–2009): enterprise platforms in insurance, telecommunications, government
- Core stacks and domains:
  - .NET / ASP.NET Core
  - Java / Spring
  - Oracle, MySQL, SQL Server
  - Secure authentication patterns
  - Enterprise architecture and mission-critical delivery

Important:
- Stay focused on Lee's career, experience, skills, and professional background.
- Do not claim private contact details beyond what users can already see on the site.
- If a question needs unknown specifics (exact dates, names, metrics), acknowledge limits and suggest reaching out directly.`;

async function readKeyFromEnvFile(filePath: string): Promise<string | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.split(/\r?\n/);
    const match = lines.find((line) =>
      line.startsWith("OPENROUTER_API_KEY="),
    );

    if (!match) {
      return null;
    }

    const value = match.slice("OPENROUTER_API_KEY=".length).trim();
    return value.length > 0 ? value : null;
  } catch (error) {
    const errorCode =
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "";

    if (errorCode === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function getOpenRouterApiKey(): Promise<string | null> {
  const envKey = process.env.OPENROUTER_API_KEY?.trim();
  if (envKey) {
    return envKey;
  }

  const candidateFiles = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env.local"),
    path.resolve(process.cwd(), "..", ".env"),
  ];

  for (const candidateFile of candidateFiles) {
    const fileKey = await readKeyFromEnvFile(candidateFile);
    if (fileKey) {
      return fileKey;
    }
  }

  return null;
}

export async function POST(request: Request) {
  let apiKey: string | null;
  try {
    apiKey = await getOpenRouterApiKey();
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to read environment configuration for OPENROUTER_API_KEY.",
      },
      { status: 500 },
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENROUTER_API_KEY is missing. Add it to .env.local/.env and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: ChatRequest;

  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON payload." },
      { status: 400 },
    );
  }

  const incomingMessages = body.messages;

  if (!Array.isArray(incomingMessages)) {
    return NextResponse.json(
      { error: "Invalid messages payload. Expected an array of messages." },
      { status: 400 },
    );
  }

  const sanitizedMessages = incomingMessages
    .filter((message) => {
      if (!message || typeof message !== "object") {
        return false;
      }

      if (message.role !== "user" && message.role !== "assistant") {
        return false;
      }

      return (
        typeof message.content === "string" && message.content.trim().length > 0
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }));

  if (sanitizedMessages.length === 0) {
    return NextResponse.json(
      { error: "Please provide at least one non-empty chat message." },
      { status: 400 },
    );
  }

  const boundedMessages = sanitizedMessages.slice(-MAX_HISTORY_MESSAGES);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, OPENROUTER_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Lee Trent Professional Site",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: DIGITAL_TWIN_SYSTEM_PROMPT },
          ...boundedMessages,
        ],
        temperature: 0.4,
        max_tokens: 350,
      }),
      signal: abortController.signal,
    });
  } catch (error) {
    const isAbortError =
      error instanceof DOMException && error.name === "AbortError";

    return NextResponse.json(
      {
        error: isAbortError
          ? "OpenRouter request timed out. Please try again."
          : "OpenRouter request failed before completion.",
      },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      {
        error: `OpenRouter request failed with status ${response.status}.`,
        details: errorText,
      },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    return NextResponse.json(
      { error: "OpenRouter returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ reply });
}
