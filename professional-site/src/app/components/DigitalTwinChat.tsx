"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I’m Lee’s Digital Twin. Ask me anything about his career journey, technical background, or AI engineering experience.",
};
const REQUEST_TIMEOUT_MS = 30000;

export default function DigitalTwinChat() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<ChatMessage[]>([]);
  const isSubmittingRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messages = [starterMessage, ...history];

  useEffect(() => {
    if (!messagesContainerRef.current) {
      return;
    }

    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [history, isSubmitting, error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    const previousHistory = historyRef.current;
    const nextHistory: ChatMessage[] = [...previousHistory, { role: "user", content: question }];

    setHistory(nextHistory);
    historyRef.current = nextHistory;
    setInput("");
    setError(null);
    setIsSubmitting(true);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/digital-twin-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
        signal: abortController.signal,
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !payload.reply) {
        throw new Error(
          payload.error || "Something went wrong while asking the Digital Twin.",
        );
      }

      const resolvedHistory: ChatMessage[] = [
        ...nextHistory,
        { role: "assistant", content: payload.reply as string },
      ];
      setHistory(resolvedHistory);
      historyRef.current = resolvedHistory;
    } catch (caughtError) {
      const message = (() => {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return "Request timed out. Please try again.";
        }

        return caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while requesting a response.";
      })();
      setError(message);
      const erroredHistory: ChatMessage[] = [
        ...previousHistory,
        {
          role: "assistant",
          content: `Sorry — I hit an error: ${message}`,
        },
      ];
      setHistory(erroredHistory);
      historyRef.current = erroredHistory;
    } finally {
      clearTimeout(timeoutId);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:p-8">
      <h3 className="text-2xl font-bold text-slate-100">Ask Lee&apos;s Digital Twin</h3>
      <p className="mt-2 text-sm text-slate-300">
        Ask career-focused questions and get AI responses grounded in Lee&apos;s
        professional background.
      </p>

      <div
        ref={messagesContainerRef}
        className="mt-6 max-h-[26rem] space-y-3 overflow-y-auto pr-1"
      >
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-6 border-violet-300/35 bg-violet-400/10 text-violet-50"
                : "mr-6 border-cyan-300/35 bg-cyan-400/10 text-cyan-50"
            }`}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-85">
              {message.role === "user" ? "You" : "Digital Twin"}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </article>
        ))}
        {isSubmitting ? (
          <article className="mr-6 rounded-2xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-3 text-sm leading-relaxed text-cyan-50">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-85">
              Digital Twin
            </p>
            <p>Thinking...</p>
          </article>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/50 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label htmlFor="digital-twin-input" className="sr-only">
          Ask the Digital Twin a career question
        </label>
        <textarea
          id="digital-twin-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: What enterprise AI projects has Lee led?"
          className="min-h-[100px] w-full rounded-2xl border border-white/15 bg-[#0a1122] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || input.trim().length === 0}
          className="inline-flex rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-[#04111e] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? "Thinking..." : "Ask Digital Twin"}
        </button>
      </form>
    </div>
  );
}
