"use client";

// Seedsy's signature "the system is alive" visuals: growth rings that pulse
// outward like a tree cross-section, and a terminal-style staged log.

export function GrowthRings({ size = 96 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute inset-0 animate-ring rounded-full border border-signal/70"
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_18px_rgba(201,241,78,0.8)]" />
    </div>
  );
}

export function StageLog({ stages, stage }: { stages: string[]; stage: number }) {
  return (
    <ol className="space-y-2 font-mono text-[13px]">
      {stages.map((s, i) => {
        const done = i < stage;
        const active = i === stage;
        return (
          <li
            key={s}
            className={`flex items-center gap-3 transition-colors duration-500 ${
              done ? "text-leaf" : active ? "text-parchment" : "text-sage/40"
            }`}
          >
            <span className="w-4 text-center">
              {done ? "✓" : active ? <span className="animate-blink text-signal">▮</span> : "·"}
            </span>
            <span className={active ? "animate-breathe" : ""}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function AIWorking({
  title,
  stages,
  stage,
}: {
  title: string;
  stages: string[];
  stage: number;
}) {
  return (
    <div className="card-raise flex flex-col items-center gap-6 py-10 text-center animate-fade-up">
      <GrowthRings />
      <div>
        <p className="label">{title}</p>
        <div className="mt-4 text-left">
          <StageLog stages={stages} stage={stage} />
        </div>
      </div>
    </div>
  );
}
