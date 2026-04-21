// Import and inject Vercel Speed Insights
import { injectSpeedInsights } from './_vercel/speed-insights.mjs';

// Initialize Speed Insights
injectSpeedInsights({
  debug: false,
  sampleRate: 1.0
});
