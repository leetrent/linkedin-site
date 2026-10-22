import DigitalTwinChat from "./components/DigitalTwinChat";

export default function Home() {
  const journey = [
    {
      period: "2021 — Present",
      role: "Owner & Software Engineer · TrentTEK LLC",
      summary:
        "Leading enterprise software consulting and AI engineering initiatives with a focus on production-grade LLM, RAG, and agentic systems.",
    },
    {
      period: "2009 — 2021",
      role: "Application Architect / Senior Developer",
      summary:
        "Designed and delivered mission-critical systems for federal agencies, including secure public-facing applications, MFA workflows, and large-scale HR/payroll data-quality platforms.",
    },
    {
      period: "1997 — 2009",
      role: "Application Developer",
      summary:
        "Built and modernized high-volume enterprise platforms in insurance, telecommunications, and government environments using Java, .NET, Oracle, and SQL Server stacks.",
    },
  ];

  const highlights = [
    "30 years of software engineering experience",
    "AI Engineer Core Track certified",
    "Deep expertise in LLM, RAG, and QLoRA workflows",
    "Enterprise data architecture across Oracle, MySQL, and SQL Server",
  ];

  const skillBands = [
    {
      title: "AI Engineering",
      skills: [
        "Large Language Models (LLM)",
        "Retrieval-Augmented Generation (RAG)",
        "QLoRA Fine-Tuning",
        "Agentic Workflows",
      ],
    },
    {
      title: "Enterprise Application Engineering",
      skills: [
        "ASP.NET Core / .NET",
        "Java / Spring Framework",
        "Secure authentication patterns",
        "Mission-critical system delivery",
      ],
    },
    {
      title: "Data & Architecture",
      skills: [
        "Oracle",
        "MySQL",
        "MS SQL Server",
        "End-to-end platform design",
      ],
    },
  ];

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[110px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b17]/80 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-violet-200/90">
            LEE TRENT
          </p>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.16em] text-slate-300/90 md:text-sm">
            <a href="#about" className="transition hover:text-violet-300">
              About
            </a>
            <a href="#journey" className="transition hover:text-violet-300">
              Journey
            </a>
            <a href="#portfolio" className="transition hover:text-violet-300">
              Portfolio
            </a>
            <a href="#digital-twin" className="transition hover:text-violet-300">
              AI Twin
            </a>
          </div>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-20 md:px-10 md:pt-28">
        <section className="grid gap-10 md:grid-cols-[1.35fr_1fr] md:items-center">
          <div className="space-y-7">
            <p className="inline-flex items-center rounded-full border border-violet-300/35 bg-violet-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
              Strategic Software Engineer · AI Engineer
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-50 sm:text-5xl md:text-6xl">
              Enterprise-grade software,
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                {" "}
                engineered with edge.
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              I architect and deliver high-integrity software systems that
              combine decades of enterprise engineering discipline with modern
              AI capabilities. From secure federal applications to production
              LLM workflows, I focus on reliability, data quality, and business
              impact.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/leetrent"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Connect on LinkedIn
              </a>
              <a
                href="mailto:lee.trent.1@gmail.com"
                className="rounded-full border border-slate-500/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Contact Me
              </a>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-40px_rgba(45,212,191,0.7)] backdrop-blur-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              At a glance
            </h2>
            <ul className="mt-5 space-y-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section id="about" className="grid gap-8 md:grid-cols-[1fr_1.15fr]">
          <div className="rounded-3xl border border-cyan-300/30 bg-cyan-400/10 p-7">
            <h2 className="text-2xl font-bold text-cyan-100">About me</h2>
            <p className="mt-4 text-sm leading-relaxed text-cyan-50/90">
              Based in the Kansas City metro area, I bring 30 years of software
              engineering experience across federal, commercial, and consultancy
              environments. I specialize in translating complex business rules
              into clean architecture and resilient implementation.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cyan-50/90">
              My current focus is helping teams move from experimental AI
              concepts to secure, deterministic, production-ready systems.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">
            <h3 className="text-2xl font-bold text-slate-100">
              Technical profile
            </h3>
            <div className="mt-6 grid gap-4">
              {skillBands.map((band) => (
                <div
                  key={band.title}
                  className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4"
                >
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
                    {band.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-300">
                    {band.skills.join(" • ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="journey">
          <h2 className="text-3xl font-bold text-slate-100">Career journey</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            A progression from foundational enterprise development to modern AI
            engineering leadership.
          </p>
          <div className="mt-8 grid gap-5">
            {journey.map((step) => (
              <article
                key={step.period}
                className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 to-slate-950 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  {step.period}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-50">
                  {step.role}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {step.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="portfolio"
          className="rounded-3xl border border-white/10 bg-white/5 p-8"
        >
          <h2 className="text-3xl font-bold text-slate-100">Portfolio links</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            This section is set up for current and future project showcases.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="https://www.linkedin.com/in/leetrent"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-violet-300/35 bg-violet-400/10 p-5 transition hover:border-violet-300 hover:bg-violet-400/15"
            >
              <h3 className="font-semibold text-violet-100">LinkedIn</h3>
              <p className="mt-2 text-sm text-violet-50/85">
                Professional profile, experience, and recent updates.
              </p>
            </a>
            <a
              href="#"
              className="cursor-default rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-5"
              aria-disabled="true"
            >
              <h3 className="font-semibold text-cyan-100">Case Studies</h3>
              <p className="mt-2 text-sm text-cyan-50/90">
                Coming soon: deep dives into enterprise and AI implementations.
              </p>
            </a>
            <a
              href="#"
              className="cursor-default rounded-2xl border border-fuchsia-300/30 bg-fuchsia-400/10 p-5"
              aria-disabled="true"
            >
              <h3 className="font-semibold text-fuchsia-100">Project Gallery</h3>
              <p className="mt-2 text-sm text-fuchsia-50/90">
                Coming soon: selected builds, architecture snapshots, and demos.
              </p>
            </a>
          </div>
        </section>

        <section id="digital-twin" className="space-y-3">
          <h2 className="text-3xl font-bold text-slate-100">
            Digital Twin chat
          </h2>
          <p className="max-w-3xl text-slate-300">
            Have a conversation with an AI assistant trained on my career story
            and technical profile.
          </p>
          <DigitalTwinChat />
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 text-xs uppercase tracking-[0.14em] text-slate-400 md:flex-row md:items-center md:justify-between md:px-10">
          <p>Lee Trent · Kansas City, Missouri</p>
          <p>Built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
