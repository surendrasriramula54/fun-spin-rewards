import { createFileRoute } from "@tanstack/react-router";
import { SEGMENTS, SpinWheel } from "@/components/SpinWheel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spin the Wheel — Win Cashback, Discounts & Prizes" },
      {
        name: "description",
        content:
          "Spin a colorful 10-segment prize wheel for cashback, discounts, free coffee, bonus points and a grand prize. Smooth animation, sound effects and confetti.",
      },
      { property: "og:title", content: "Spin the Wheel — Win Cashback & Prizes" },
      {
        property: "og:description",
        content:
          "Try your luck on a 10-segment reward wheel with smooth spins, sound effects and confetti celebrations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="stage-bg relative min-h-screen overflow-hidden px-4 py-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl animate-float-slow"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-10">
        <header className="text-center">
          <span className="inline-block rounded-full border border-primary/40 bg-secondary/60 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-primary">
            Daily Reward
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-gradient-hero sm:text-6xl">
            Spin the Wheel
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Ten prizes. One spin. Cashback, discounts and a grand prize are waiting.
          </p>
        </header>

        <SpinWheel />

        <section className="w-full rounded-3xl border border-border bg-card/70 p-5 shadow-card-soft backdrop-blur">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            All 10 rewards
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SEGMENTS.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2 text-sm"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-foreground">{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="pb-4 text-center text-xs text-muted-foreground">
          Prizes are randomly awarded. One spin per visit is recommended.
        </footer>
      </div>
    </main>
  );
}
