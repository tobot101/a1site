const path = require("path");
const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: "7d",
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`A1 Clean Up site listening on ${PORT}`);
});
