"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import { Search, X, Loader2, ZoomIn, ZoomOut, Crosshair, Pencil, Play, Plus, ArrowRight } from "lucide-react";
import { useIdeaStore } from "@/store/idea-store";
import { useIdeaData } from "@/hooks/use-idea-data";
import { GraphSelector } from "./graph-selector";

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  description: string | null;
  color: string;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: D3Node | string;
  target: D3Node | string;
}

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nodesDataRef = useRef<D3Node[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editMode, setEditMode] = useState(true); // Start in edit mode by default
  const [selectedNodePosition, setSelectedNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeTitle, setEditingNodeTitle] = useState("");
  const [editingNodePosition, setEditingNodePosition] = useState<{ x: number; y: number } | null>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Load data from Supabase
  const { isLoading, userId } = useIdeaData();

  const {
    nodes: storeNodes,
    links: storeLinks,
    addNode,
    addLink,
    deleteNode,
    updateNode,
    selectNode,
    selectedNodeId,
    searchQuery,
    searchResults,
    setSearchQuery,
    clearSearch,
    connectMode,
    connectSourceId,
    startConnectMode,
    cancelConnectMode,
    completeConnection,
    saveNodePosition,
  } = useIdeaStore();

  // Main D3 setup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || storeNodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#0a0a0f");

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Save current transform for preservation across re-renders
        currentTransformRef.current = event.transform;
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Restore previous transform or use initial
    const savedTransform = currentTransformRef.current;
    if (savedTransform && savedTransform !== d3.zoomIdentity) {
      svg.call(zoom.transform, savedTransform);
      g.attr("transform", savedTransform.toString());
    }

    // Prepare data
    const nodes: D3Node[] = storeNodes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      color: n.color,
      x: n.position_x,
      y: n.position_y,
    }));
    nodesDataRef.current = nodes;

    const links: D3Link[] = storeLinks.map((l) => ({
      id: l.id,
      source: l.source_id,
      target: l.target_id,
    }));

    // Calculate connection count for node sizing
    const connectionCount: Record<string, number> = {};
    nodes.forEach((n) => (connectionCount[n.id] = 0));
    storeLinks.forEach((l) => {
      connectionCount[l.source_id]++;
      connectionCount[l.target_id]++;
    });

    // Create force simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(links)
        .id((d) => d.id)
        .distance(120)
        .strength(0.2)
      )
      .force("charge", d3.forceManyBody<D3Node>()
        .strength(-400)
        .distanceMax(500)
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collision", d3.forceCollide<D3Node>().radius(50))
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    simulationRef.current = simulation;

    // Check if nodes have valid positions (from database)
    const nodesNeedLayout = nodes.some((n) =>
      n.x === undefined || n.y === undefined || n.x === null || n.y === null ||
      (n.x === 0 && n.y === 0)
    );

    // In edit mode, we need to handle layout carefully
    if (editMode) {
      if (nodesNeedLayout) {
        // Nodes don't have saved positions - run simulation briefly to calculate layout
        // Then stop and fix all nodes
        simulation.alpha(1);
        // Run simulation synchronously for a number of ticks to get stable positions
        for (let i = 0; i < 300; i++) {
          simulation.tick();
        }
        simulation.stop();
        // Fix all nodes at their calculated positions and save to database
        nodes.forEach((n) => {
          n.fx = n.x;
          n.fy = n.y;
          // Save the calculated position
          saveNodePosition(n.id);
        });
      } else {
        // Nodes have valid positions - just stop simulation and fix them
        simulation.stop();
        nodes.forEach((n) => {
          n.fx = n.x;
          n.fy = n.y;
        });
      }
    }

    // Create links (edges)
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(136, 136, 136, 0.3)")
      .attr("stroke-width", 1);

    // Create node groups
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, D3Node>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer");

    // Apply drag behavior
    const dragBehavior = d3.drag<SVGGElement, D3Node>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.call(dragBehavior as any);

    // Node glow effect (background blur)
    node.append("circle")
      .attr("class", "glow")
      .attr("r", (d) => {
        const count = connectionCount[d.id] || 1;
        return Math.min(8 + count * 3, 24) * 2;
      })
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.15)
      .style("filter", "blur(8px)");

    // Main node circle
    node.append("circle")
      .attr("class", "node-circle")
      .attr("r", (d) => {
        const count = connectionCount[d.id] || 1;
        return Math.min(8 + count * 3, 24);
      })
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.9)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1);

        // Highlight connected links
        link
          .attr("stroke", (l) => {
            const source = typeof l.source === "object" ? l.source.id : l.source;
            const target = typeof l.target === "object" ? l.target.id : l.target;
            return source === d.id || target === d.id
              ? "rgba(200, 200, 200, 0.8)"
              : "rgba(136, 136, 136, 0.1)";
          })
          .attr("stroke-width", (l) => {
            const source = typeof l.source === "object" ? l.source.id : l.source;
            const target = typeof l.target === "object" ? l.target.id : l.target;
            return source === d.id || target === d.id ? 1.5 : 0.5;
          });
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.9);

        // Reset links
        link
          .attr("stroke", "rgba(136, 136, 136, 0.3)")
          .attr("stroke-width", 1);
      })
      .on("click", (event, d) => {
        event.stopPropagation();

        // If in connect mode and we have a source, create the link
        if (connectMode && connectSourceId && connectSourceId !== d.id && userId) {
          completeConnection(d.id, userId);
          setSelectedNodePosition(null);
        } else if (event.shiftKey && selectedNodeId && selectedNodeId !== d.id && userId) {
          // Shift+click to connect selected node to this node
          addLink(selectedNodeId, d.id, userId);
        } else {
          selectNode(d.id);

          if (d.x !== undefined && d.y !== undefined) {
            // Calculate screen position for action buttons
            const currentTransform = d3.zoomTransform(svg.node()!);
            const screenX = d.x * currentTransform.k + currentTransform.x;
            const screenY = d.y * currentTransform.k + currentTransform.y;
            setSelectedNodePosition({ x: screenX, y: screenY });

            if (editMode) {
              // In edit mode, just keep node fixed, no centering animation
              d.fx = d.x;
              d.fy = d.y;
            } else {
              // In simulation mode, center the node
              simulation.stop();
              d.fx = d.x;
              d.fy = d.y;

              const nodeX = d.x;
              const nodeY = d.y;
              const scale = currentTransform.k;
              const centerTransform = d3.zoomIdentity
                .translate(width / 2 - nodeX * scale, height / 2 - nodeY * scale)
                .scale(scale);

              svg.transition()
                .duration(400)
                .call(zoom.transform, centerTransform)
                .on("end", () => {
                  d.fx = null;
                  d.fy = null;
                });
            }
          }
        }
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();

        // In edit mode, double-click to edit node title inline
        if (editMode && d.x !== undefined && d.y !== undefined) {
          const currentTransform = d3.zoomTransform(svg.node()!);
          const screenX = d.x * currentTransform.k + currentTransform.x;
          const screenY = d.y * currentTransform.k + currentTransform.y;

          // Get current title from store
          const nodeData = storeNodes.find((n) => n.id === d.id);
          const currentTitle = nodeData?.title || d.title;

          setEditingNodeId(d.id);
          setEditingNodeTitle(currentTitle);
          setEditingNodePosition({ x: screenX, y: screenY });

          setTimeout(() => {
            if (inlineInputRef.current) {
              inlineInputRef.current.focus();
              inlineInputRef.current.select();
            }
          }, 50);
        }
      });

    // Highlight selected node and search results
    node.select(".node-circle")
      .attr("stroke", (d) => {
        if (d.id === selectedNodeId) return "#fff";
        if (searchResults.length > 0 && searchResults.includes(d.id)) return "#fbbf24";
        return "none";
      })
      .attr("stroke-width", (d) => {
        if (d.id === selectedNodeId) return 2;
        if (searchResults.length > 0 && searchResults.includes(d.id)) return 3;
        return 0;
      })
      .attr("opacity", (d) => {
        // Dim non-matching nodes when searching
        if (searchResults.length > 0 && !searchResults.includes(d.id)) return 0.3;
        return 0.9;
      });

    // Dim non-matching labels
    node.select(".node-label")
      .attr("opacity", (d) => {
        if (searchResults.length > 0 && !searchResults.includes(d.id)) return 0.2;
        return 1;
      });

    // Dim glow for non-matching nodes
    node.select(".glow")
      .attr("opacity", (d) => {
        if (searchResults.length > 0 && !searchResults.includes(d.id)) return 0.05;
        return 0.15;
      });

    // Node labels
    node.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => {
        const count = connectionCount[d.id] || 1;
        return Math.min(8 + count * 3, 24) + 16;
      })
      .attr("fill", "rgba(156, 163, 175, 0.8)")
      .attr("font-size", "11px")
      .attr("font-family", "system-ui, sans-serif")
      .attr("pointer-events", "none")
      .text((d) => d.title);

    // Click on background to deselect
    svg.on("click", () => {
      selectNode(null);
      cancelConnectMode();
      setSelectedNodePosition(null);
    });

    // Double click to add new node with inline editing
    svg.on("dblclick", (event) => {
      if (!userId) return;
      const [x, y] = d3.pointer(event);
      const transform = d3.zoomTransform(svg.node()!);
      const realX = (x - transform.x) / transform.k;
      const realY = (y - transform.y) / transform.k;
      addNode(realX, realY, userId).then((newNodeId) => {
        if (newNodeId) {
          // Calculate screen position for inline editing
          const screenX = realX * transform.k + transform.x;
          const screenY = realY * transform.k + transform.y;
          setEditingNodeId(newNodeId);
          setEditingNodeTitle("Ý tưởng mới");
          setEditingNodePosition({ x: screenX, y: screenY });
          setTimeout(() => {
            if (inlineInputRef.current) {
              inlineInputRef.current.focus();
              inlineInputRef.current.select();
            }
          }, 50);
        }
      });
    });

    // Function to update visual positions
    const updatePositions = () => {
      link
        .attr("x1", (d) => (d.source as D3Node).x!)
        .attr("y1", (d) => (d.source as D3Node).y!)
        .attr("x2", (d) => (d.target as D3Node).x!)
        .attr("y2", (d) => (d.target as D3Node).y!);

      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    };

    // Update positions on each tick
    simulation.on("tick", updatePositions);

    // In edit mode, manually update positions once (simulation is stopped)
    if (editMode) {
      updatePositions();
    }

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!editMode && !event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      // In edit mode, manually update the visual position since simulation is stopped
      if (editMode) {
        event.subject.x = event.x;
        event.subject.y = event.y;
        // Update this node's position
        d3.select(event.sourceEvent.target.parentNode as SVGGElement)
          .attr("transform", `translate(${event.x}, ${event.y})`);
        // Update connected links
        link
          .filter((l) => {
            const sourceId = typeof l.source === "object" ? l.source.id : l.source;
            const targetId = typeof l.target === "object" ? l.target.id : l.target;
            return sourceId === event.subject.id || targetId === event.subject.id;
          })
          .attr("x1", (l) => (l.source as D3Node).x!)
          .attr("y1", (l) => (l.source as D3Node).y!)
          .attr("x2", (l) => (l.target as D3Node).x!)
          .attr("y2", (l) => (l.target as D3Node).y!);
      }
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!editMode) {
        if (!event.active) simulation.alphaTarget(0);
        // Release the node (let physics take over)
        event.subject.fx = null;
        event.subject.fy = null;
      }
      // In edit mode, keep node fixed at new position
      // Save position to database
      saveNodePosition(event.subject.id);
    }

    // Initial zoom to fit all nodes and center on largest node - only if no saved transform
    if (currentTransformRef.current === d3.zoomIdentity && nodes.length > 0) {
      // Find the largest node (most connections)
      let maxConnections = -1;
      let largestNode = nodes[0];
      nodes.forEach((n) => {
        const count = connectionCount[n.id] || 0;
        if (count > maxConnections) {
          maxConnections = count;
          largestNode = n;
        }
      });

      // Calculate bounds of all nodes
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        if (n.x !== undefined && n.y !== undefined) {
          minX = Math.min(minX, n.x);
          maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y);
          maxY = Math.max(maxY, n.y);
        }
      });

      // Add padding
      const padding = 100;
      minX -= padding;
      maxX += padding;
      minY -= padding;
      maxY += padding;

      // Calculate scale to fit all nodes
      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;
      const scaleX = width / graphWidth;
      const scaleY = height / graphHeight;
      const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x zoom

      // Center on largest node
      const centerX = largestNode.x ?? (minX + graphWidth / 2);
      const centerY = largestNode.y ?? (minY + graphHeight / 2);

      const initialTransform = d3.zoomIdentity
        .translate(width / 2 - centerX * scale, height / 2 - centerY * scale)
        .scale(scale);

      svg.call(zoom.transform, initialTransform);
      currentTransformRef.current = initialTransform;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [storeNodes, storeLinks, selectedNodeId, addNode, addLink, selectNode, connectMode, connectSourceId, searchResults, completeConnection, cancelConnectMode, userId, saveNodePosition, editMode]);

  // Reheat simulation
  const reheat = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.5).restart();
    }
  }, []);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  }, []);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  }, []);

  // Center on largest node (most connections)
  const centerLargestNode = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !zoomRef.current) return;
    if (storeNodes.length === 0) return;

    // Stop simulation first
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Calculate connection count for each node
    const connectionCount: Record<string, number> = {};
    storeNodes.forEach((n) => (connectionCount[n.id] = 0));
    storeLinks.forEach((l) => {
      connectionCount[l.source_id]++;
      connectionCount[l.target_id]++;
    });

    // Find node with most connections
    let maxConnections = -1;
    let largestNodeId = storeNodes[0].id;
    Object.entries(connectionCount).forEach(([id, count]) => {
      if (count > maxConnections) {
        maxConnections = count;
        largestNodeId = id;
      }
    });

    // Find node position from refs
    const node = nodesDataRef.current.find((n) => n.id === largestNodeId);
    if (!node || node.x === undefined || node.y === undefined) return;

    // Fix node in place
    node.fx = node.x;
    node.fy = node.y;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Center with a nice zoom level
    const scale = 1.2;
    const transform = d3.zoomIdentity
      .translate(width / 2 - node.x * scale, height / 2 - node.y * scale)
      .scale(scale);

    svg.transition()
      .duration(400)
      .call(zoomRef.current.transform, transform)
      .on("end", () => {
        // Release the node after centering
        if (node) {
          node.fx = null;
          node.fy = null;
        }
      });

    // Select the node
    selectNode(largestNodeId);
  }, [storeNodes, storeLinks, selectNode]);

  // Start connect mode (uses store)
  const handleStartConnectMode = useCallback(() => {
    if (selectedNodeId) {
      // Stop simulation to prevent nodes from moving
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      startConnectMode(selectedNodeId);
    }
  }, [selectedNodeId, startConnectMode]);

  // Toggle search
  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        clearSearch();
      }
      return !prev;
    });
  }, [clearSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Cmd/Ctrl + F for search
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        event.preventDefault();
        toggleSearch();
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ":
          event.preventDefault();
          reheat();
          break;
        case "delete":
        case "backspace":
          if (selectedNodeId) {
            deleteNode(selectedNodeId);
          }
          break;
        case "escape":
          if (isSearchOpen) {
            setIsSearchOpen(false);
            clearSearch();
          } else {
            selectNode(null);
            cancelConnectMode();
          }
          break;
        case "c":
          // Press C to enter connect mode
          if (selectedNodeId) {
            handleStartConnectMode();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reheat, selectedNodeId, deleteNode, selectNode, handleStartConnectMode, cancelConnectMode, isSearchOpen, clearSearch, toggleSearch]);

  // Start inline editing for a node
  const startInlineEditing = useCallback((nodeId: string, nodeX: number, nodeY: number) => {
    const transform = currentTransformRef.current;
    const screenX = nodeX * transform.k + transform.x;
    const screenY = nodeY * transform.k + transform.y;
    setEditingNodeId(nodeId);
    setEditingNodeTitle("Ý tưởng mới");
    setEditingNodePosition({ x: screenX, y: screenY });
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (inlineInputRef.current) {
        inlineInputRef.current.focus();
        inlineInputRef.current.select();
      }
    }, 50);
  }, []);

  // Save inline edit
  const saveInlineEdit = useCallback(() => {
    if (editingNodeId && editingNodeTitle.trim()) {
      updateNode(editingNodeId, { title: editingNodeTitle.trim() });
    }
    setEditingNodeId(null);
    setEditingNodeTitle("");
    setEditingNodePosition(null);
  }, [editingNodeId, editingNodeTitle, updateNode]);

  // Cancel inline edit
  const cancelInlineEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingNodeTitle("");
    setEditingNodePosition(null);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full relative bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-gray-400 text-sm">Đang tải Idea Graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#0a0a0f]">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Inline Node Title Editor */}
      {editingNodeId && editingNodePosition && (
        <div
          className="absolute z-50"
          style={{
            left: editingNodePosition.x,
            top: editingNodePosition.y + 30,
            transform: 'translateX(-50%)',
          }}
        >
          <input
            ref={inlineInputRef}
            type="text"
            value={editingNodeTitle}
            onChange={(e) => setEditingNodeTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveInlineEdit();
              } else if (e.key === 'Escape') {
                cancelInlineEdit();
              }
            }}
            onBlur={saveInlineEdit}
            className="px-3 py-1.5 bg-black/90 border border-cyan-500/50 rounded-lg text-white text-sm outline-none focus:border-cyan-400 min-w-[150px] text-center"
            placeholder="Nhập tiêu đề..."
          />
        </div>
      )}

      {/* Graph Selector and Search Bar */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        {/* Graph Selector */}
        {userId && <GraphSelector userId={userId} />}

        {/* Search */}
        {isSearchOpen ? (
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-sm placeholder-gray-500 outline-none w-48"
            />
            {searchQuery && (
              <span className="text-xs text-yellow-400">
                {searchResults.length} kết quả
              </span>
            )}
            <button
              onClick={() => {
                setIsSearchOpen(false);
                clearSearch();
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={toggleSearch}
            className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
            title="Tìm kiếm (Ctrl/Cmd + F)"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Tìm kiếm</span>
          </button>
        )}
      </div>

      {/* Connect mode indicator */}
      {connectMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm">
          Chế độ kết nối: Click vào node khác để tạo liên kết
        </div>
      )}

      {/* Node Action Buttons (appear near selected node in edit mode) */}
      {editMode && selectedNodeId && selectedNodePosition && (
        <div
          className="absolute z-50 flex items-center gap-1 p-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20 shadow-lg"
          style={{
            left: selectedNodePosition.x + 30,
            top: selectedNodePosition.y - 16,
            transform: 'translateY(-50%)',
          }}
        >
          {/* Connect button */}
          <button
            onClick={() => {
              handleStartConnectMode();
            }}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              connectMode
                ? "text-cyan-400 bg-cyan-500/20"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
            title="Kết nối với node khác"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          {/* Add connected node button */}
          <button
            onClick={() => {
              if (!userId) return;
              const selectedNode = nodesDataRef.current.find((n) => n.id === selectedNodeId);
              if (selectedNode && selectedNode.x !== undefined && selectedNode.y !== undefined) {
                // Create new node near selected node
                const angle = Math.random() * 2 * Math.PI;
                const distance = 80 + Math.random() * 40;
                const newX = selectedNode.x + Math.cos(angle) * distance;
                const newY = selectedNode.y + Math.sin(angle) * distance;
                // Add node and immediately connect it, then start inline editing
                addNode(newX, newY, userId).then((newNodeId) => {
                  if (newNodeId && selectedNodeId) {
                    addLink(selectedNodeId, newNodeId, userId);
                    // Start inline editing for the new node
                    startInlineEditing(newNodeId, newX, newY);
                  }
                });
              }
            }}
            className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Thêm node mới và kết nối"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-0.5 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
        {/* Edit mode toggle */}
        <button
          onClick={() => {
            setEditMode(!editMode);
            setSelectedNodePosition(null);
            if (!editMode) {
              // Entering edit mode - stop simulation
              if (simulationRef.current) {
                simulationRef.current.stop();
              }
            } else {
              // Exiting edit mode - reheat simulation
              if (simulationRef.current) {
                // Unfix all nodes
                nodesDataRef.current.forEach((n) => {
                  n.fx = null;
                  n.fy = null;
                });
                simulationRef.current.alpha(0.3).restart();
              }
            }
          }}
          className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
            editMode
              ? "text-cyan-400 bg-cyan-500/20"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title={editMode ? "Chế độ chỉnh sửa (bấm để bật simulation)" : "Chế độ simulation (bấm để chỉnh sửa)"}
        >
          {editMode ? <Pencil className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="h-px bg-white/10 mx-1" />

        <button
          onClick={() => {
            const container = containerRef.current;
            if (!container || !userId) return;

            // Calculate position for new node - convert screen center to graph coordinates
            const transform = currentTransformRef.current;
            let newX = (container.clientWidth / 2 - transform.x) / transform.k;
            let newY = (container.clientHeight / 2 - transform.y) / transform.k;

            // If there's a selected node, create near it
            if (selectedNodeId) {
              const selectedNode = nodesDataRef.current.find((n) => n.id === selectedNodeId);
              if (selectedNode && selectedNode.x !== undefined && selectedNode.y !== undefined) {
                // Random angle to spread nodes around the selected one
                const angle = Math.random() * 2 * Math.PI;
                const distance = 80 + Math.random() * 40; // 80-120 pixels away
                newX = selectedNode.x + Math.cos(angle) * distance;
                newY = selectedNode.y + Math.sin(angle) * distance;
              }
            } else if (storeNodes.length > 0) {
              // No selection, but has nodes - create near the last node
              const lastNode = nodesDataRef.current[nodesDataRef.current.length - 1];
              if (lastNode && lastNode.x !== undefined && lastNode.y !== undefined) {
                const angle = Math.random() * 2 * Math.PI;
                const distance = 80 + Math.random() * 40;
                newX = lastNode.x + Math.cos(angle) * distance;
                newY = lastNode.y + Math.sin(angle) * distance;
              }
            }

            // Add node and start inline editing
            addNode(newX, newY, userId).then((newNodeId) => {
              if (newNodeId) {
                startInlineEditing(newNodeId, newX, newY);
              }
            });
          }}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Thêm node (Double-click)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {selectedNodeId && (
          <>
            <div className="h-px bg-white/10 mx-1" />
            <button
              onClick={handleStartConnectMode}
              className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                connectMode
                  ? "text-cyan-400 bg-cyan-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Kết nối với node khác (C hoặc Shift+Click)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </>
        )}

        <div className="h-px bg-white/10 mx-1" />

        {/* Zoom controls */}
        <button
          onClick={handleZoomIn}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="h-px bg-white/10 mx-1" />

        {/* Center largest node */}
        <button
          onClick={centerLargestNode}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Định vị node lớn nhất"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={reheat}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Reheat simulation (Space)"
        >
          ↻
        </button>
        <button
          onClick={() => {
            if (svgRef.current && zoomRef.current) {
              const svg = d3.select(svgRef.current);
              const container = containerRef.current;
              if (container) {
                const transform = d3.zoomIdentity
                  .translate(container.clientWidth / 4, container.clientHeight / 4)
                  .scale(0.8);
                svg.transition().duration(500).call(
                  zoomRef.current.transform,
                  transform
                );
              }
            }
          }}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Fit view"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        {selectedNodeId && (
          <>
            <div className="h-px bg-white/10 mx-1" />
            <button
              onClick={() => deleteNode(selectedNodeId)}
              className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
              title="Xóa node (Delete)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Stats and mode indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-[11px] text-gray-500 flex items-center gap-3">
        <span className={`flex items-center gap-1.5 ${editMode ? 'text-cyan-400' : 'text-green-400'}`}>
          {editMode ? <Pencil className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {editMode ? 'Chỉnh sửa' : 'Mô phỏng'}
        </span>
        <span className="text-gray-600">|</span>
        <span>{storeNodes.length} nodes · {storeLinks.length} connections</span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-gray-600">
        {editMode
          ? "Drag: di chuyển · Click: chọn · Double-click: sửa tiêu đề · →: kết nối · +: thêm nối"
          : "Drag: di chuyển · Scroll: zoom · Double-click: thêm · Shift+Click: kết nối · Space: reheat"
        }
      </div>
    </div>
  );
}
