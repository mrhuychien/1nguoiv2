"use client";

import { ReactFlowProvider } from "reactflow";
import { Navbar } from "@/components/dashboard/navbar";
import { Canvas, NodePanel } from "@/components/ideas";

export default function IdeasPage() {
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        <Navbar title="Idea Graph" />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <Canvas />
          </div>
          <NodePanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
