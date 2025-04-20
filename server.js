const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/commits', async (req, res) => {
  const { owner, repo } = req.query;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`);
    const data = await response.json();
    const commit = data[0];
    res.json({
      message: commit.commit.message,
      date: commit.commit.author.date,
      author: commit.commit.author.name,
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd podczas pobierania danych z GitHub" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});