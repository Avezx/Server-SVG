const express = require("express");
const app = express();

const START_DATE = new Date("2019-04-15");

app.get("/", (req, res) => {
  const days = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24));
  const bugs = Math.floor(Math.random() * 20 + 5);
  const shame = Math.floor(Math.random() * 101);

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(`
    <svg width="480" height="120" xmlns="http://www.w3.org/2000/svg">
      <style>
        .text { fill: #ffffff; font-family: monospace; font-size: 16px; }
        .label { fill: #888; font-size: 14px; }
      </style>
      <rect width="100%" height="100%" fill="#0d1117" rx="10" ry="10"/>
      <text x="20" y="40" class="text">🕒 Dni bez aktywności: ${days}</text>
      <text x="20" y="70" class="text">🐞 Błędy w kodzie: ${bugs}</text>
    </svg>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Leżę i badge'uję na porcie ${port}`));
