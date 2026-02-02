"use client";

import { Plus, ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useIdeaStore } from "@/store/idea-store";
import { useIdeaData } from "@/hooks/use-idea-data";

export function Toolbar() {
  const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
  const { addNode, selectedNodeId, deleteNode } = useIdeaStore();
  const { userId } = useIdeaData();

  const handleAddNode = () => {
    if (!userId) return;
    const viewport = getViewport();
    // Add node at center of viewport
    const x = (-viewport.x + 400) / viewport.zoom;
    const y = (-viewport.y + 300) / viewport.zoom;
    addNode(x, y, userId);
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Obsidian-style minimal toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddNode}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/80 border-white/10 text-gray-200">
              Thêm node (N)
            </TooltipContent>
          </Tooltip>

          <div className="h-px bg-white/10 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomIn()}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/80 border-white/10 text-gray-200">
              Phóng to
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomOut()}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/80 border-white/10 text-gray-200">
              Thu nhỏ
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fitView({ padding: 0.3 })}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/80 border-white/10 text-gray-200">
              Fit view
            </TooltipContent>
          </Tooltip>

          {selectedNodeId && (
            <>
              <div className="h-px bg-white/10 mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-black/80 border-white/10 text-gray-200">
                  Xóa node (Delete)
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
