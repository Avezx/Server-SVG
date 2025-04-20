async function fetchLatestRepos() {
  try {
    const response = await fetch('https://api.github.com/users/Avezx/repos?sort=created&direction=desc&per_page=3');
    const repos = await response.json();

    repos.forEach((repo, index) => {
      const projectElement = document.getElementById(`project${index + 1}`);
      if (projectElement) {
        projectElement.querySelector('.repo-name').textContent = repo.name;
        projectElement.querySelector('.repo-description').textContent = repo.description || 'Brak opisu';
        projectElement.querySelector('.repo-updated').textContent = `Ostatnia aktualizacja: ${new Date(repo.updated_at).toLocaleDateString()}`;
      }
    });
  } catch (error) {
    console.error('Błąd podczas pobierania danych z GitHub:', error);
  }
}

fetchLatestRepos();