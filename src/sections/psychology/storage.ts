import type { PsychologyState } from './types';
import { DEFAULT_PSYCHOLOGY_STATE } from './types';

const KEY = 'selfmonitor-psychology';

export function loadPsychState(): PsychologyState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PSYCHOLOGY_STATE;
    return { ...DEFAULT_PSYCHOLOGY_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PSYCHOLOGY_STATE;
  }
}

export function savePsychState(state: PsychologyState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[psych-storage] save failed', e);
  }
}

// Helper hook pattern — call inside components
import { useState, useCallback } from 'react';

export function usePsychState() {
  const [state, setStateRaw] = useState<PsychologyState>(loadPsychState);

  const setState = useCallback((updater: (prev: PsychologyState) => PsychologyState) => {
    setStateRaw(prev => {
      const next = updater(prev);
      savePsychState(next);
      return next;
    });
  }, []);

  return [state, setState] as const;
}
