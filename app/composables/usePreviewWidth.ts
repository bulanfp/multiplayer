import { ref } from "vue";

const STORAGE_KEY = "multiplayer.preview-width";

export const PREVIEW_WIDTH = { min: 360, default: 480, max: 1200 };

function readStored(): number | undefined {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

// One width for every output preview, remembered in this browser between visits.
const width = ref(readStored() ?? PREVIEW_WIDTH.default);

export function usePreviewWidth() {
  /** Clamps and applies a width; `persist` saves it once a drag or key press is done. */
  function setWidth(value: number, persist = true) {
    width.value = Math.round(Math.min(PREVIEW_WIDTH.max, Math.max(PREVIEW_WIDTH.min, value)));
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(width.value));
    } catch {
      // Storage can be blocked (private mode); the width still applies for this visit.
    }
  }

  return { width, setWidth };
}
