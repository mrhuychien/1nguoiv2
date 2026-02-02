"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic import ReactFlow components (heavy library ~400KB)
const ReactFlowProvider = dynamic(
  () => import("reactflow").then((mod) => mod.ReactFlowProvider),
  { ssr: false }
);

const Canvas = dynamic(
  () => import("@/components/ideas").then((mod) => mod.Canvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="text-sm text-gray-400">Đang tải Idea Graph...</span>
        </div>
      </div>
    ),
  }
);

const NodePanel = dynamic(
  () => import("@/components/ideas").then((mod) => mod.NodePanel),
  { ssr: false }
);

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
