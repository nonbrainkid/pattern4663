"use client";

import { useEffect, useRef } from "react";

type Point = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  radius: number;
  alpha: number;
  tone: "bone" | "cyan" | "grid";
  phase: number;
  ambient: boolean;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

const ACTIVE_DOTS = [
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [1, 2],
  [5, 2],
  [1, 3],
  [5, 3],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [1, 5],
  [1, 6],
  [1, 7],
] as const;

const RESOLVE_DURATION = 1100;
const PULSE_INTERVAL = 4663;

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function easeResolve(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return 1 - (1 - clamped) ** 4;
}

function buildPoints(width: number, height: number): Point[] {
  const random = seededRandom(4663);
  const mobile = width < 560;
  const cell = Math.min(
    mobile ? 34 : 47,
    Math.max(20, Math.min(width / (mobile ? 7.4 : 9.2), height / 11)),
  );
  const centerX = width * (mobile ? 0.5 : 0.54);
  const centerY = height * (mobile ? 0.47 : 0.49);
  const columnCenter = mobile ? 3 : 4;
  const xAt = (column: number) => centerX + (column - columnCenter) * cell;
  const yAt = (row: number) => centerY + (row - 5) * cell;
  const points: Point[] = [];

  const makeStart = () => {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * Math.max(width, height) * 0.62;
    return {
      x: width / 2 + Math.cos(angle) * distance,
      y: height / 2 + Math.sin(angle) * distance,
    };
  };

  if (!mobile) {
    for (let row = 1; row <= 9; row += 1) {
      for (let column = 1; column <= 7; column += 1) {
        const start = makeStart();
        points.push({
          startX: start.x,
          startY: start.y,
          targetX: xAt(column),
          targetY: yAt(row),
          radius: 1.15,
          alpha: 0.38,
          tone: "grid",
          phase: random() * Math.PI * 2,
          ambient: false,
        });
      }
    }
  } else {
    const traceStart = makeStart();
    points.push({
      startX: traceStart.x,
      startY: traceStart.y,
      targetX: xAt(5),
      targetY: yAt(4),
      radius: 1.1,
      alpha: 0.3,
      tone: "grid",
      phase: random() * Math.PI * 2,
      ambient: false,
    });
  }

  for (const [column, row] of ACTIVE_DOTS) {
    const start = makeStart();
    const isSignal = column === 5 && row === 4;
    const activeRadius = mobile ? 2.5 : 3;
    points.push({
      startX: start.x,
      startY: start.y,
      targetX: xAt(column) + (isSignal ? cell * 0.35 : 0),
      targetY: yAt(row),
      radius: activeRadius,
      alpha: isSignal ? 1 : 0.94,
      tone: isSignal ? "cyan" : "bone",
      phase: random() * Math.PI * 2,
      ambient: false,
    });
  }

  const ambientCount = mobile ? 30 : 42;
  for (let index = 0; index < ambientCount; index += 1) {
    const start = makeStart();
    const edgeBias = random();
    points.push({
      startX: start.x,
      startY: start.y,
      targetX: start.x + (random() - 0.5) * width * 0.08,
      targetY: start.y + (random() - 0.5) * height * 0.08,
      radius: 0.65 + random() * 0.75,
      alpha: 0.12 + edgeBias * 0.28,
      tone: "grid",
      phase: random() * Math.PI * 2,
      ambient: true,
    });
  }

  return points;
}

function toneColor(tone: Point["tone"], alpha: number) {
  if (tone === "cyan") return `rgba(57, 217, 255, ${alpha})`;
  if (tone === "bone") return `rgba(242, 239, 231, ${alpha})`;
  return `rgba(136, 147, 159, ${alpha})`;
}

export function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer: PointerState = { active: false, x: 0, y: 0 };
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    let inViewport = true;
    let pageVisible = !document.hidden;
    let startTime = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = buildPoints(width, height);
    };

    const draw = (time: number, staticFrame = false) => {
      context.clearRect(0, 0, width, height);
      const elapsed = staticFrame ? RESOLVE_DURATION : time - startTime;
      const progress = easeResolve(elapsed / RESOLVE_DURATION);
      const pulseTime = Math.max(0, elapsed - RESOLVE_DURATION);
      const pulsePhase = (pulseTime % PULSE_INTERVAL) / PULSE_INTERVAL;
      const pulse = pulsePhase < 0.16
        ? Math.sin((pulsePhase / 0.16) * Math.PI)
        : 0;

      for (const point of points) {
        let x = point.startX + (point.targetX - point.startX) * progress;
        let y = point.startY + (point.targetY - point.startY) * progress;
        const drift = point.ambient && progress > 0.96
          ? Math.sin(time * 0.00032 + point.phase) * 1.8
          : 0;
        x += drift;
        y += drift * 0.65;

        if (pointer.active && !staticFrame) {
          const deltaX = x - pointer.x;
          const deltaY = y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < 180) {
            const force = ((180 - distance) / 180) ** 2 * 12;
            x += (deltaX / distance) * force;
            y += (deltaY / distance) * force;
          }
        }

        const settledAlpha = point.ambient
          ? point.alpha * (1 - progress * 0.68)
          : point.alpha;
        const alpha = settledAlpha * (0.28 + progress * 0.72);
        const isActive = point.tone === "bone" || point.tone === "cyan";
        const radius = point.radius * (1 + (isActive ? pulse * 0.08 : 0));

        if (point.tone === "cyan" && progress > 0.72) {
          context.beginPath();
          context.arc(x, y, radius * (3.2 + pulse * 2.5), 0, Math.PI * 2);
          context.fillStyle = `rgba(57, 217, 255, ${0.05 + pulse * 0.06})`;
          context.fill();
        }

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = toneColor(point.tone, alpha);
        context.fill();
      }

      if (!staticFrame && inViewport && pageVisible) {
        animationFrameRef.current = window.requestAnimationFrame(draw);
      } else {
        animationFrameRef.current = 0;
      }
    };

    resize();

    if (reducedMotion) {
      draw(startTime + RESOLVE_DURATION, true);
      const staticResizeObserver = new ResizeObserver(() => {
        resize();
        draw(performance.now(), true);
      });
      staticResizeObserver.observe(canvas);

      return () => staticResizeObserver.disconnect();
    }

    const startLoop = () => {
      if (!animationFrameRef.current && inViewport && pageVisible) {
        animationFrameRef.current = window.requestAnimationFrame(draw);
      }
    };

    const stopLoop = () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.active = true;
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    };
    const handlePointerLeave = () => {
      pointer.active = false;
    };
    const handleVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startLoop();
      else stopLoop();
    };

    let hasObservedResize = false;
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (hasObservedResize) {
        startTime = performance.now() - RESOLVE_DURATION;
      }
      hasObservedResize = true;
      startLoop();
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry?.isIntersecting ?? true;
        if (inViewport) startLoop();
        else stopLoop();
      },
      { rootMargin: "80px" },
    );

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="signal-field" aria-hidden="true">
      <div className="signal-field__fallback" />
      <canvas aria-hidden="true" className="signal-field__canvas" ref={canvasRef} />
    </div>
  );
}
