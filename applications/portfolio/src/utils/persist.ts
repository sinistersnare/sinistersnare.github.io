import type { UIState } from "../features/uiSlice";
import type { DocentState } from "../features/docentSlice";

const KEY_UI = "portfolio:ui";
const KEY_DOCENT = "portfolio:docent";

export function loadUIState(): UIState | undefined {
  try {
    const raw = localStorage.getItem(KEY_UI);
    if (!raw) return undefined;
    return JSON.parse(raw) as UIState;
  } catch {
    return undefined;
  }
}

export function saveUIState(state: UIState) {
  try {
    localStorage.setItem(KEY_UI, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export type DocentPersist = Pick<
  DocentState,
  "conversation" | "llmService" | "placeholderText"
>;

export function loadDocentState(): DocentPersist | undefined {
  try {
    const raw = localStorage.getItem(KEY_DOCENT);
    if (!raw) return undefined;
    return JSON.parse(raw) as DocentPersist;
  } catch {
    return undefined;
  }
}

export function saveDocentState(state: DocentPersist) {
  try {
    localStorage.setItem(KEY_DOCENT, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): T {
  let last = 0;
  let timer: any = null;
  let pendingArgs: any[] | null = null;
  const run = () => {
    last = Date.now();
    timer = null;
    if (pendingArgs) {
      // @ts-ignore
      fn(...pendingArgs);
      pendingArgs = null;
    }
  };
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - last >= ms) {
      // @ts-ignore
      fn(...args);
      last = now;
    } else {
      pendingArgs = args;
      if (!timer) timer = setTimeout(run, ms - (now - last));
    }
  }) as T;
}
