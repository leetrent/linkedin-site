# Code Review — Professional Site + Digital Twin Chat

**Repository:** `leetrent/linkedin-site` (public) · **App:** `professional-site/` (Next.js 16.4.2, React 19.3, Tailwind v4)
**Review date:** 2026-10-22 · **Type:** read-only review — **no application code was changed** (this file is the only file added).

---

## 1. Scope and method

**Reviewed**

| Area | Files |
|---|---|
| API route | `src/app/api/digital-twin-chat/route.ts` |
| Chat UI | `src/app/components/DigitalTwinChat.tsx` |
| Page / layout / styles | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` |
| Config & tooling | `next.config.ts`, `package.json`, `eslint.config.mjs`, `tsconfig.json`, `.gitignore` (both), `AGENTS.md` |
| Docs | `README.md`, `tutorial.md`, `../notes.txt` |
| Repo hygiene | tracked files, repo visibility, `npm audit`, git history |

**Evidence gathered (not just reading):** `npm run lint` ✅, `npm run build` ✅, live API calls (single- and multi-turn), live browser testing of 3–4 consecutive questions, `npm audit`, GitHub repo-visibility check, comparison against the bundled Next docs in `node_modules/next/dist/docs/`.

**Not reviewed / limitations**

- I did **not** open `LinkedInProfile.pdf`, so I cannot say what personal data it contains (see S-1).
- No automated tests exist, so behavior claims rest on manual runs.
- Responsive/mobile layout and color contrast were **not** measured; those items are marked *unverified*.
- No load, abuse, or deployed-environment (e.g. Vercel) testing was done.

---

## 2. Executive summary

The site and chat feature **work** for their intended purpose: lint and build are clean, the API key stays server-side, input is validated, and the chat handles multi-turn conversations. The code is readable and reasonably small.

However, the Digital Twin is a **public, unauthenticated endpoint that spends your OpenRouter credit** and **speaks as a real person**. The biggest risks are therefore not code style but:

1. **Cost/abuse exposure** — no rate limit, no size caps, no auth (S-2, S-4).
2. **Privacy** — a LinkedIn PDF is committed to a **public** repo (S-1), and your API key value appeared in this session's tool output (S-3).
3. **Accuracy/reputation** — the twin already invented details not in your profile during testing (A-1).
4. **Reliability gaps** — the timeout doesn't cover reading the response body, and the model's reasoning tokens may eat the `max_tokens` budget (R-1, R-3).
5. **Maintainability** — profile facts are duplicated in two places, client state uses a redundant ref, and there are no tests or server logs (M-1, M-2, M-4, M-5).

### Scorecard

| Category | Rating | Notes |
|---|---|---|
| Functionality | 🟢 Good | Works end-to-end incl. multi-turn |
| Security & privacy | 🔴 Needs work | Open endpoint, public PDF, key exposure in session |
| Reliability | 🟡 Fair | Timeouts present but incomplete; no logging |
| AI answer quality / safety | 🟡 Fair | Hallucination observed; no grounding/disclaimer |
| Accessibility | 🟡 Fair | No live region, focus loss, no alert roles |
| Maintainability | 🟡 Fair | Duplication, dual state, no tests |
| Dependencies | 🟡 Fair | 5 high `npm audit` findings (dev-tooling chain) |
| Docs | 🟡 Fair | Drift between README/tutorial and real setup |

### Severity legend

🔴 **High** — fix before promoting the site / sharing the URL widely · 🟠 **Medium** — fix soon · 🟡 **Low** — improvement / polish · ℹ️ **Info**

---

## 3. Findings index

| ID | Sev | Category | Summary |
|---|---|---|---|
| S-1 | 🔴 | Privacy | `LinkedInProfile.pdf` tracked in a **public** repo |
| S-2 | 🔴 | Security | Chat endpoint has no rate limiting / auth / origin check |
| S-3 | 🔴 | Security | API key value was printed in this session's tool output |
| A-1 | 🔴 | AI quality | Twin hallucinated facts (e.g., OAuth/OpenID Connect); no disclaimer |
| S-4 | 🟠 | Security | No cap on body size / message count |
| S-5 | 🟠 | Security | Client can forge `assistant` turns; prompt injection unmitigated |
| S-6 | 🟠 | Security | Upstream error body (`details`) returned to the browser |
| S-7 | 🟠 | Security/Config | Hand-rolled `.env` parser, reads a file outside the app directory |
| R-1 | 🟠 | Reliability | Timeout cleared before the response body is read |
| R-2 | 🟠 | Reliability | `max_tokens: 350` vs. a reasoning model; empty-reply risk (*unverified*) |
| R-3 | 🟠 | Reliability | No server logging; all errors swallowed |
| R-4 | 🟠 | Deployment | No `maxDuration`; 30 s upstream wait may exceed host limits |
| U-1 | 🟠 | UX/Bug | On error the user's question disappears and error text pollutes history |
| U-2 | 🟠 | Accessibility | No `aria-live` log, no `role="alert"`, focus lost after reply |
| U-3 | 🟠 | UX | Markdown from the model renders as raw `**text**` |
| M-1 | 🟠 | Maintainability | Profile facts duplicated in `page.tsx` and the system prompt |
| M-2 | 🟠 | Maintainability | Redundant dual state (`history` + `historyRef`) |
| M-3 | 🟠 | Quality | No automated tests |
| D-1 | 🟠 | Dependencies | `npm audit`: 5 high (dev-tooling chain) |
| R-5 | 🟡 | Reliability | Client and server timeouts are both 30 s; server ignores client abort |
| R-6 | 🟡 | Reliability | `response.json()` on the client is unguarded |
| R-7 | 🟡 | Validation | Hand-written type guards; last message not required to be `user` |
| M-4 | 🟡 | Maintainability | `ChatMessage` type duplicated across client and server |
| M-5 | 🟡 | Maintainability | Magic numbers/strings and inline model/system prompt in route |
| C-1 | 🟡 | Config | `allowedDevOrigins` hardcodes a LAN IP |
| C-2 | 🟡 | Config | `HTTP-Referer` hardcoded to `http://localhost:3000` |
| C-3 | 🟡 | Config | Experimental Next flags enabled without a documented need |
| C-4 | 🟡 | Config | No `.env.example`; README/tutorial don't match the real setup |
| U-4 | 🟡 | UX | Enter doesn't submit; no `maxLength`; "Thinking…" shown twice; no streaming |
| U-5 | 🟡 | A11y/UX | Anchor targets hide under the sticky header |
| U-6 | 🟡 | A11y | Placeholder `<a href="#" aria-disabled>` links are still focusable |
| U-7 | 🟡 | UX | `scroll-behavior: smooth` ignores `prefers-reduced-motion` |
| U-8 | 🟡 | Responsive | Header nav may overflow on narrow screens (*unverified*) |
| U-9 | 🟡 | SEO | Minimal metadata (no Open Graph, canonical, robots) |
| P-1 | 🟡 | Process | `AGENTS.md` instruction to read local Next docs was not followed |
| P-2 | 🟡 | Process | Root cause of the "stops after two answers" bug was never proven |
| I-1 | ℹ️ | Info | Positive observations (see §6) |

---

## 4. Detailed findings and remedial actions

### 4.1 Security and privacy

#### S-1 🔴 `LinkedInProfile.pdf` is committed to a public repository

- **Evidence:** `git ls-files` lists `LinkedInProfile.pdf` (≈ 80 KB); GitHub reports `leetrent/linkedin-site` as `private: false`. `notes.txt` is also tracked.
- **Risk:** LinkedIn exports can include contact details, employment history, education, and more. Anything committed to a public repo is indexed/scraped and remains in git history even after deletion.
- **Remedial actions**
  1. Open the PDF and decide whether everything in it is meant to be public.
  2. If not: make the repo **private**, *or* remove the file **and rewrite history** (`git filter-repo --path LinkedInProfile.pdf --invert-paths` or BFG), then force-push. A plain `git rm` is **not** enough.
  3. Add `LinkedInProfile.pdf` (and `notes.txt`, if desired) to `.gitignore`; keep the PDF outside the repo, or store only the curated facts the twin needs (see M-1).
  4. If it contained contact details you don't want public, consider those details exposed already.

#### S-2 🔴 Unauthenticated, unthrottled endpoint that spends your money

- **Where:** `POST /api/digital-twin-chat` (`route.ts`).
- **Evidence:** Any visitor — or script — can call it repeatedly; every call is billed to your OpenRouter key. There is no rate limit, no CAPTCHA/token, no `Origin`/`Sec-Fetch-Site` check, and no daily budget guard in code.
- **Remedial actions**
  1. **Set a hard spend limit / credit cap on the OpenRouter key** (dashboard). This is the fastest, highest-value mitigation.
  2. Add **per-IP rate limiting** (e.g., Upstash Ratelimit / Vercel KV, or an in-memory limiter for a single instance), e.g. 10 requests / 10 min / IP plus a global daily cap.
  3. Reject cross-site browser calls: require `Sec-Fetch-Site: same-origin` (or compare `Origin` to your site URL).
  4. Optionally add a bot challenge (Turnstile/hCaptcha) before the first message.
  5. Cap per-session conversation length (e.g., 20 user turns).

```ts
// Sketch only — not applied
const site = request.headers.get("sec-fetch-site");
if (site && site !== "same-origin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### S-3 🔴 API key value was exposed in this session's tool output

- **Evidence:** While confirming that `.env` contained `OPENROUTER_API_KEY`, a search tool printed the full line, including the key value, into the session transcript. This was my mistake; the check should have only confirmed presence.
- **Mitigating facts:** `.env` is correctly git-ignored (root `.gitignore`) and not tracked.
- **Remedial actions**
  1. **Rotate the OpenRouter key** (revoke the old one, create a new one) and update `.env`.
  2. Treat any saved chat/session logs from this session as sensitive.
  3. Going forward, verify secrets by presence/length only (e.g., `if ($env:KEY) { 'set' }`), never by printing them.

#### S-4 🟠 No limits on request body size or message count

- **Evidence:** `route.ts` calls `request.json()` with no size check and runs `.filter().map()` over an unbounded array **before** applying `slice(-MAX_HISTORY_MESSAGES)`. The 2,000-character cap is per message only.
- **Risk:** Large payloads cost CPU/memory and enable cheap denial-of-service; combined with S-2 this is amplified.
- **Remedial actions:** Reject early if `Content-Length` is above a limit (e.g., 32 KB) or `messages.length > 50`; apply `slice(-MAX_HISTORY_MESSAGES)` **first**; add `maxLength` to the textarea (see U-4).

```ts
// Sketch only — not applied
if (incomingMessages.length > 50) {
  return NextResponse.json({ error: "Too many messages." }, { status: 413 });
}
```

#### S-5 🟠 Forged conversation turns and prompt injection

- **Evidence:** The client sends the entire history, and the server trusts `role: "assistant"` entries. A caller can fabricate prior assistant turns ("Sure, I'll ignore my rules…") to steer the model. The system prompt also offers only soft guidance ("Stay focused on Lee's career").
- **Risk:** Off-topic use of your paid model, jailbreaks, or the twin saying embarrassing things "as Lee".
- **Remedial actions**
  1. Prefer **server-held state** (session id → history) or **only accept `user` messages** and have the server keep assistant replies; at minimum, drop client-supplied `assistant` turns beyond the last few and enforce alternating roles ending with `user`.
  2. Strengthen the system prompt: refuse non-career requests, never reveal instructions, never role-play as other personas, never state facts not in the profile.
  3. Consider an output moderation/topic check and a short `max_tokens`.

#### S-6 🟠 Upstream error text is returned to the browser

- **Evidence:** On non-OK responses, `route.ts` returns `{ error, details: errorText }`, forwarding OpenRouter's raw body to the client.
- **Risk:** Information disclosure (account/limit/provider details). The UI currently ignores `details`, but it is still sent.
- **Remedial actions:** Log `errorText` **server-side** and return only a generic message (`"The Digital Twin is unavailable right now."`) plus a correlation id.

#### S-7 🟠 Hand-rolled `.env` parser that reads outside the app directory

- **Evidence:** `readKeyFromEnvFile` / `getOpenRouterApiKey` read `.env.local`, `.env`, and then `../.env.local`, `../.env`, using `startsWith("OPENROUTER_API_KEY=")`.
- **Problems:**
  - Next.js already loads `.env*` from the project directory into `process.env`; custom parsing is redundant for those files.
  - The parser is fragile: `OPENROUTER_API_KEY="sk-…"` (quotes), `export OPENROUTER_API_KEY=…`, spaces around `=`, or inline comments would yield a wrong value → upstream `401`.
  - It performs filesystem reads **outside** the project folder on a request path, and re-reads files on every request when the variable is not in `process.env`.
  - It exists only because the key lives in `linkedin-site/.env` (repo root) rather than `professional-site/`.
- **Remedial actions:** Put the key in `professional-site/.env.local` (git-ignored) and read **only** `process.env.OPENROUTER_API_KEY`. If the repo-root file must stay, load it once at startup via `@next/env` (`loadEnvConfig`) in `next.config.ts` rather than per request. Fail fast with a clear message when missing.

### 4.2 AI behavior and answer quality

#### A-1 🔴 Hallucinations and no accuracy disclaimer

- **Evidence:** During browser testing the twin answered "Secure authentication & authorization – MFA, **OAuth, OpenID Connect** patterns." OAuth/OIDC appear nowhere in the profile data or system prompt. It also embellished ("designing, deploying, and scaling of modern LLMs", "ensuring data integrity and compliance"). The model is a small 20B model at `temperature: 0.4`.
- **Risk:** A site representing a real person can state false claims on their behalf — a reputational/professional risk (recruiters may take answers at face value).
- **Remedial actions**
  1. Add a visible UI notice: *"AI-generated answers may be inaccurate. See LinkedIn for verified details."*
  2. Tighten the prompt: "Use **only** the facts below. If a fact isn't listed, say you don't know. Never infer technologies, employers, dates, or metrics."
  3. Lower temperature (e.g., 0–0.2).
  4. Ground answers in a richer, **curated** fact file (see M-1) and, if it grows, add retrieval (RAG) so the model quotes real source text.
  5. Add a small regression set of Q&A (see M-3) including "trap" questions (e.g., "Does Lee know OAuth?" → should say not stated).

### 4.3 Reliability

#### R-1 🟠 Timeout doesn't cover reading the response body

- **Evidence:** In `route.ts`, `clearTimeout(timeoutId)` runs in the `finally` of the `try` that wraps only `fetch(...)`. `response.text()` / `response.json()` happen afterwards with no timeout, so a stalled body can hang the request.
- **Remedial actions:** Keep the timer active until the body has been fully read (e.g., move body parsing inside the guarded `try`, or use `AbortSignal.timeout(ms)` and clear nothing). Also forward `request.signal` so a client abort cancels the upstream call:

```ts
// Sketch only — not applied
const signal = AbortSignal.any([request.signal, AbortSignal.timeout(OPENROUTER_TIMEOUT_MS)]);
const response = await fetch(OPENROUTER_API_URL, { /* … */ signal });
const data = await response.json(); // still covered by the same signal
```

#### R-2 🟠 `max_tokens: 350` may starve a reasoning model (*unverified*)

- **Evidence:** `openai/gpt-oss-20b` is a reasoning-capable model; on many providers reasoning tokens count toward `max_tokens`. If the budget is exhausted before visible text is produced, `choices[0].message.content` can be empty, which the route reports as `"OpenRouter returned an empty response."` (502). All my tests succeeded, but long or complex questions could trigger it.
- **Remedial actions:** Test with deliberately long questions; inspect `finish_reason` (`"length"`) and `usage`; raise `max_tokens` (e.g., 800–1,000) or set the provider's reasoning-effort option to low (check OpenRouter's current parameter for this model); return a friendlier message when `finish_reason === "length"`.

#### R-3 🟠 No server-side logging or correlation IDs

- **Evidence:** Every `catch` returns a generic JSON error with no `console.error`; the env-read failure path discards the original error entirely. This is why the earlier "stops after two answers" problem was hard to diagnose.
- **Remedial actions:** Log (server-side only) status, latency, model, token usage, and error class with a request id; return that id to the client for support. Never log the key or full message contents if privacy matters.

#### R-4 🟠 No `maxDuration`; platform timeouts may be shorter than 30 s

- **Evidence:** The route waits up to 30 s upstream but declares no segment config. Next documents `export const maxDuration = <seconds>` for this (`node_modules/next/dist/docs/.../maxDuration.md`); hosting limits vary by plan.
- **Remedial actions:** Export an appropriate `maxDuration` and make the upstream timeout slightly **shorter** than it. Consider streaming (U-4) so first tokens arrive quickly.

#### R-5 🟡 Equal 30 s client/server timeouts; server ignores client abort

- **Evidence:** `REQUEST_TIMEOUT_MS` (client) and `OPENROUTER_TIMEOUT_MS` (server) are both `30000`, so the browser may abort at the same moment the server returns its own 504, producing a racey/ambiguous message.
- **Remedial actions:** Client timeout > server timeout (e.g., 35 s vs 30 s) and pass `request.signal` upstream (R-1).

#### R-6 🟡 Unguarded `response.json()` on the client

- **Evidence:** `DigitalTwinChat.tsx` calls `await response.json()` unconditionally. A non-JSON reply (platform error page, proxy 502) throws a `SyntaxError` whose raw text ("Unexpected token '<'…") is shown to the visitor.
- **Remedial actions:** Wrap parsing in `try/catch`, or check `Content-Type`, and fall back to a friendly message by status code.

#### R-7 🟡 Weak validation of the request contract

- **Evidence:** `body = (await request.json()) as ChatRequest` is a type assertion, not validation. Role/content checks are hand-written. The last message isn't required to be `user`, and `slice(-8)` can begin with an `assistant` message (some providers require the first non-system message to be `user`).
- **Remedial actions:** Validate with a schema library (e.g., `zod`): `messages: z.array(z.object({ role: z.enum([...]), content: z.string().min(1).max(2000) })).max(50)`; require final role `user`; normalize the window so it starts with a `user` turn.

### 4.4 Frontend, UX and accessibility

#### U-1 🟠 Error path drops the user's question and pollutes history

- **Evidence:** In the `catch` of `handleSubmit`, history is reset to `previousHistory` (removing the user's question) and an assistant bubble `"Sorry — I hit an error: …"` is appended **and** the same message is shown in a red banner (duplicate display). The error bubble is also part of `historyRef`, so it is **sent to the model as an assistant turn on the next request**, contaminating context. The textarea was already cleared, so the user must retype.
- **Remedial actions:** Keep the user's message in the transcript; show the error **once** (inline, marked as an error); keep error entries **out** of the history sent to the API (e.g., `{ kind: "error" }` items filtered before `fetch`); optionally restore the input text or offer a "Retry" button.

#### U-2 🟠 Accessibility gaps in the chat widget

- **Evidence / fixes**
  - The message list has no live region → screen readers don't announce replies. Add `role="log"` + `aria-live="polite"` (and `aria-busy` while loading).
  - The error `<p>` lacks `role="alert"`.
  - The textarea is `disabled` while waiting, so keyboard focus is lost; after the reply, focus doesn't return. Use `aria-busy`/read-only instead of `disabled`, or restore focus after completion.
  - "Thinking…" appears in both the bubble and the button label; one is enough.
  - Provide an accessible name for the message region (`aria-label="Conversation with Digital Twin"`).

#### U-3 🟠 Markdown from the model is displayed raw

- **Evidence:** Replies contain `**bold**`, bullet lists, and sometimes tables; the UI uses `whitespace-pre-wrap`, so users see literal asterisks/pipes (visible in the browser test output).
- **Remedial actions:** Render with `react-markdown` (+ `remark-gfm`), **without** enabling raw HTML, or instruct the model (system prompt) to answer in plain text. Never use `dangerouslySetInnerHTML` with model output.

#### U-4 🟡 Smaller UX issues

- Enter inserts a newline and doesn't submit; add Enter-to-send (Shift+Enter for newline) and a hint.
- No `maxLength` on the textarea; the server silently truncates at 2,000 chars. Add `maxLength={2000}` and a counter.
- No streaming: users stare at "Thinking…" for up to 30 s. Stream the response (SSE / `ReadableStream`) for a much better feel.
- Add a "Clear chat" button and suggested starter questions.
- `key={`${message.role}-${index}`}` is fine for append-only lists, but stable ids are safer if you add edit/retry.

#### U-5 🟡 Anchor targets hide under the sticky header

- **Evidence:** `header` is `sticky top-0`; section anchors (`#about`, `#journey`, `#portfolio`, `#digital-twin`) have no `scroll-mt-*`, so headings land beneath the header.
- **Fix:** Add e.g. `scroll-mt-24` to each section.

#### U-6 🟡 Placeholder links are still focusable and jump to top

- **Evidence:** "Case Studies" / "Project Gallery" are `<a href="#" aria-disabled="true" class="cursor-default">`. They remain tab stops and `#` scrolls to the top.
- **Fix:** Render them as non-interactive `<div>`/`<article>` with a "Coming soon" badge until real URLs exist.

#### U-7 🟡 Smooth scrolling ignores reduced-motion preferences

- **Evidence:** `globals.css` applies `scroll-behavior: smooth` to `*`.
- **Fix:** Apply it to `html` only, and wrap in `@media (prefers-reduced-motion: no-preference)`.

#### U-8 🟡 Possible mobile header overflow (*unverified*)

- **Evidence:** The nav holds a brand plus four uppercase, letter-spaced links in one row with no wrap/menu fallback; at ~320–360 px this may overflow.
- **Fix:** Test at small widths; add wrapping, smaller tracking, or a menu toggle.

#### U-9 🟡 Minimal SEO / social metadata

- **Evidence:** `layout.tsx` only sets `title` and `description`.
- **Fix:** Add Open Graph/Twitter metadata, `metadataBase`, canonical URL, an OG image, `robots`, and a sitemap. Also run a contrast check (e.g., `text-slate-400` on the dark background at `text-xs`).

### 4.5 Architecture and maintainability

#### M-1 🟠 Profile facts duplicated in two places

- **Evidence:** Career facts live in `page.tsx` (arrays `journey`, `highlights`, `skillBands`) **and** again as free text in `DIGITAL_TWIN_SYSTEM_PROMPT` in `route.ts`. They can drift (e.g., "AI Engineer Core Track certified" is on the page but not in the prompt).
- **Remedial actions:** Create a single source of truth, e.g. `src/data/profile.ts` (typed object), render the page from it, and **generate** the prompt's profile section from it. If you want richer answers, extend it with curated, approved facts (projects, certifications, technologies) rather than raw PDF text.

#### M-2 🟠 Redundant dual state in the chat component

- **Evidence:** `history` (React state) and `historyRef` (ref) hold the same data, plus `isSubmitting` state and `isSubmittingRef`. This was added while chasing a "race condition" that, given the disabled button/textarea, likely never occurred (see P-2). It adds subtle risk of the two copies diverging.
- **Remedial actions:** Keep **one** source of truth (state) and derive the request payload from it; guard re-entry with the existing `isSubmitting` state (or a single ref). Consider `useReducer` or a small `useChat` hook; or adopt the Vercel AI SDK's `useChat`, which handles streaming, abort, and errors.

#### M-3 🟠 No automated tests

- **Evidence:** No test runner, no tests, no CI workflow; `package.json` has only `dev/build/start/lint`.
- **Remedial actions:** Add Vitest (+ React Testing Library) for: message validation/sanitization (unit), the route with `fetch` mocked (timeout, 4xx/5xx, empty reply), and the chat component (multi-turn, error, retry). Add Playwright for one end-to-end multi-turn test. Add a GitHub Actions workflow running `lint`, `tsc --noEmit`, `test`, `build`.

#### M-4 🟡 Duplicated `ChatMessage` type

- **Evidence:** The same type is declared separately in `route.ts` and `DigitalTwinChat.tsx`.
- **Fix:** Export it from a shared `src/types/chat.ts` (or derive from the zod schema).

#### M-5 🟡 Constants and prompt are inlined in the route

- **Evidence:** Model name, limits, and a ~30-line prompt live inside `route.ts`.
- **Fix:** Move to `src/lib/digital-twin/{config,prompt}.ts`; read model name from an env var with the current value as default so it can be switched without code edits. Split `route.ts` into small functions (validate → build payload → call provider → map response).

### 4.6 Configuration, dependencies and docs

#### D-1 🟠 `npm audit`: 5 high-severity findings (dev tooling)

- **Evidence:** `braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next` (ReDoS/stack exhaustion, GHSA-vfj7-8cjw-p6xm). These are **dev-time lint dependencies**, not shipped to production.
- **Caution:** The suggested `npm audit fix --force` would install `eslint-config-next@14.2.35` — a **downgrade across major versions** that will likely break this Next 16 setup. **Do not run it.**
- **Remedial actions:** Check for a newer `eslint-config-next` / `@next/eslint-plugin-next` release that updates `fast-glob`; use `overrides` in `package.json` to force patched transitive versions if available; re-run `npm audit` in CI; set up Dependabot/Renovate.

#### C-1 🟡 Hardcoded LAN IP in `allowedDevOrigins`

- **Evidence:** `next.config.ts` contains `allowedDevOrigins: ["192.168.1.151"]` — machine/network specific and breaks when DHCP changes.
- **Fix:** Give the machine a DHCP reservation, or drive the list from an env var (`ALLOWED_DEV_ORIGINS`). Next's docs describe wildcard patterns for hostnames (`*.example.dev`); wildcard use with IPs is not documented, so verify before relying on it.

#### C-2 🟡 `HTTP-Referer` hardcoded to localhost

- **Evidence:** The OpenRouter call sends `"HTTP-Referer": "http://localhost:3000"` in all environments.
- **Fix:** Use an env var such as `NEXT_PUBLIC_SITE_URL` (your production URL) so attribution/analytics are correct.

#### C-3 🟡 Experimental Next flags without a documented need

- **Evidence:** `cacheComponents: true` and `partialPrefetching: true` are enabled; the app is almost entirely static, and no code relies on them. Experimental flags increase upgrade risk.
- **Fix:** Keep only what you use; document why each flag is on. Re-validate the route and page against `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`.

#### C-4 🟡 No `.env.example`; docs don't match the real setup

- **Evidence:** `README.md` / `tutorial.md` tell you to create `professional-site/.env.local`, but the working key lives in the **repo-root** `.env`, which the route finds only through its parent-directory fallback. The README doesn't mention that fallback; `tutorial.md` also doesn't mention the risks listed here.
- **Fix:** Add `.env.example` (`OPENROUTER_API_KEY=`), standardize on `professional-site/.env.local`, and update README/tutorial. Replace the default `create-next-app` SVGs in `public/` if unused.

### 4.7 Process notes

#### P-1 🟡 `AGENTS.md` instruction was not followed during implementation

- **Evidence:** `AGENTS.md` says to read `node_modules/next/dist/docs/` before writing code because this Next version has breaking changes. The route handler and config were written without consulting those docs. The build passed, so nothing is known to be wrong, but conventions (route handlers, `cacheComponents`, `maxDuration`, `allowedDevOrigins`) were not verified against them.
- **Action:** Re-check `route.ts` against `01-app/01-getting-started/15-route-handlers.md` and the route-segment-config docs, then address any deviations.

#### P-2 🟡 The "answers two questions then stops" cause was never proven

- **Evidence:** The issue was reported several times. I added: an in-flight guard + ref, client/server timeouts, history bounding, auto-scroll, and in-thread error bubbles, and the problem then stopped being reproduced. Direct API tests and my own browser tests answered 3–4 questions successfully **before** the final fix, so the true root cause (most likely the reply landing below the scroll viewport, or an intermittent provider stall) was not conclusively identified.
- **Implication:** Some of the added complexity (M-2) may be unnecessary, and an intermittent upstream stall could still exist.
- **Action:** Add server logging (R-3) and a client "request state" debug mode to confirm; once confirmed, simplify.

---

## 5. Prioritized remediation plan

### Do immediately (today)

- [ ] **Rotate the OpenRouter key** and update `.env` (S-3).
- [ ] **Set a spending cap / credit limit** on the OpenRouter key (S-2).
- [ ] **Open `LinkedInProfile.pdf`**; if it contains anything private, make the repo private and purge it from history (S-1).
- [ ] Add a visible "AI-generated, may be inaccurate" notice to the chat (A-1).

### Next (this week)

- [ ] Rate limiting + same-origin check + body/array caps on the API route (S-2, S-4).
- [ ] Return generic upstream errors; log details server-side with a request id (S-6, R-3).
- [ ] Fix the timeout so it covers body reading; forward `request.signal`; set `maxDuration` (R-1, R-4, R-5).
- [ ] Tighten the system prompt and lower temperature; test "trap" questions (A-1, S-5).
- [ ] Check `finish_reason`/empty replies with long questions; adjust `max_tokens` (R-2).
- [ ] Standardize on `.env.local`, delete the custom env parser, add `.env.example` (S-7, C-4).
- [ ] Fix the chat error flow so questions aren't lost and error text isn't sent to the model (U-1).
- [ ] Accessibility fixes: `role="log"`/`aria-live`, `role="alert"`, focus handling (U-2).

### Soon (next sprint)

- [ ] Single source of truth for profile data; generate the prompt from it (M-1).
- [ ] Simplify chat state (single source of truth) or adopt `useChat` (M-2).
- [ ] Markdown rendering (safe) or plain-text prompt (U-3); Enter-to-send, `maxLength`, "Clear chat", streaming (U-4).
- [ ] Add tests (unit, component, one e2e) and a CI workflow (M-3); Dependabot (D-1).
- [ ] Zod validation and a shared `ChatMessage` type (R-7, M-4).

### Polish (backlog)

- [ ] `scroll-mt-*`, non-interactive placeholder cards, reduced-motion handling (U-5, U-6, U-7).
- [ ] Verify/fix mobile header, add SEO/OG metadata, contrast check (U-8, U-9).
- [ ] Env-driven `allowedDevOrigins` and `HTTP-Referer` (C-1, C-2); prune experimental flags (C-3).
- [ ] Re-validate against the bundled Next docs per `AGENTS.md` (P-1); confirm the original stall root cause (P-2).
- [ ] Add Prettier (the long line in `handleSubmit` is the only visible formatting inconsistency) and remove the redundant `as string` cast in `DigitalTwinChat.tsx`.

---

## 6. What is working well

- ✅ **Secret handling basics:** the key is read server-side only, never sent to the browser; `.env` is git-ignored and untracked.
- ✅ **Clean toolchain:** `npm run lint` and `npm run build` pass with zero errors/warnings; TypeScript `strict: true`.
- ✅ **Sensible server-side guardrails already present:** input filtering, per-message length cap, history window, `max_tokens`, upstream timeout, structured error statuses (400/500/502/504).
- ✅ **Good separation of concerns:** page layout, client chat component, and server route are in separate files; the key stays in the route.
- ✅ **Accessible basics:** `lang="en"`, visible focus ring on the textarea, a `sr-only` label for the input, semantic headings/`main`/`header`/`footer`.
- ✅ **Clear, polished visual design** consistent with the requested "enterprise meets edgy" direction.
- ✅ **Documentation exists** (README + beginner tutorial), which is uncommon for small projects — it just needs updating (C-4).

---

## 7. Suggested acceptance checks after remediation

1. `curl` the endpoint 30× in a minute → later calls return `429`.
2. POST a 1 MB body or 500 messages → `413`/`400`, no model call made.
3. Ask: "Does Lee know OAuth?" → twin says it isn't stated in his profile.
4. Force an upstream failure → user question stays visible, one error shown, next request does not include the error text.
5. Screen reader announces each new reply; keyboard focus returns to the input after a reply.
6. Rotate key → old key returns `401`; new key works; `git log -p` and the public repo contain no secrets or PDF.
7. `npm audit` shows no new high findings from production dependencies; CI runs lint, typecheck, tests, and build on every push.

---

*Review produced without modifying application code. Items marked "unverified" should be confirmed before acting.*
