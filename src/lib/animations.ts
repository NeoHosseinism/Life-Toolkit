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

/** Card entrance with stagger index — cards appearing in a list */
export const cardEntrance = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

/** Slide in from right — for panels / drawers */
export const slideInFromRight = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, x: 40, transition: elementTx },
};

/** Slide in from left — for RTL panels */
export const slideInFromLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, x: -40, transition: elementTx },
};

/** Page transition with blur — smooth navigation */
export const pageTransition = {
  initial: { opacity: 0, x: -16, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0,   filter: 'blur(0px)', transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, x: 16,  filter: 'blur(4px)', transition: elementTx },
};

/** Modal / dialog entrance */
export const modalEntrance = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: spring },
  exit:    { opacity: 0, scale: 0.97, y: 4, transition: elementTx },
};

/** Toast — slides in from bottom-right */
export const toastSlide = {
  initial: { opacity: 0, y: 24, scale: 0.95 },
  animate: { opacity: 1, y: 0,  scale: 1,   transition: spring },
  exit:    { opacity: 0, y: 8,  scale: 0.97, transition: elementTx },
};
