"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Counter from "@/components/Machine/Counter";
import { Button } from "@/components/ui/button";

const SLEEVE_COLORS = [
  "#2f5c2a",
  "#7a342c",
  "#d9d7cd",
  "#c9862b",
  "#1e3f1b",
  "#b08d4f",
];

const SLEEVE_COUNT = 15;

const SLEEVES = Array.from({ length: SLEEVE_COUNT }, (_, i) => {
  const y = 144 + ((i * 7) % 11);
  return {
    x: 76 + i * 14,
    y,
    h: 304 - y,
    angle: (i % 2 === 0 ? -1 : 1) * (0.8 + ((i * 3) % 8) / 10),
    color: SLEEVE_COLORS[i % SLEEVE_COLORS.length],
  };
});

const sleeveCenterX = (i: number) => 76 + i * 14 + 5.5;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Pick {
  index: number;
  pop: string;
  delay: string;
}

interface CrateMachineProps {
  value: number;
  onValueChange: (value: number) => void;
  /** true while the shuffle request is in flight — the machine riffles and the gantry sweeps */
  isShuffling: boolean;
  /** number of results once they arrive, null when idle / reset */
  resultCount: number | null;
  /** reports the sleeve colors of the popped picks, for result-card continuity */
  onPicked?: (colors: string[]) => void;
}

export default function CrateMachine({
  value,
  onValueChange,
  isShuffling,
  resultCount,
  onPicked,
}: CrateMachineProps) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const carriageRef = useRef<SVGGElement>(null);
  const animRef = useRef<Animation | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The counter is an HTML overlay (foreignObject breaks on iOS Safari),
  // so it must scale with the SVG manually.
  const machineRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = machineRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setScale(el.clientWidth / 360));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stopCarriage = useCallback(() => {
    animRef.current?.cancel();
    animRef.current = null;
  }, []);

  // idle: the carriage drifts along the rail
  useEffect(() => {
    const carriage = carriageRef.current;
    if (!carriage?.animate || prefersReducedMotion()) return;
    if (!isShuffling && resultCount === null) {
      stopCarriage();
      animRef.current = carriage.animate(
        [
          { transform: "translateX(0px)" },
          { transform: "translateX(-70px)", offset: 0.25 },
          { transform: "translateX(70px)", offset: 0.75 },
          { transform: "translateX(0px)" },
        ],
        { duration: 12000, iterations: Infinity, easing: "ease-in-out" }
      );
    }
    return stopCarriage;
  }, [isShuffling, resultCount, stopCarriage]);

  // shuffling: fast sweep while the request is in flight
  useEffect(() => {
    const carriage = carriageRef.current;
    if (!isShuffling) return;
    setPicks([]);
    if (!carriage?.animate || prefersReducedMotion()) return;
    stopCarriage();
    animRef.current = carriage.animate(
      [{ transform: "translateX(-86px)" }, { transform: "translateX(86px)" }],
      {
        duration: 800,
        direction: "alternate",
        iterations: Infinity,
        easing: "ease-in-out",
      }
    );
    return stopCarriage;
  }, [isShuffling, stopCarriage]);

  // results arrived: lock over one zone, pop the adjacent block
  useEffect(() => {
    const carriage = carriageRef.current;
    if (resultCount === null) {
      setPicks([]);
      return;
    }
    if (resultCount === 0) {
      stopCarriage();
      return;
    }
    const n = Math.min(resultCount, 5);
    const start = 1 + Math.floor(Math.random() * (SLEEVE_COUNT - 1 - n));
    const mid = (n - 1) / 2;
    const block: Pick[] = Array.from({ length: n }, (_, k) => ({
      index: start + k,
      pop: `${-(48 + Math.random() * 14)}px`,
      delay: `${Math.abs(k - mid) * 0.1}s`,
    }));
    const stopX = sleeveCenterX(start + mid) - 180;

    stopCarriage();
    if (carriage?.animate && !prefersReducedMotion()) {
      animRef.current = carriage.animate(
        [{ transform: `translateX(${stopX}px)` }],
        { duration: 400, fill: "forwards", easing: "ease-out" }
      );
    }
    popTimer.current = setTimeout(
      () => {
        setPicks(block);
        onPicked?.(block.map((p) => SLEEVES[p.index].color));
      },
      prefersReducedMotion() ? 0 : 380
    );
    return () => {
      if (popTimer.current) clearTimeout(popTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultCount]);

  return (
    <div className="flex w-full items-center justify-center gap-1 sm:gap-3">
      <Button
        className="bg-olive text-background rounded-full hover:bg-olive-dark active:bg-olive-dark disabled:bg-olive-dark disabled:opacity-100 size-12 sm:size-14 flex-none p-0"
        onClick={() => onValueChange(value > 1 ? value - 1 : 1)}
        aria-label="Fewer picks"
        disabled={value <= 1 || isShuffling}
      >
        <span className="text-3xl font-black select-none">−</span>
      </Button>

      <div ref={machineRef} className="relative w-full max-w-[370px] min-w-0">
        <svg
          viewBox="0 60 360 380"
          className="crate-machine w-full h-auto"
          data-shuffling={isShuffling}
          role="img"
          aria-label="Crate machine: a selector arm sweeps a crate of records and pulls out your picks"
        >
          {/* gantry posts + rail */}
          <rect x="50" y="92" width="8" height="164" rx="4" fill="var(--color-olive-dark)" />
          <rect x="302" y="92" width="8" height="164" rx="4" fill="var(--color-olive-dark)" />
          <rect x="54" y="92" width="252" height="8" rx="4" fill="var(--color-olive)" />

          {/* carriage */}
          <g transform="translate(180 96)">
            <g ref={carriageRef}>
              <rect x="-15" y="-8" width="30" height="17" rx="4" fill="var(--color-foreground)" />
              <circle cx="-8" cy="-10" r="3" fill="var(--color-olive-dark)" />
              <circle cx="8" cy="-10" r="3" fill="var(--color-olive-dark)" />
              <path d="M-6 9 L6 9 L0 22 Z" fill="#c9862b" />
            </g>
          </g>

          {/* sleeves */}
          <g>
            {SLEEVES.map((s, i) => {
              const pick = picks.find((p) => p.index === i);
              return (
                <g
                  key={i}
                  className={pick ? "crate-wrap picked" : "crate-wrap"}
                  style={
                    pick
                      ? ({
                          "--pop": pick.pop,
                          animationDelay: pick.delay,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <g className="crate-peek">
                    <circle cx={s.x + 5.5} cy={s.y + 6} r="8" fill="#171717" />
                    <circle cx={s.x + 5.5} cy={s.y + 6} r="3" fill="#eeeeec" opacity="0.9" />
                  </g>
                  <g
                    className="crate-sleeve"
                    style={{ "--i": i, "--a": `${s.angle}deg` } as React.CSSProperties}
                  >
                    <rect x={s.x} y={s.y} width="11" height={s.h} rx="2.5" fill={s.color} />
                  </g>
                </g>
              );
            })}
          </g>

          {/* crate front */}
          <rect x="58" y="252" width="244" height="152" rx="10" fill="var(--color-olive)" />
          <rect x="58" y="252" width="244" height="14" rx="7" fill="var(--color-olive-dark)" />

          {/* counter window (the Counter component is overlaid in HTML) */}
          <rect x="140" y="300" width="80" height="42" rx="8" fill="var(--color-foreground)" />

          {/* slats */}
          <rect x="72" y="360" width="216" height="8" rx="4" fill="var(--color-olive-dark)" />
          <rect x="72" y="380" width="216" height="8" rx="4" fill="var(--color-olive-dark)" />

          {/* feet + ground shadow */}
          <rect x="72" y="404" width="26" height="10" rx="3" fill="var(--color-olive-dark)" />
          <rect x="262" y="404" width="26" height="10" rx="3" fill="var(--color-olive-dark)" />
          <ellipse cx="180" cy="422" rx="130" ry="7" fill="#000000" opacity="0.22" />
        </svg>

        {/* the app's rolling odometer, scaled to the machine width */}
        <div
          className="pointer-events-none absolute left-1/2"
          style={{
            top: `${((321 - 60) / 380) * 100}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <Counter
            value={value}
            places={[10, 1]}
            fontSize={26}
            padding={2}
            gap={2}
            textColor="var(--color-background)"
            fontWeight={900}
            gradientHeight={4}
            gradientFrom="var(--color-foreground)"
            gradientTo="transparent"
          />
        </div>
      </div>

      <Button
        className="bg-olive text-background rounded-full hover:bg-olive-dark active:bg-olive-dark disabled:bg-olive-dark disabled:opacity-100 size-12 sm:size-14 flex-none p-0"
        onClick={() => onValueChange(value < 10 ? value + 1 : 10)}
        aria-label="More picks"
        disabled={value >= 10 || isShuffling}
      >
        <span className="text-3xl font-black select-none">+</span>
      </Button>
    </div>
  );
}
