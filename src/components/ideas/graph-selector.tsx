"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/modal";
import { useIdeaStore } from "@/store/idea-store";
import { cn } from "@/lib/utils";

interface GraphSelectorProps {
  userId: string;
}

export function GraphSelector({ userId }: GraphSelectorProps) {
  const {
    graphs,
    graphId,
    createGraph,
    updateGraph,
    deleteGraph,
    selectGraph,
  } = useIdeaStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGraphTitle, setNewGraphTitle] = useState("");
  const [editingGraphId, setEditingGraphId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentGraph = graphs.find((g) => g.id === graphId);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setEditingGraphId(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCreate = async () => {
    if (!newGraphTitle.trim()) return;
    const newGraph = await createGraph(userId, newGraphTitle.trim());
    if (newGraph) {
      await selectGraph(newGraph.id);
    }
    setNewGraphTitle("");
    setIsCreating(false);
    setIsOpen(false);
  };

  const handleStartEdit = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGraphId(id);
    setEditTitle(title);
  };

  const handleSaveEdit = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!editingGraphId || !editTitle.trim()) return;
    await updateGraph(editingGraphId, { title: editTitle.trim() });
    setEditingGraphId(null);
    setEditTitle("");
  };

  const handleDelete = async (id: string) => {
    await deleteGraph(id);
    setDeleteConfirmId(null);
  };

  const handleSelectGraph = async (id: string) => {
    if (editingGraphId) return;
    await selectGraph(id);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <Button
        variant="ghost"
        className="h-9 px-3 gap-2 bg-black/50 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-black/60"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Network className="h-4 w-4 text-cyan-400" />
        <span className="text-sm text-white max-w-[150px] truncate">
          {currentGraph?.title || "Chọn graph"}
        </span>
        <ChevronDown className={cn("h-3 w-3 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Graph list */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {graphs.map((graph) => (
              <div
                key={graph.id}
                className={cn(
                  "flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer group",
                  graph.id === graphId ? "bg-cyan-500/10" : "hover:bg-white/5"
                )}
                onClick={() => handleSelectGraph(graph.id)}
              >
                {editingGraphId === graph.id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-sm bg-gray-800 border-gray-700"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") setEditingGraphId(null);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      onClick={(e) => handleSaveEdit(e)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-gray-400 hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGraphId(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Network
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          graph.id === graphId ? "text-cyan-400" : "text-gray-500"
                        )}
                      />
                      <span className="truncate text-sm">{graph.title}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10"
                        onClick={(e) => handleStartEdit(graph.id, graph.title, e)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      {graphs.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(graph.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-2" />

          {/* Create new graph */}
          <div className="p-2">
            {isCreating ? (
              <div className="flex items-center gap-1">
                <Input
                  placeholder="Tên graph mới..."
                  value={newGraphTitle}
                  onChange={(e) => setNewGraphTitle(e.target.value)}
                  className="h-8 text-sm bg-gray-800 border-gray-700"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") {
                      setIsCreating(false);
                      setNewGraphTitle("");
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                  onClick={handleCreate}
                  disabled={!newGraphTitle.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-400 hover:text-gray-300"
                  onClick={() => {
                    setIsCreating(false);
                    setNewGraphTitle("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 w-full p-2 rounded-md text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Tạo graph mới</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Xóa graph?</ModalTitle>
          </ModalHeader>
          <p className="text-sm text-gray-400">
            Bạn có chắc muốn xóa graph này? Tất cả nodes và links trong graph sẽ bị xóa vĩnh viễn.
          </p>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
