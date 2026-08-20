import { useState } from "react";
import { sampleCodebase } from "./data/sampleCodebase";
import type { Node, Edge } from "@xyflow/react";
import CodebaseGraph from "./components/CodebaseGraph";
import "./App.css";
import { findImports } from "./utils/parser";
import {
  getRepository,
  getRepositoryFiles,
  getFileContent,
} from "./services/github";
import type { Codebase } from "./types/Codebase";
import { buildCodebase } from "./utils/buildCodebase";

function App() {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [exploredRepository, setExploredRepository] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [codebase, setCodebase] = useState<Codebase>(sampleCodebase);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExploring, setIsExploring] = useState(false);

  const selectedFile = codebase.files.find(
    (file) => file.id === selectedFileId
  );

  const selectedFileImports = codebase.relationships.filter(
    (relationship) => relationship.source === selectedFileId
  );

  const selectedFileImportedBy = codebase.relationships.filter(
    (relationship) => relationship.target === selectedFileId
  );

  const connectedFileIds = new Set([
    selectedFileId,
    ...selectedFileImports.map((relationship) => relationship.target),
    ...selectedFileImportedBy.map((relationship) => relationship.source),
  ]);

  const matchingFileIds = new Set(
    codebase.files
      .filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((file) => file.id)
  );

  const matchingFiles = codebase.files.filter((file) =>
    matchingFileIds.has(file.id)
  );

  const nodes: Node[] = codebase.files.map((file, index) => ({
    id: file.id,
    position: {
      x: 100 + (index % 2) * 300,
      y: 100 + Math.floor(index / 2) * 200,
    },
    data: {
      label: file.name,
    },
    style: {
      border:
        file.id === selectedFileId
          ? "3px solid black"
          : connectedFileIds.has(file.id)
            ? "2px solid #888"
            : "1px solid #ccc",
      boxShadow:
        file.id === selectedFileId
          ? "0 0 10px rgba(0, 0, 0, 0.25)"
          : connectedFileIds.has(file.id)
            ? "0 0 5px rgba(0, 0, 0, 0.1)"
            : "none",

      opacity:
        (searchQuery === "" && selectedFileId === null) ||
        connectedFileIds.has(file.id)
          ? 1
          : searchQuery !== "" && matchingFileIds.has(file.id)
            ? 1
            : 0.35,
    },
  }));

  const edges: Edge[] = codebase.relationships.map((relationship, index) => {
    const isConnected =
      relationship.source === selectedFileId ||
      relationship.target === selectedFileId;
    return {
      id: `edge-${index}`,
      source: relationship.source,
      target: relationship.target,
      label: isConnected ? relationship.type : undefined,
      markerEnd: {
        type: "arrowclosed",
        color: "#000",
      },
      style: {
        stroke: "#000",
        strokeWidth: isConnected ? 3 : 1,
        opacity: selectedFileId === null || isConnected ? 1 : 0.2,
      },
    };
  });

  async function handleExplore() {
    setStatusMessage(null);
    setIsExploring(true);

    try {
      const url = new URL(repositoryUrl);
      const parts = url.pathname.split("/").filter(Boolean);

      const owner = parts[0];
      const repository = parts[1];

      if (!owner || !repository) {
        throw new Error("Invalid GitHub repository URL");
      }

      const repoData = await getRepository(owner, repository);
      const files = await getRepositoryFiles(
        owner,
        repository,
        repoData.default_branch
      );

      // console.log("TREE FILES:", files.tree);

      const newCodebase = await buildCodebase(owner, repository, files.tree);
      // console.log("NEW CODEBASE:", newCodebase);

      setCodebase(newCodebase);

      const firstFile = files.tree.find(
        (file: { type: string; path: string }) =>
          file.type === "blob" &&
          (file.path.endsWith(".js") ||
            file.path.endsWith(".jsx") ||
            file.path.endsWith(".ts") ||
            file.path.endsWith(".tsx"))
      );

      if (firstFile) {
        const content = await getFileContent(owner, repository, firstFile.path);

        // console.log("FILE:", firstFile.path);
        // console.log("CONTENT:", content);

        const imports = findImports(content);

        // console.log("IMPORTS:", imports);
      }
      // console.log("REPOSITORY:", repoData);
      // console.log("FILES:", files);

      if (newCodebase.files.length === 0) {
        setStatusMessage(
          "No JavaScript/TypeScript files found in this repository."
        );
      } else {
        setStatusMessage(null);
      }

      setExploredRepository(repositoryUrl);
    } catch (error) {
      console.error("Github ERROR: ", error);

      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Something went wrong exploring this repository.");
      }
    } finally {
      setIsExploring(false);
    }
  }

  function handleNodeClick(_event: React.MouseEvent, node: Node) {
    setSelectedFileId(node.id);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Codebase Explorer</h1>

        <div className="repository-input">
          <input
            type="text"
            placeholder="Enter a GitHub repository URL!"
            value={repositoryUrl}
            onChange={(event) => setRepositoryUrl(event.target.value)}
          />
          <button onClick={handleExplore} disabled={isExploring}>
            {isExploring ? "Exploring..." : "Explore"}
          </button>
        </div>

        {statusMessage && <p className="status-message">{statusMessage}</p>}

        <div className="search-input">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {searchQuery !== "" && (
          <div className="search-results">
            {matchingFiles.length > 0 ? (
              matchingFiles.map((file) => (
                <button
                  className={`search-result ${
                    file.id === selectedFileId ? "selected" : ""
                  }`}
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <strong>{file.name}</strong>
                  <span>{file.path}</span>
                </button>
              ))
            ) : (
              <p className="no-results">No matching files.</p>
            )}
          </div>
        )}
      </header>

      <main className="main-content">
        <section className="codebase-map">
          <h2>Codebase Map</h2>

          <div className="graph-container">
            <CodebaseGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
            />
          </div>
        </section>

        <section className="details-panel">
          <h2>Details</h2>

          {selectedFile ? (
            <div>
              <h3>{selectedFile.name}</h3>

              <p>
                <strong>Path:</strong>
                <br />
                {selectedFile.path}
              </p>

              <h4> Code </h4>
              <pre className="code-preview">
                <code>{selectedFile.code}</code>
              </pre>

              <p>
                <strong>Language:</strong>
                <br />
                {selectedFile.language}
              </p>

              <h4>Imports</h4>

              {selectedFileImports.length > 0 ? (
                <ul>
                  {selectedFileImports.map((relationship) => {
                    const importedFile = codebase.files.find(
                      (file) => file.id === relationship.target
                    );

                    return (
                      <li key={relationship.target}>{importedFile?.name}</li>
                    );
                  })}
                </ul>
              ) : (
                <p>No imports.</p>
              )}

              <h4>Imported By</h4>
              {selectedFileImportedBy.length > 0 ? (
                <ul>
                  {selectedFileImportedBy.map((relationship) => {
                    const importedByFile = codebase.files.find(
                      (file) => file.id === relationship.source
                    );

                    return (
                      <li key={relationship.source}>{importedByFile?.name}</li>
                    );
                  })}
                </ul>
              ) : (
                <p>Not imported by any files.</p>
              )}
            </div>
          ) : (
            <p>Select a file or module to see its details.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
