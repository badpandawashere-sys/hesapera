'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useRef } from 'react';

const GA_MEASUREMENT_ID = 'G-D4N3E0JL7Q';

function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || typeof window === 'undefined' || !(window as any).gtag) {
      return;
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Prevent double firing if the URL hasn't actually changed
    if (lastUrlRef.current !== url) {
      lastUrlRef.current = url;
      (window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Prevent the initial snippet from firing a page_view automatically.
            // This prevents duplicate page_views because the AnalyticsRouteTracker 
            // will manually fire the first one and all subsequent ones.
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false 
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>
    </>
  );
}