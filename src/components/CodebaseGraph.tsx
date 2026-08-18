import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

interface CodebaseGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: NodeMouseHandler;
}

function CodebaseGraph({ nodes, edges, onNodeClick }: CodebaseGraphProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default CodebaseGraph;
