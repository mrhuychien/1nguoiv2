"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from "d3-force";

export interface ForceNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
}

export interface ForceLink extends SimulationLinkDatum<ForceNode> {
  id: string;
  source: string | ForceNode;
  target: string | ForceNode;
}

interface UseForceLayoutOptions {
  nodes: ForceNode[];
  links: ForceLink[];
  width: number;
  height: number;
  onTick: (nodes: ForceNode[]) => void;
  strength?: {
    charge?: number;
    link?: number;
    center?: number;
    collision?: number;
  };
}

export function useForceLayout({
  nodes,
  links,
  width,
  height,
  onTick,
  strength = {},
}: UseForceLayoutOptions) {
  const simulationRef = useRef<ReturnType<typeof forceSimulation<ForceNode>> | null>(null);
  const nodesRef = useRef<ForceNode[]>([]);

  const {
    charge = -300,
    link: linkStrength = 0.1,
    center: centerStrength = 0.05,
    collision = 50,
  } = strength;

  // Initialize or update simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    // Create copies of nodes with current positions
    nodesRef.current = nodes.map((node) => ({
      ...node,
      x: node.x ?? width / 2,
      y: node.y ?? height / 2,
    }));

    // Create links with node references
    const simulationLinks: ForceLink[] = links.map((link) => ({
      ...link,
      source: link.source,
      target: link.target,
    }));

    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create new simulation
    const simulation = forceSimulation<ForceNode>(nodesRef.current)
      .force(
        "link",
        forceLink<ForceNode, ForceLink>(simulationLinks)
          .id((d) => d.id)
          .strength(linkStrength)
          .distance(150)
      )
      .force("charge", forceManyBody<ForceNode>().strength(charge))
      .force("center", forceCenter<ForceNode>(width / 2, height / 2).strength(centerStrength))
      .force("collision", forceCollide<ForceNode>().radius(collision))
      .alphaDecay(0.02)
      .velocityDecay(0.3)
      .on("tick", () => {
        onTick([...nodesRef.current]);
      });

    simulationRef.current = simulation;

    // Warm start - run a few iterations immediately
    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, links.length, width, height, charge, linkStrength, centerStrength, collision, onTick]);

  // Drag handlers for interacting with simulation
  const onDragStart = useCallback((nodeId: string) => {
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (node) {
        node.fx = node.x;
        node.fy = node.y;
      }
    }
  }, []);

  const onDrag = useCallback((nodeId: string, x: number, y: number) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (node) {
      node.fx = x;
      node.fy = y;
    }
  }, []);

  const onDragEnd = useCallback((nodeId: string) => {
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0);
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (node) {
        // Keep position fixed after drag (Obsidian behavior)
        // Or release: node.fx = null; node.fy = null;
        node.fx = null;
        node.fy = null;
      }
    }
  }, []);

  // Reheat simulation (e.g., when new nodes are added)
  const reheat = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.5).restart();
    }
  }, []);

  return {
    onDragStart,
    onDrag,
    onDragEnd,
    reheat,
  };
}
