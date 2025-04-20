// Zmienna repozytoriów
const repos = [
  { owner: "Avezx", repo: "Project1" },
  { owner: "Avezx", repo: "Project2" },
  { owner: "Avezx", repo: "Project3" }
];

// Funkcja do pobrania ostatniego commita
async function fetchCommitData(owner, repo, projectId) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`);
    const data = await response.json();
    const commit = data[0];
    const commitMessage = commit.commit.message;
    const commitDate = commit.commit.author.date;
    const commitAuthor = commit.commit.author.name;

    const commitElement = document.getElementById(`commit${projectId}`);
    commitElement.textContent = `${commitMessage} (${commitDate}) przez ${commitAuthor}`;

    // Możesz dostosować poziom ukończenia ręcznie lub z API (np. z issue)
    const progressElement = document.getElementById(`progress${projectId}`);
    progressElement.textContent = '75%'; // Tu możesz użyć jakiejś logiki, żeby to się zmieniało.

    const descriptionElement = document.getElementById(`description${projectId}`);
    descriptionElement.textContent = `Opis projektu: ${repo}`;
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
  }
}

// Wywołanie funkcji dla każdego projektu
repos.forEach((repo, index) => fetchCommitData(repo.owner, repo.repo, index + 1));
