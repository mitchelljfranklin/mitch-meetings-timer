import express from "express";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const distDir = join(__dirname, "dist");

// Domains Teams loads tab content from. The app must be embeddable here, so we
// rely on CSP frame-ancestors instead of X-Frame-Options (which helmet would
// otherwise set to SAMEORIGIN and block Teams).
const teamsFrameAncestors = [
  "'self'",
  "teams.microsoft.com",
  "*.teams.microsoft.com",
  "*.teams.microsoft.us",
  "*.skype.com",
  "*.office.com",
  "*.cloud.microsoft",
];

app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        // Fluent UI (griffel) injects <style> elements at runtime.
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'"],
        "connect-src": ["'self'"],
        "frame-ancestors": teamsFrameAncestors,
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        // Removed so the production build can also be served over http locally.
        "upgrade-insecure-requests": null,
      },
    },
  })
);

app.use(express.static(distDir));

// SPA fallback. Using middleware (not app.get("*")) avoids the Express 5
// path-to-regexp wildcard syntax change.
app.use((_req, res) => {
  res.sendFile(join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
