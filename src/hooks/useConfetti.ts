import { useCallback } from 'react';

// Dynamically import canvas-confetti so it doesn't block app load
export function useConfetti() {
  const fire = useCallback(async (type: 'milestone' | 'success' | 'celebrate' = 'success') => {
    try {
      const confetti = (await import('canvas-confetti')).default;

      if (type === 'milestone') {
        // Two-burst for big milestones
        const opts = {
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#f59e0b','#fbbf24'],
        };
        confetti({ ...opts, angle: 60,  origin: { x: 0.1, y: 0.6 } });
        setTimeout(() => confetti({ ...opts, angle: 120, origin: { x: 0.9, y: 0.6 } }), 180);
      } else if (type === 'celebrate') {
        // Sustained rain
        const end = Date.now() + 1800;
        const frame = () => {
          confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0 }, colors: ['#6366f1','#a78bfa'] });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#8b5cf6','#f59e0b'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      } else {
        // Quick pop
        confetti({
          particleCount: 45,
          spread: 52,
          origin: { y: 0.65 },
          colors: ['#6366f1','#8b5cf6','#10b981'],
        });
      }
    } catch { /* no-op if import fails */ }
  }, []);

  return { fire };
}
