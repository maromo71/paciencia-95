import { useLayoutEffect, useState } from 'react';
import { isTauri } from '@tauri-apps/api/core';

export function useViewportScale(width, height) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const inTauri = isTauri();
      const availableWidth = inTauri ? window.innerWidth - 16 : window.innerWidth - 24;
      const availableHeight = inTauri ? window.innerHeight - 56 : window.innerHeight - 24;
      const maxScale = inTauri ? 2.5 : 1.35;
      const targetWidth = inTauri ? 640 : width;
      const targetHeight = inTauri ? 480 : height;
      const next = Math.min(
        availableWidth / targetWidth,
        availableHeight / targetHeight,
        maxScale,
      );
      setScale(Math.max(0.35, Number(next.toFixed(3))));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [width, height]);

  return scale;
}
