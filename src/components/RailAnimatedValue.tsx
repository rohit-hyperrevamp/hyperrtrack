import { useEffect, useState } from "react";

/** Smoothly tracks a dashboard value while leaving units and separators intact. */
export function useRailAnimatedValue(target: number, duration = 1000) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    let startTime: number | undefined;
    const from = display;
    const step = (time: number) => {
      startTime ??= time;
      const t = Math.min(1, (time - startTime) / duration);
      setDisplay(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // Restart only when the underlying value changes, not on each animation frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return display;
}

export function RailAnimatedNumber({ value }: { value: string }) {
  const numbers = value.match(/-?[\d,]+(?:\.\d+)?/g) ?? [];
  const targets = numbers.map((part) => Number(part.replace(/,/g, "")));
  const first = useRailAnimatedValue(targets[0] ?? 0);
  const second = useRailAnimatedValue(targets[1] ?? 0);
  if (!numbers.length) return <>{value}</>;
  let index = 0;
  return <>{value.split(/(-?[\d,]+(?:\.\d+)?)/g).map((part, i) => {
    if (!/^-?[\d,]+(?:\.\d+)?$/.test(part)) return part;
    const animated = index++ === 0 ? first : second;
    const decimals = part.includes(".") ? part.split(".")[1].length : 0;
    return <span key={i}>{animated.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
  })}</>;
}