export function findImports(code: string): string[] {
  const imports: string[] = [];

  const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.+?)['"]/g;

  let match;

  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}
