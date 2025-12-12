import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
  
  // Session Replay (optional - captures user sessions)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",
  
  // Filter out noisy errors
  ignoreErrors: [
    // Network errors users cause
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    // Browser extensions
    "ResizeObserver loop",
  ],
});
