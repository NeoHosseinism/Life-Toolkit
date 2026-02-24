// ─── Shared animation presets ─────────────────────────────────────────────────
// Use these everywhere for consistency

import type { Transition } from 'framer-motion';

/** Spring curve — for UI interactions that feel physical */
export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/** Page transitions — content entering/leaving */
export const pageTx: Transition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
};

/** Element micro-animations — quick state changes */
export const elementTx: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

/** Stagger children — list enters */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: pageTx },
};

/** Fade in from below — general use */
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: pageTx },
  exit:    { opacity: 0, y: -12, transition: elementTx },
};

/** Scale pop — for badges, toasts, milestones */
export const scalePop = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1, transition: spring },
  exit:    { opacity: 0, scale: 0.92, transition: elementTx },
};
