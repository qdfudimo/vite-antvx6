// #region 初始化图形
export const ports = {
  groups: {
    top: {
      position: "top",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    right: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    bottom: {
      position: "bottom",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    left: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
  },
  items: [
    {
      group: "top",
    },
    {
      group: "right",
    },
    {
      group: "bottom",
    },
    {
      group: "left",
    },
  ],
};
/**
 * Check if the graph will have (or already has) a cycle if there
 * had been an edge from source to target.
 *
 * @param graph The graph to check.
 * @param source The originating node.
 * @param target The node that is about to receive an incoming edge from source.
 * @returns true if the resulting graph will have node, or false otherwise.
 */
export function willHaveCycle(graph, source, target) {
  const preorder = new Set();
  function dfs(origin) {
    if (preorder.has(origin)) return true;
    preorder.add(origin);
    for (const incoming of graph.getIncomingEdges(origin) ?? []) {
      const parent = incoming.getSourceNode();
      if (!parent) continue;
      if (dfs(parent)) return true;
    }
    preorder.delete(origin);
    return false;
  }

  preorder.add(target);
  return dfs(source);
}
export const data1 = {
  nodes: [
    {
      id: "node1",
      shape: "rect",
      x: 40,
      y: 40,
      width: 100,
      height: 40,
      label: "hello",
      attrs: {
        body: {
          stroke: "#8f8f8f",
          strokeWidth: 1,
          fill: "#fff",
          rx: 6,
          ry: 6,
        },
      },
      ports: { ...ports },
    },
    {
      id: "node2",
      shape: "rect",
      x: 160,
      y: 180,
      width: 100,
      height: 40,
      label: "world",
      attrs: {
        body: {
          stroke: "#8f8f8f",
          strokeWidth: 1,
          fill: "#fff",
          rx: 6,
          ry: 6,
        },
      },
      ports: { ...ports },
    },
  ],
  edges: [
    {
      shape: "edge",
      source: "node1",
      target: "node2",
      label: "x6",
      attrs: {
        line: {
          stroke: "#8f8f8f",
          strokeWidth: 1,
        },
      },
    },
  ],
};
