const express = require('express');
const path = require('path');

const app = express();

// Serwowanie plików statycznych z folderu 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint do zwracania commity
app.get('/commits', async (req, res) => {
  const fetch = require('node-fetch');
  const owner = "Avezx";
  const repo = "Project1"; // Możesz tu dodać logikę na dynamiczne repozytoria

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
