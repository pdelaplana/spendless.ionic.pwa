import { useEffect, useState } from 'react';

interface UseVisualViewportReturn {
  keyboardOffset: number;
}

export function useVisualViewport(): UseVisualViewportReturn {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const vp = window.visualViewport;
      if (!vp) return;
      const offset = window.innerHeight - vp.height - vp.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  return { keyboardOffset };
}
