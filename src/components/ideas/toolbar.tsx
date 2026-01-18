"use client";

import { Plus, ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useIdeaStore } from "@/store/idea-store";

export function Toolbar() {
  const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
  const { addNode, selectedNodeId, deleteNode } = useIdeaStore();

  const handleAddNode = () => {
    const viewport = getViewport();
    // Add node at center of viewport
    const x = (-viewport.x + 400) / viewport.zoom;
    const y = (-viewport.y + 300) / viewport.zoom;
    addNode(x, y);
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-1 p-1 rounded-lg border border-border bg-background-secondary/90 backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddNode}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Thêm node (N)
            </TooltipContent>
          </Tooltip>

          <div className="h-px bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomIn()}
                className="h-9 w-9"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Phóng to
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomOut()}
                className="h-9 w-9"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Thu nhỏ
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fitView({ padding: 0.2 })}
                className="h-9 w-9"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Fit view (F)
            </TooltipContent>
          </Tooltip>

          {selectedNodeId && (
            <>
              <div className="h-px bg-border mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="h-9 w-9 text-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
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
