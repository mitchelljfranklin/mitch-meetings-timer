import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const distDir = join(__dirname, "dist");

app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' teams.microsoft.com *.teams.microsoft.com *.teams.microsoft.us *.skype.com *.office.com *.cloud.microsoft"
  );
  next();
});

app.use(express.static(distDir));

app.use((_req, res) => {
  res.sendFile(join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
