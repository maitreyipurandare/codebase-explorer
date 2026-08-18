import type { Codebase, CodeFile } from "../types/Codebase";
import { getFileContent } from "../services/github";
import { findImports } from "./parser";

export async function buildCodebase(
  owner: string,
  repository: string,
  files: { path: string; type: string }[]
): Promise<Codebase> {
  const codeFiles: CodeFile[] = [];
  const relationships: Codebase["relationships"] = [];
  for (const file of files) {
    console.log("PROCESSING FILE:", file);

    if (file.type !== "blob") {
      continue;
    }

    const isCodeFile =
      file.path.endsWith(".js") ||
      file.path.endsWith(".jsx") ||
      file.path.endsWith(".ts") ||
      file.path.endsWith(".tsx");

    if (!isCodeFile) {
      continue;
    }
    let code: string;

    try {
      code = await getFileContent(owner, repository, file.path);
    } catch (error) {
      console.warn(`Could not fetch ${file.path}, skipping.`);
      continue;
    }
    const codeFile: CodeFile = {
      id: file.path,
      name: file.path.split("/").pop() ?? file.path,
      path: file.path,
      language:
        file.path.endsWith(".ts") || file.path.endsWith(".tsx")
          ? "TypeScript"
          : "JavaScript",
      code,
    };

    codeFiles.push(codeFile);
  }

  for (const codeFile of codeFiles) {
    const imports = findImports(codeFile.code);

    for (const importPath of imports) {
      const importedFile = codeFiles.find((candidate) => {
        const candidateWithoutExtension = candidate.path.replace(
          /\.(js|jsx|ts|tsx)$/,
          ""
        );

        const normalizedImport = importPath.replace(/^\.\//, "");

        return candidateWithoutExtension.endsWith(normalizedImport);
      });

      if (importedFile) {
        relationships.push({
          source: codeFile.id,
          target: importedFile.id,
          type: "imports",
        });
      }
    }
  }

  return {
    files: codeFiles,
    relationships,
  };
}
