"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function detectDeviceType(ua: string): string {
  if (/android/i.test(ua)) return "mobile";
  if (/iPhone|iPad|iPod/i.test(ua)) return "mobile";
  if (/tablet/i.test(ua)) return "tablet";
  return "desktop";
}

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    let cancelled = false;
    const run = async () => {
      const { trackPageView } = await import("@/lib/analytics/track");
      if (cancelled) return;
      await trackPageView(
        pathname,
        document.referrer || null,
        detectDeviceType(navigator.userAgent)
      );
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}