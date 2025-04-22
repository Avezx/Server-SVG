const express = require("express");
require('dotenv').config();
const axios = require("axios");
const app = express();

const GITHUB_USERNAME = "avezx";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const getLanguageAbbreviation = (language) => {
  const abbreviations = {
    'JavaScript': 'JS',
    'TypeScript': 'TS',
    'Python': 'PY',
    'Java': 'JAVA',
    'HTML': 'HTML',
    'CSS': 'CSS',
    'PHP': 'PHP',
    'Ruby': 'RB',
    'Go': 'GO'
  };
  return abbreviations[language] || language || '';
};

const getTextColor = (bgColor) => {
  // Convert hex to RGB and determine if text should be black or white
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#ffffff';
};

const getProgressColor = (progress) => {
  if (progress < 30) return '#ff4545';  // Red for low progress
  if (progress < 70) return '#ffd644';  // Yellow for medium progress
  return '#44ff88';                     // Green for high progress
};

app.get("/badge.svg", async (req, res) => {
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const repos = response.data.slice(0, 3);

    // Fetch progress for each repo
    const projectsPromises = repos.map(async repo => {
      let progress = 0;
      try {
        const progressUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/contents/progress.json`;
        const progressResponse = await axios.get(progressUrl, {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3.raw"
          }
        });
        
        if (progressResponse.data && progressResponse.data.progress) {
          progress = progressResponse.data.progress;
        }
      } catch (err) {
        console.error(`No progress.json found for ${repo.name}`);
      }

      return {
        name: repo.name,
        description: repo.description || "Brak opisu",
        stars: repo.stargazers_count,
        url: repo.html_url,
        language: repo.language || "",
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        issues: repo.open_issues_count,
        updated: new Date(repo.updated_at).toLocaleDateString(),
        created: new Date(repo.created_at).toLocaleDateString(),
        size: `${(repo.size/1024).toFixed(2)} MB`,
        license: repo.license ? repo.license.name : "Brak licencji",
        isPrivate: repo.private,
        isFork: repo.fork,
        progress: progress
      };
    });

    const projects = await Promise.all(projectsPromises);

    const svgWidth = 800;
    const projectWidth = svgWidth / 3;
    const svgHeight = 100 + (projects.length * 20); // Increased height to accommodate language

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(`
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .text { fill: #ffffff; font-family: monospace; font-size: 16px; }
          .title { fill: #ffffff; font-family: monospace; font-size: 22px; font-weight: bold; }
          .project { fill: #58a6ff; font-family: monospace; font-size: 18px; font-weight: bold; }
          .description { fill: #ffffff; font-family: monospace; font-size: 14px; }
          .stats { fill: #ffffff; font-family: monospace; font-size: 14px; }
          .details { fill: #ffffff; font-family: monospace; font-size: 14px; }
          .lang-tag { font-family: monospace; font-size: 12px; font-weight: bold; }
        </style>
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.25"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#151515" rx="10" ry="10"/>
        
        ${projects.map((project, i) => {
          const xPos = i * projectWidth;
          const langColors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'TypeScript': '#2b7489',
            'Java': '#b07219',
            'CSS': '#563d7c',
            'HTML': '#e34c26',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Unknown': '#151515'
          };
          const bgColor = langColors[project.language] || langColors['Unknown'];
          const textColor = getTextColor(bgColor);
          const langAbbr = getLanguageAbbreviation(project.language);
          const progressWidth = (project.progress / 100) * 140; // 140px is total width
          const progressColor = getProgressColor(project.progress);
          
          return `
            <g transform="translate(${xPos}, 0)">
              <text x="70" y="40" class="project">${project.name}</text>
              <text x="70" y="60" class="description">${project.description}</text>

              <rect x="70" y="70" width="40" height="20" rx="6" ry="6" fill="${bgColor}" filter="url(#shadow)"/>
              <text x="90" y="84" class="lang-tag" fill="${textColor}" text-anchor="middle">${langAbbr}</text>

              <rect x="120" y="70" width="40" height="20" rx="6" ry="6" fill="#000000" filter="url(#shadow)"/>
              <text x="140" y="84" class="lang-tag" fill="white" text-anchor="middle">⭐ ${project.stars}</text>

              <rect x="170" y="70" width="40" height="20" rx="6" ry="6" fill="#000000" filter="url(#shadow)"/>
              <text x="190" y="84" class="lang-tag" fill="white" text-anchor="middle">👀 ${project.watchers}</text>

              <rect x="70" y="100" width="140" height="5" rx="2" ry="2" fill="gray" filter="url(#shadow)"/>
              <rect x="70" y="100" width="${progressWidth}" height="5" rx="2" ry="2" fill="${progressColor}" filter="url(#shadow)"/>
              
              <text x="70" y="120" class="details">Postęp: ${project.progress}%</text>

            </g>
          `
        }).join('')}
      </svg>
    `);
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.send(`
      <svg width="800" height="100" viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg">
        <style>
          rect { fill: #151515 !important; }
          .text { fill: #ffffff; font-family: monospace; font-size: 16px; }
        </style>
        <rect width="100%" height="100%" rx="10" ry="10"/>
        <text x="20" y="40" class="text">⚠️ Błąd podczas ładowania projektów</text>
      </svg>
    `);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));