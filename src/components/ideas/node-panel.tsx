"use client";

import { X, Trash2, Link2, Link2Off } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "./color-picker";
import { useIdeaStore } from "@/store/idea-store";

export function NodePanel() {
  const {
    getSelectedNode,
    updateNode,
    deleteNode,
    selectNode,
    getNodeLinks,
    nodes,
    connectMode,
    connectSourceId,
    startConnectMode,
    cancelConnectMode,
    deleteLink,
  } = useIdeaStore();
  const selectedNode = getSelectedNode();

  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-border bg-background-secondary p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Chọn một node
        </h3>
        <p className="text-sm text-text-secondary">
          Click vào node để chỉnh sửa nội dung và màu sắc
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-background-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">Chỉnh sửa node</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => selectNode(null)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            value={selectedNode.title}
            onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
            placeholder="Nhập tiêu đề..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={selectedNode.description || ""}
            onChange={(e) =>
              updateNode(selectedNode.id, { description: e.target.value || null })
            }
            placeholder="Thêm mô tả cho ý tưởng..."
            className="min-h-[100px]"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label>Màu sắc</Label>
          <ColorPicker
            value={selectedNode.color}
            onChange={(color) => updateNode(selectedNode.id, { color })}
          />
        </div>

        {/* Connect Button */}
        <div className="space-y-2 pt-2">
          <Label>Kết nối</Label>
          {connectMode && connectSourceId === selectedNode.id ? (
            <Button
              variant="outline"
              className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
              onClick={cancelConnectMode}
            >
              <Link2Off className="h-4 w-4 mr-2" />
              Hủy kết nối
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-cyan/50 text-cyan hover:bg-cyan/10"
              onClick={() => startConnectMode(selectedNode.id)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Kết nối với node khác
            </Button>
          )}
          <p className="text-xs text-text-muted">
            Click nút trên rồi click vào node muốn kết nối
          </p>
        </div>

        {/* Current Connections */}
        {(() => {
          const nodeLinks = getNodeLinks(selectedNode.id);
          if (nodeLinks.length === 0) return null;

          return (
            <div className="space-y-2 pt-2">
              <Label>Đã kết nối ({nodeLinks.length})</Label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {nodeLinks.map((link) => {
                  const connectedNodeId =
                    link.source_id === selectedNode.id
                      ? link.target_id
                      : link.source_id;
                  const connectedNode = nodes.find((n) => n.id === connectedNodeId);

                  if (!connectedNode) return null;

                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 bg-background-tertiary rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: connectedNode.color }}
                        />
                        <span className="text-sm text-text-secondary truncate max-w-[150px]">
                          {connectedNode.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-text-muted hover:text-red-400"
                        onClick={() => deleteLink(link.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="danger"
          className="w-full"
          onClick={() => deleteNode(selectedNode.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa node
        </Button>
      </div>
    </div>
  );
}
