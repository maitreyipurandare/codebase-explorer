export async function getRepository(owner: string, repository: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repository}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repository");
  }
  return response.json();
}

export async function getRepositoryFiles(
  owner: string,
  repository: string,
  branch: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repository}/git/trees/${branch}?recursive=1`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repository files");
  }

  return response.json();
}

export async function getFileContent(
  owner: string,
  repository: string,
  path: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repository}/contents/${path}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${path}`);
  }

  const data = await response.json();

  return atob(data.content.replace(/\n/g, ""));
}
