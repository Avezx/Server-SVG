const repos = [
  { owner: "Avezx", repo: "Project1" },
  { owner: "Avezx", repo: "Project2" },
  { owner: "Avezx", repo: "Project3" }
];

async function fetchCommitData(owner, repo, projectId) {
  try {
    const response = await fetch(\`/commits?owner=\${owner}&repo=\${repo}\`);
    const data = await response.json();
    const commitMessage = data.message;
    const commitDate = data.date;
    const commitAuthor = data.author;

    const commitElement = document.getElementById(\`commit\${projectId}\`);
    commitElement.textContent = \`\${commitMessage} (\${commitDate}) przez \${commitAuthor}\`;

    const progressElement = document.getElementById(\`progress\${projectId}\`);
    progressElement.textContent = '75%';

    const descriptionElement = document.getElementById(\`description\${projectId}\`);
    descriptionElement.textContent = \`Opis projektu: \${repo}\`;
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
  }
}

repos.forEach((repo, index) => fetchCommitData(repo.owner, repo.repo, index + 1));