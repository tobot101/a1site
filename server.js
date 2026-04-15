const path = require("path");
const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const CANONICAL_HOST = "www.a1cleanupservices.com";

app.enable("trust proxy");
app.disable("x-powered-by");
app.use((req, res, next) => {
  const host = (req.get("x-forwarded-host") || req.get("host") || "").split(",")[0].trim();

  if (host === "a1cleanupservices.com") {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }

  return next();
});

app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: "1h",
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
  },
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`A1 Clean Up site listening on ${PORT}`);
});
