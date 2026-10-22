# Digital Twin Chat Tutorial (Beginner-Friendly)

This tutorial explains, step by step, how the **Digital Twin chat** feature was added to this Next.js portfolio site.

It is written for someone who is new to frontend coding and wants to understand both the **big picture** and the **actual code**.

---

## 1) What we built

We added a new feature to the website: a chat section where visitors can ask career-related questions, and an AI “Digital Twin” answers based on Lee Trent’s professional background.

The feature includes:

- A **chat UI** on the homepage
- A **server API route** in Next.js that calls OpenRouter
- A **system prompt** to keep responses aligned to career topics
- Input validation, error handling, and timeout protection
- UX improvements like loading feedback and auto-scroll

---

## 2) Technology summary

### Frontend

- **React** (inside Next.js)
  - Renders UI
  - Tracks chat state (messages, loading status, errors)
- **Tailwind CSS**
  - Styles message bubbles, layout, buttons, and spacing

### Full-stack framework

- **Next.js App Router**
  - `src/app/page.tsx` renders the homepage
  - `src/app/api/.../route.ts` handles server-side API requests

### AI provider

- **OpenRouter** (`openai/gpt-oss-20b`)
  - Receives conversation messages
  - Returns AI-generated answers

### Environment configuration

- `OPENROUTER_API_KEY` stored in `.env.local` or `.env`
- The server route reads the key and sends secure requests to OpenRouter

---

## 3) High-level architecture

Here is the flow when a user asks a question:

1. User types a question in the chat UI.
2. UI sends conversation history to:
   - `POST /api/digital-twin-chat`
3. Server route:
   - validates messages
   - injects system prompt
   - calls OpenRouter model `openai/gpt-oss-20b`
4. Server returns `{ reply: "..." }`.
5. UI appends the assistant response to the chat.
6. If there is a timeout or failure, UI shows a clear error message.

---

## 4) File-by-file walkthrough

## A) `src/app/api/digital-twin-chat/route.ts`

This is the backend endpoint for the chat.

### Purpose

- Protects your API key (never exposed in browser code)
- Defines AI behavior via system prompt
- Validates input and handles errors safely

### Core ideas in this file

#### 1. Route constants and guardrails

You define model + runtime safety limits:

```ts
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-oss-20b";
const OPENROUTER_TIMEOUT_MS = 30000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 2000;
```

Why this matters:

- Prevents very large prompts from growing forever
- Keeps response times stable
- Makes “many-turn” chats less likely to stall

#### 2. System prompt for the Digital Twin

The system prompt tells the model:

- Who it should role-play (career-focused digital twin)
- What facts are known
- What to do when information is unknown

This is how the answers stay professional and on-topic.

#### 3. API key loading

The route checks multiple env file locations and process env:

- `.env.local` / `.env` in `professional-site`
- parent folder fallback

That supports your setup where key may live at project root.

#### 4. Request validation and sanitation

Incoming messages are validated:

- must be array
- role must be `user` or `assistant`
- content must be non-empty string

Then each message is trimmed and capped in length.

#### 5. Timeout + fetch to OpenRouter

The server uses `AbortController` to avoid hanging forever:

```ts
const abortController = new AbortController();
const timeoutId = setTimeout(() => {
  abortController.abort();
}, OPENROUTER_TIMEOUT_MS);
```

OpenRouter request includes:

- Authorization header with API key
- model name
- system prompt + recent message history
- response token cap

#### 6. Structured error responses

If OpenRouter fails/times out, route returns useful errors (`502`/`504`) instead of silent failure.

---

## B) `src/app/components/DigitalTwinChat.tsx`

This is the frontend chat widget users interact with.

### Purpose

- Display conversation
- Accept question input
- Send request to backend
- Show loading and errors

### Important state variables

```ts
const [history, setHistory] = useState<ChatMessage[]>([]);
const [input, setInput] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

These track:

- existing chat turns
- current textbox value
- whether a request is active
- latest error message

### Race-condition protection

Two refs are used to avoid duplicate or stale submissions:

```ts
const historyRef = useRef<ChatMessage[]>([]);
const isSubmittingRef = useRef(false);
```

This prevents accidental overlapping requests and out-of-sync state.

### Request timeout in browser

Client also uses `AbortController` timeout:

```ts
const abortController = new AbortController();
const timeoutId = setTimeout(() => {
  abortController.abort();
}, REQUEST_TIMEOUT_MS);
```

So if network/provider hangs, the UI recovers and user can continue.

### UX improvements

- “Thinking...” bubble while waiting
- Auto-scroll to newest messages
- Inline error message when something goes wrong

This makes it clear what is happening instead of looking “stuck”.

---

## C) `src/app/page.tsx`

This file integrates the chat into the homepage.

### What changed

1. Imported chat component
2. Added nav link (`AI Twin`)
3. Added new section:
   - heading
   - description
   - `<DigitalTwinChat />`

This keeps the feature cleanly modular: page layout in one file, chat logic in its own component file.

---

## D) `README.md`

Documentation was updated so setup is clear:

- You need `OPENROUTER_API_KEY`
- Add it to `.env.local` in `professional-site`
- Restart dev server after env/config changes

This is essential for other developers (or future-you).

---

## 5) End-to-end request lifecycle (beginner mental model)

Think of it like this:

- **Frontend component** = waiter taking your order
- **API route** = kitchen manager
- **OpenRouter model** = chef
- **Response** = food delivered back to your table

The waiter (browser) never sees secret kitchen credentials (API key).  
Only the manager (server route) uses those credentials.

---

## 6) Practical testing that was done

To confirm the feature worked, we validated:

- `npm run lint`
- `npm run build`
- Multi-turn request testing
- Browser behavior testing for turn 3+ stability

We also added protections for:

- double submit/race conditions
- hanging requests
- long context growth
- confusing “no visible reply” states

---

## 7) Common beginner gotchas (and fixes)

### “It answered once, then stopped.”

Possible causes:

- overlapping submits
- request timeout/hang
- response is below scroll viewport

Fixes implemented:

- submit guard
- timeout handling
- auto-scroll + loading bubble + visible errors

### “I updated `.env` but nothing changed.”

You must restart `npm run dev` after env changes.

### “Why not call OpenRouter directly from browser?”

Because that would expose your API key publicly in client code.  
Always call OpenRouter from a server route.

---

## 8) Code samples: minimal “core path”

### UI sends chat messages

```ts
const response = await fetch("/api/digital-twin-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: nextHistory }),
  signal: abortController.signal,
});
```

### API route forwards to OpenRouter

```ts
response = await fetch(OPENROUTER_API_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: OPENROUTER_MODEL,
    messages: [{ role: "system", content: DIGITAL_TWIN_SYSTEM_PROMPT }, ...boundedMessages],
    max_tokens: 350,
  }),
  signal: abortController.signal,
});
```

### API returns assistant reply

```ts
const reply = data.choices?.[0]?.message?.content?.trim();
return NextResponse.json({ reply });
```

---

## 9) Self-review: 5 ways to improve this implementation

1. **Add persistent chat history**
   - Save conversations in localStorage or a database so reloads do not reset chat.

2. **Add server-side rate limiting**
   - Prevent abuse and control cost by limiting requests per IP/session.

3. **Add observability and structured logs**
   - Capture request IDs, latency, status codes, and provider errors for easier production debugging.

4. **Improve rendering of AI output**
   - Support markdown rendering and safe formatting for lists/headings/code in replies.

5. **Add automated tests**
   - Unit tests for message sanitization and integration tests for multi-turn flow and timeout behavior.

---

## Final note

You now have a working beginner-friendly full-stack AI feature:

- frontend React chat component
- server API proxy route
- provider integration with secure key handling
- robustness and UX improvements for real multi-turn usage

If you want, a natural next tutorial can cover:

- storing conversations in a database
- adding user identity/auth
- switching from simple prompting to RAG with your own documents.

