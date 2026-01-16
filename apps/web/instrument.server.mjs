import { init as initSentry } from "@sentry/tanstackstart-react";

if (process.env.VITE_SENTRY_DSN) {
  initSentry({
    dsn: process.env.VITE_SENTRY_DSN,
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 1.0,
    profileLifecycle: "trace",
    sendDefaultPii: true,
  });
} else {
  console.log("VITE_SENTRY_DSN is not set.");
}
