
import { useState, useEffect } from 'react';

export const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Use matchMedia to check for fine pointer, a good indicator of a mouse-based device.
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      setIsDesktop(isFinePointer);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isDesktop;
};
