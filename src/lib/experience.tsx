"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toStudioName } from "./utils";

/* =========================================================================
   EXPERIENCE
   One place that knows: how much machine we're running on, whether the
   visitor asked us to sit still, whether the leader has already run, and
   what the studio is currently called.

   All of it lives in a store outside React and is read with
   useSyncExternalStore. That matters for one specific reason: the server
   value below is deliberately the most conservative version of the site —
   still, unlit, unnamed — so the first HTML is the version that works
   everywhere, and the capable version arrives once hydration is done. No
   effect has to fire a setState to correct the first paint.
   ========================================================================= */

export type Quality = "high" | "medium" | "low";

const DEFAULT_NAME = "INSERT_NAME";
const NAME_KEY = "insert_name.blank";
const LEADER_KEY = "insert_name.booted";

type Env = {
  /** True once the client store has taken over from the server value. */
  hydrated: boolean;
  reducedMotion: boolean;
  quality: Quality;
  isTouch: boolean;
  /** The academy leader has already run this session, or was never wanted. */
  leaderSeen: boolean;
  /** The lamp is on. */
  booted: boolean;
  name: string;
  /** Timestamp of the last naming, for the one-shot reveal. 0 if never. */
  named: number;
};

const SERVER_ENV: Env = {
  hydrated: false,
  reducedMotion: false,
  quality: "medium",
  isTouch: false,
  leaderSeen: false,
  booted: false,
  name: DEFAULT_NAME,
  named: 0,
};

/* ---- storage, which is allowed to not exist ---- */

const store = (kind: "local" | "session") =>
  kind === "local" ? window.localStorage : window.sessionStorage;

const read = (kind: "local" | "session", key: string) => {
  try {
    return store(kind).getItem(key);
  } catch {
    return null; /* private mode — the secret just doesn't persist */
  }
};

const write = (kind: "local" | "session", key: string, value: string) => {
  try {
    store(kind).setItem(key, value);
  } catch {
    /* no-op */
  }
};

const drop = (kind: "local" | "session", key: string) => {
  try {
    store(kind).removeItem(key);
  } catch {
    /* no-op */
  }
};

/* ---- what this machine can be asked to do ---- */

const detectQuality = (): Quality => {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  if (nav.connection?.saveData) return "low";

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");

  if (slowNet || cores <= 3 || memory <= 2) return "low";
  if (coarse && cores <= 6) return "medium";
  if (cores >= 8 && memory >= 8) return "high";
  return "medium";
};

/* ---- the store ---- */

let env: Env | null = null;
const listeners = new Set<() => void>();

function compute(): Env {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stored = read("local", NAME_KEY);
  const name = stored ? toStudioName(stored) || DEFAULT_NAME : DEFAULT_NAME;
  // A visitor who asked for stillness never sees a countdown.
  const leaderSeen = reducedMotion || read("session", LEADER_KEY) === "1";

  return {
    hydrated: true,
    reducedMotion,
    quality: detectQuality(),
    isTouch: window.matchMedia("(hover: none)").matches,
    leaderSeen,
    booted: leaderSeen,
    name,
    named: 0,
  };
}

const getSnapshot = (): Env => {
  if (typeof window === "undefined") return SERVER_ENV;
  env ??= compute();
  return env;
};

const getServerSnapshot = (): Env => SERVER_ENV;

const patch = (next: Partial<Env>) => {
  const base = getSnapshot();
  const merged = { ...base, ...next };
  if ((Object.keys(next) as Array<keyof Env>).every((k) => base[k] === merged[k])) return;
  env = merged;
  listeners.forEach((notify) => notify());
};

let motionQuery: MediaQueryList | null = null;

const onMotionChange = () => {
  // leaderSeen deliberately stays as it was: the leader can't un-run.
  patch({ reducedMotion: motionQuery?.matches ?? false });
};

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  if (listeners.size === 1) {
    motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", onMotionChange);
  }
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0 && motionQuery) {
      motionQuery.removeEventListener("change", onMotionChange);
      motionQuery = null;
    }
  };
};

/* ---- the only ways the store changes ---- */

const setBooted = (value: boolean) => patch({ booted: value });

const markLeaderDone = () => write("session", LEADER_KEY, "1");

const setStudioName = (raw: string) => {
  const next = toStudioName(raw);
  if (!next) return;
  write("local", NAME_KEY, next);
  patch({ name: next, named: Date.now() });
};

const resetStudioName = () => {
  drop("local", NAME_KEY);
  patch({ name: DEFAULT_NAME, named: 0 });
};

const downgrade = () => {
  const current = getSnapshot().quality;
  patch({ quality: current === "high" ? "medium" : "low" });
};

/* =========================================================================
   PROVIDER
   ========================================================================= */

type ExperienceValue = {
  /** True after hydration. Guards every animation start. */
  mounted: boolean;
  reducedMotion: boolean;
  quality: Quality;
  /** high = shader + moving plates, medium = static plates, low = neither */
  canRunShader: boolean;
  canAnimateTexture: boolean;
  isTouch: boolean;
  leaderSeen: boolean;
  booted: boolean;
  setBooted: (value: boolean) => void;
  markLeaderDone: () => void;
  /** The secret. Defaults to the studio's own placeholder. */
  studioName: string;
  isNamed: boolean;
  setStudioName: (value: string) => void;
  resetStudioName: () => void;
  nameJustSet: number;
};

const ExperienceContext = createContext<ExperienceValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const corrected = useRef(false);

  /* ---- runtime frame-rate watchdog: if the machine can't keep up, quietly
         drop a tier and stop asking it to. One correction, then silence. ---- */
  useEffect(() => {
    if (!state.hydrated || state.reducedMotion || state.quality === "low") return;
    if (corrected.current) return;

    let raf = 0;
    let frames = 0;
    let start = performance.now();

    const tick = (now: number) => {
      frames += 1;
      const elapsed = now - start;
      if (elapsed >= 2000) {
        const fps = (frames / elapsed) * 1000;
        if (fps < 42) {
          corrected.current = true;
          downgrade();
          return;
        }
        frames = 0;
        start = now;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.hydrated, state.reducedMotion, state.quality]);

  const value = useMemo<ExperienceValue>(
    () => ({
      mounted: state.hydrated,
      reducedMotion: state.reducedMotion,
      quality: state.quality,
      canRunShader: state.hydrated && !state.reducedMotion && state.quality === "high",
      canAnimateTexture: state.hydrated && !state.reducedMotion && state.quality !== "low",
      isTouch: state.isTouch,
      leaderSeen: state.leaderSeen,
      booted: state.booted,
      setBooted,
      markLeaderDone,
      studioName: state.name,
      isNamed: state.name !== DEFAULT_NAME,
      setStudioName,
      resetStudioName,
      nameJustSet: state.named,
    }),
    [state],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}

export { DEFAULT_NAME };
