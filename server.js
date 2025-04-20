const express = require("express");
const axios = require("axios");
const app = express();

const GITHUB_USERNAME = "avezx";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.get("/badge.svg", async (req, res) => {
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const repos = response.data.slice(0, 3);

    const projects = repos.map(repo => ({
      name: repo.name,
      description: repo.description || "Brak opisu",
      stars: repo.stargazers_count,
      url: repo.html_url
    }));

    const svgWidth = 500;
    const projectWidth = svgWidth / 3;  // Zmniejszona szerokość dla 3 projektów
    const svgHeight = 40 + (projects.length * 30);  // Zmniejszenie wysokości do minimalnej

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(`
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg">
        <style>
          .text { fill: #ffffff; font-family: monospace; font-size: 14px; }
          .title { fill: #ffffff; font-family: monospace; font-size: 18px; font-weight: bold; }
          .project { fill: #58a6ff; font-family: monospace; font-size: 16px; }
          .description { fill: #8b949e; font-family: monospace; font-size: 12px; }
          .stars { fill: #f1e05a; font-family: monospace; font-size: 12px; }
        </style>
        <rect width="100%" height="100%" fill="#0d1117" rx="10" ry="10"/>
        
        ${projects.map((project, i) => {
          const xPos = i * projectWidth;
          return `
            <g transform="translate(${xPos}, 0)">
              <text x="20" y="30" class="project">${project.name}</text>
              <text x="20" y="50" class="description">${project.description}</text>
              <text x="20" y="70" class="stars">⭐ ${project.stars} gwiazdek</text>
            </g>
          `;
        }).join('')}
        
      </svg>
    `);
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(`
      <svg width="500" height="100" viewBox="0 0 500 100" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg">
        <style>
          .text { fill: #ffffff; font-family: monospace; font-size: 16px; }
        </style>
        <rect width="100%" height="100%" fill="#0d1117" rx="10" ry="10"/>
        <text x="20" y="40" class="text">⚠️ Błąd podczas ładowania projektów</text>
      </svg>
    `);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));
