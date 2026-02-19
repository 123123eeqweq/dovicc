'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Scrolls to top on route change. Uses requestAnimationFrame to ensure scroll happens after layout. */
export function NavigationScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTop);
    });
  }, [pathname]);

  return null;
}
