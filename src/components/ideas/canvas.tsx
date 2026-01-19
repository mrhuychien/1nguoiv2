"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import { Search, X } from "lucide-react";
import { useIdeaStore, mockNodes, mockLinks } from "@/store/idea-store";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    nodes: storeNodes,
    links: storeLinks,
    setNodes: setStoreNodes,
    setLinks: setStoreLinks,
    addNode,
    addLink,
    deleteNode,
    selectNode,
    selectedNodeId,
    searchQuery,
    searchResults,
    setSearchQuery,
    clearSearch,
  } = useIdeaStore();

  // Load mock data on mount
  useEffect(() => {
    if (storeNodes.length === 0) {
      setStoreNodes(mockNodes);
      setStoreLinks(mockLinks);
    }
  }, [storeNodes.length, setStoreNodes, setStoreLinks]);

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

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Prepare data
    const nodes: D3Node[] = storeNodes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      color: n.color,
      x: n.position_x,
      y: n.position_y,
    }));

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
        if (connectMode && connectSourceId && connectSourceId !== d.id) {
          addLink(connectSourceId, d.id);
          setConnectSourceId(null);
          setConnectMode(false);
        } else if (event.shiftKey && selectedNodeId && selectedNodeId !== d.id) {
          // Shift+click to connect selected node to this node
          addLink(selectedNodeId, d.id);
        } else {
          selectNode(d.id);
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
      setConnectMode(false);
      setConnectSourceId(null);
    });

    // Double click to add new node
    svg.on("dblclick", (event) => {
      const [x, y] = d3.pointer(event);
      const transform = d3.zoomTransform(svg.node()!);
      const realX = (x - transform.x) / transform.k;
      const realY = (y - transform.y) / transform.k;
      addNode(realX, realY);
    });

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as D3Node).x!)
        .attr("y1", (d) => (d.source as D3Node).y!)
        .attr("x2", (d) => (d.target as D3Node).x!)
        .attr("y2", (d) => (d.target as D3Node).y!);

      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      // Release the node (let physics take over)
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Initial zoom to fit
    const initialTransform = d3.zoomIdentity
      .translate(width / 4, height / 4)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [storeNodes, storeLinks, selectedNodeId, addNode, addLink, selectNode, connectMode, connectSourceId, searchResults]);

  // Reheat simulation
  const reheat = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.5).restart();
    }
  }, []);

  // Start connect mode
  const startConnectMode = useCallback(() => {
    if (selectedNodeId) {
      setConnectMode(true);
      setConnectSourceId(selectedNodeId);
    }
  }, [selectedNodeId]);

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
            setConnectMode(false);
            setConnectSourceId(null);
          }
          break;
        case "c":
          // Press C to enter connect mode
          if (selectedNodeId) {
            startConnectMode();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reheat, selectedNodeId, deleteNode, selectNode, startConnectMode, isSearchOpen, clearSearch, toggleSearch]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#0a0a0f]">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
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

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-0.5 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
        <button
          onClick={() => {
            const container = containerRef.current;
            if (container) {
              addNode(container.clientWidth / 2, container.clientHeight / 2);
            }
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
              onClick={startConnectMode}
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
        <button
          onClick={reheat}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Reheat simulation (Space)"
        >
          ↻
        </button>
        <button
          onClick={() => {
            if (svgRef.current) {
              const svg = d3.select(svgRef.current);
              const container = containerRef.current;
              if (container) {
                const transform = d3.zoomIdentity
                  .translate(container.clientWidth / 4, container.clientHeight / 4)
                  .scale(0.8);
                svg.transition().duration(500).call(
                  d3.zoom<SVGSVGElement, unknown>().transform,
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

      {/* Stats */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-[11px] text-gray-500 flex items-center gap-3">
        <span>{storeNodes.length} nodes · {storeLinks.length} connections</span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-gray-600">
        Drag: di chuyển · Scroll: zoom · Double-click: thêm · Shift+Click: kết nối · Space: reheat
      </div>
    </div>
  );
}
