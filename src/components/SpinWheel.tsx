import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  playLose,
  playSpinStart,
  playTick,
  playWin,
  unlockAudio,
} from "@/lib/wheel-sounds";

export type Segment = {
  label: string;
  short: string;
  color: string;
  win: boolean;
};

export const SEGMENTS: Segment[] = [
  { label: "₹50 Cashback", short: "₹50", color: "var(--wheel-1)", win: true },
  { label: "Better Luck Next Time", short: "Try Again", color: "var(--wheel-2)", win: false },
  { label: "Free Coffee", short: "Coffee", color: "var(--wheel-3)", win: true },
  { label: "10% Discount", short: "10% Off", color: "var(--wheel-4)", win: true },
  { label: "₹100 Cashback", short: "₹100", color: "var(--wheel-5)", win: true },
  { label: "Mystery Gift", short: "Mystery", color: "var(--wheel-6)", win: true },
  { label: "Free Shipping", short: "Shipping", color: "var(--wheel-7)", win: true },
  { label: "20% Discount", short: "20% Off", color: "var(--wheel-8)", win: true },
  { label: "Bonus Points", short: "Bonus", color: "var(--wheel-9)", win: true },
  { label: "Grand Prize", short: "Grand", color: "var(--wheel-10)", win: true },
];

const SEG = 360 / SEGMENTS.length;
const R = 200;
const SPIN_MS = 5200;

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [R + radius * Math.cos(rad), R + radius * Math.sin(rad)] as const;
}

function segmentPath(index: number) {
  const start = index * SEG;
  const end = start + SEG;
  const [x1, y1] = polar(start, R);
  const [x2, y2] = polar(end, R);
  return `M ${R} ${R} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
}

function fireConfetti(grand: boolean) {
  const colors = ["#ffd76a", "#ff5f7e", "#59d6a8", "#6aa8ff", "#c084fc"];
  const shots = grand ? 5 : 2;
  for (let i = 0; i < shots; i++) {
    setTimeout(() => {
      confetti({
        particleCount: grand ? 120 : 80,
        spread: grand ? 110 : 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.62 },
        colors,
        scalar: grand ? 1.15 : 1,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 40,
        angle: i % 2 === 0 ? 60 : 120,
        spread: 70,
        origin: { x: i % 2 === 0 ? 0 : 1, y: 0.7 },
        colors,
        disableForReducedMotion: true,
      });
    }, i * 260);
  }
}

export function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Segment | null>(null);
  const [history, setHistory] = useState<Segment[]>([]);
  const [muted, setMuted] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  const bulbs = useMemo(
    () => Array.from({ length: 24 }, (_, i) => (i * 360) / 24),
    [],
  );

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const trackTicks = useCallback(
    (from: number, to: number, silent: boolean) => {
      const start = performance.now();
      lastTickRef.current = Math.floor(from / SEG);
      const ease = (t: number) => 1 - Math.pow(1 - t, 4);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / SPIN_MS);
        const angle = from + (to - from) * ease(t);
        const idx = Math.floor(angle / SEG);
        if (idx !== lastTickRef.current) {
          lastTickRef.current = idx;
          if (!silent) playTick(1 - t);
        }
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [],
  );

  const spin = useCallback(() => {
    if (spinning) return;
    unlockAudio();
    const index = Math.floor(Math.random() * SEGMENTS.length);
    const jitter = (Math.random() - 0.5) * (SEG - 10);
    const turns = 5 + Math.floor(Math.random() * 3);
    const base = rotation - (rotation % 360);
    const target = base + turns * 360 + (360 - (index * SEG + SEG / 2)) - jitter;

    setResult(null);
    setSpinning(true);
    if (!muted) playSpinStart();
    trackTicks(rotation, target, muted);
    setRotation(target);

    window.setTimeout(() => {
      const seg = SEGMENTS[index];
      setSpinning(false);
      setResult(seg);
      setHistory((h) => [seg, ...h].slice(0, 5));
      if (!muted) (seg.win ? playWin : playLose)();
      if (seg.win) fireConfetti(seg.label === "Grand Prize");
    }, SPIN_MS);
  }, [muted, rotation, spinning, trackTicks]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="relative w-full max-w-[min(92vw,30rem)]">
        {/* Pointer */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
          <div
            className="h-8 w-6 bg-gradient-gold"
            style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
          />
        </div>

        {/* Bulb ring */}
        <div className="absolute inset-0 z-10">
          {bulbs.map((deg, i) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-gold-soft animate-bulb"
              style={{
                transform: `rotate(${deg}deg) translateY(calc(-50% - 50% - 0.9rem)) `,
                animationDelay: `${(i % 6) * 0.2}s`,
                boxShadow: "0 0 10px var(--gold)",
              }}
            />
          ))}
        </div>

        <div className="relative aspect-square rounded-full shadow-wheel">
          <div
            ref={wheelRef}
            className="h-full w-full will-change-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.03, 1)`
                : undefined,
            }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <defs>
                <radialGradient id="sheen" cx="35%" cy="25%" r="75%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.28" />
                  <stop offset="60%" stopColor="white" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.22" />
                </radialGradient>
              </defs>
              {SEGMENTS.map((s, i) => {
                const mid = i * SEG + SEG / 2;
                const [tx, ty] = polar(mid, R * 0.62);
                return (
                  <g key={s.label}>
                    <path
                      d={segmentPath(i)}
                      fill={s.color}
                      stroke="var(--gold)"
                      strokeWidth={1.5}
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${mid} ${tx} ${ty})`}
                      className="font-display"
                      fill="oklch(0.99 0.01 95)"
                      fontSize={s.short.length > 7 ? 17 : 21}
                      fontWeight={700}
                      style={{ paintOrder: "stroke", letterSpacing: "0.02em" }}
                      stroke="oklch(0.15 0.05 285 / 0.55)"
                      strokeWidth={3}
                    >
                      {s.short}
                    </text>
                  </g>
                );
              })}
              <circle cx={200} cy={200} r={199} fill="url(#sheen)" />
            </svg>
          </div>

          {/* Center spin button */}
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            aria-label="Spin the wheel"
            className="absolute left-1/2 top-1/2 z-20 flex aspect-square w-[28%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-gold font-display text-[clamp(0.9rem,3.4vw,1.35rem)] font-extrabold uppercase tracking-wider text-primary-foreground transition-transform duration-200 animate-glow-pulse hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {spinning ? "..." : "SPIN"}
          </button>
        </div>
      </div>

      {/* Result */}
      <div className="min-h-24 w-full max-w-md text-center">
        {result ? (
          <div
            key={result.label + history.length}
            className="animate-pop-in rounded-3xl border border-border bg-card p-5 shadow-card-soft"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              {result.win ? "You won" : "So close"}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-gradient-hero sm:text-3xl">
              {result.label}
            </p>
            <button
              type="button"
              onClick={spin}
              className="mt-4 rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Spin again
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {spinning ? "Round and round it goes…" : "Tap SPIN to try your luck."}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-muted"
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
        {history.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">Recent</span>
            {history.map((h, i) => (
              <span
                key={`${h.label}-${i}`}
                className="rounded-full px-2.5 py-1 text-foreground"
                style={{ backgroundColor: h.color }}
              >
                {h.short}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
