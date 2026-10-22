This is a professional personal website for Lee Trent, built with [Next.js](https://nextjs.org) and the App Router.

## Design direction

- **Tone:** enterprise meets edgy
- **Sections:** About Me, Career Journey, Portfolio Links
- **Content source:** LinkedIn profile details provided by the project owner

## Running locally

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Digital Twin chat setup (OpenRouter)

The site includes a Digital Twin chat powered by OpenRouter using the model
`openai/gpt-oss-20b`.

Create a `.env.local` file in the project root (`professional-site`) with:

```bash
OPENROUTER_API_KEY=your_openrouter_key_here
```

Then restart the dev server if it is already running.

## Key files

- `src/app/page.tsx` — main site content and section layouts
- `src/app/components/DigitalTwinChat.tsx` — client chat UI for the Digital Twin
- `src/app/api/digital-twin-chat/route.ts` — server API route that calls OpenRouter
- `src/app/globals.css` — global theme and base styling
- `src/app/layout.tsx` — metadata and app shell

## Quality checks

```bash
npm run lint
npm run build
```

## Future extension points

- Replace portfolio placeholders in the Portfolio Links section with live project URLs
- Add project detail pages under `src/app/(portfolio)/...`
- Add a contact form with server-side handling when needed

## Deployment

This project is deployment-ready for any Next.js-compatible hosting platform.

For Vercel deployment details, see: [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).
