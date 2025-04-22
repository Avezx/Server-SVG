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
    'Go': 'GO',
    'C++': 'C++',
    'C#': 'C#',
    'Rust': 'RS',
    'Swift': 'SWIFT',
    'Kotlin': 'KT',
    'Dart': 'DART',
    'R': 'R',
    'Scala': 'SCALA',
    'Shell': 'SH',
    'PowerShell': 'PS',

    'Markdown': 'MD',
    'Text': 'TXT',
    'JSON': 'JSON',
    'YAML': 'YML',
    'XML': 'XML',
    'CSV': 'CSV',
    'SQL': 'SQL',
    'Docker': 'DOCKER',
    'Jupyter Notebook': 'IPYNB'
  };
  return abbreviations[language] || language || 'Unknown';
};

const getTextColor = (bgColor) => {

  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#ffffff';
};

const getProgressColor = (progress) => {
  if (progress < 30) return '#ff4545';  
  if (progress < 70) return '#ffd644'; 
  return '#44ff88';                   
};

const getStatusColor = (status) => {
  const colors = {
    'done': '#44ff88',
    'in production': '#ffd644',
    'closed': '#ff4545'
  };
  return colors[status.toLowerCase()] || '#8b949e';
};

app.get("/badge.svg", async (req, res) => {
  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const repos = response.data.slice(0, 3);

    const projectsPromises = repos.map(async repo => {
      let progress = 0;
      let status = 'in production';
      

      if (repo.name === 'avezx' || repo.name === 'avez') {
        progress = 99.99;
        status = 'done';
      } else {
        try {
          const progressUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/contents/progress.json`;
          const progressResponse = await axios.get(progressUrl, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3.raw"
            }
          });
          
          if (progressResponse.data) {
            progress = progressResponse.data.progress || 0;
            status = progressResponse.data.status || 'in production';
          }
        } catch (err) {
          console.error(`No progress.json found for ${repo.name}`);
        }
      }

      return {
        name: repo.name,
        description: (repo.description || "Brak opisu").length > 20 
          ? (repo.description || "Brak opisu").substring(0, 20) + "..." 
          : (repo.description || "Brak opisu"),
        stars: repo.stargazers_count,
        url: repo.html_url,
        language: ['avezx', 'avez'].includes(repo.name) ? 'Markdown' : (repo.language || "NULL"),
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        issues: repo.open_issues_count,
        updated: new Date(repo.updated_at).toLocaleDateString(),
        created: new Date(repo.created_at).toLocaleDateString(),
        size: `${(repo.size/1024).toFixed(2)} MB`,
        license: repo.license ? repo.license.name : "Brak licencji",
        isPrivate: repo.private,
        isFork: repo.fork,
        status: status,
        progress: progress
      };
    });

    const projects = await Promise.all(projectsPromises);

    const svgWidth = 800;
    const projectWidth = svgWidth / 3;
    const svgHeight = 100 + (projects.length * 20); 

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
          .details { fill: #ffffff; font-family: monospace; font-size: 12px; }
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
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'C++': '#f34b7d',
            'C#': '#178600',
            'Rust': '#dea584',
            'Swift': '#ffac45',
            'Kotlin': '#A97BFF',
            'Dart': '#00B4AB',
            'R': '#198CE7',
            'Scala': '#c22d40',
            'Shell': '#89e051',
            'PowerShell': '#012456',
       
            'Markdown': '#083fa1',
            'Text': '#4f4f4f',
            'JSON': '#292929',
            'YAML': '#cb171e',
            'XML': '#0060ac',
            'CSV': '#237346',
            'SQL': '#e38c00',
            'Docker': '#384d54',
            'Jupyter Notebook': '#DA5B0B',
            'Unknown': '#8b949e'
          };
          const bgColor = langColors[project.language] || langColors['Unknown'];
          const textColor = getTextColor(bgColor);
          const langAbbr = getLanguageAbbreviation(project.language);
          const progressWidth = (project.progress / 100) * 140; // 140px is total width
          const progressColor = getProgressColor(project.progress);
          
          return `
            <g transform="translate(${xPos}, 0)">
              <text x="70" y="30" class="project">${project.name}</text>
              <text x="70" y="50" class="description">${project.description}</text>

              <rect x="70" y="60" width="40" height="20" rx="6" ry="6" fill="${bgColor}" filter="url(#shadow)"/>
              <text x="90" y="74" class="lang-tag" fill="${textColor}" text-anchor="middle">${langAbbr}</text>

              <rect x="120" y="60" width="40" height="20" rx="6" ry="6" fill="#000000" filter="url(#shadow)"/>
              <text x="140" y="74" class="lang-tag" fill="white" text-anchor="middle">⭐ ${project.stars}</text>

              <rect x="170" y="60" width="40" height="20" rx="6" ry="6" fill="#000000" filter="url(#shadow)"/>
              <text x="190" y="74" class="lang-tag" fill="white" text-anchor="middle">👀 ${project.watchers}</text>

              <rect x="70" y="90" width="140" height="20" rx="6" ry="6" fill="${getStatusColor(project.status)}" filter="url(#shadow)"/>
              <text x="140" y="104" class="lang-tag" fill="${getTextColor(getStatusColor(project.status))}" text-anchor="middle">${project.status}</text>

              <rect x="70" y="120" width="140" height="5" rx="2" ry="2" fill="gray" filter="url(#shadow)"/>
              <rect x="70" y="120" width="${progressWidth}" height="5" rx="2" ry="2" fill="${progressColor}" filter="url(#shadow)"/>
              
              <text x="70" y="140" class="details">Postęp: ${project.progress}%</text>

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