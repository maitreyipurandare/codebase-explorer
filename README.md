Codebase Explorer:

An interactive web application that visualizes the relationships between files in a GitHub repository. Users can enter a public GitHub repository, explore its file structure as an interactive dependency graph, search for files, and inspect source code and import relationships.

Features:
GitHub Repository Analysis
Interactive Dependency Graph
File Search
File Details
Import Relationships

Tech Stack:
React
TypeScript
Vite
React Flow
GitHub REST API
CSS

How It Works:
The user enters a public GitHub repository URL.
The application retrieves the repository's file tree using the GitHub API.
Source files are downloaded and analyzed for import statements.
Import paths are matched to files within the repository.
The resulting files and relationships are represented as a graph.
Users can select, search, and explore individual files and their dependencies.

Getting started:
Clone the repository.

git clone (https://github.com/maitreyipurandare/codebase-explorer)
cd codebase-explorer

Install dependencies:

npm install

Start the development server:

npm run dev

Then open the local URL provided by Vite in your browser.
