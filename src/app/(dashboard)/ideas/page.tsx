"use client";

import { ReactFlowProvider } from "reactflow";
import { Canvas, NodePanel } from "@/components/ideas";

export default function IdeasPage() {
  return (
    <ReactFlowProvider>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
        <div className="flex-1 min-h-[300px] md:min-h-0">
          <Canvas />
        </div>
        <NodePanel />
      </div>
    </ReactFlowProvider>
  );
}
