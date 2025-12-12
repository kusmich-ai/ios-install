"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ color: '#ff9e19', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            The error has been logged and we&apos;ll look into it.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff9e19',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
