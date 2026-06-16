export class DirectedGraph {
  constructor() {
    this.vertices = {}; // Map: code -> Course data
    this.adjList = {};  // Map: code -> Set of codes (or array for simple list) representing edges (A -> B means A is prerequisite of B)
  }

  addVertex(course) {
    const code = course.codigo;
    if (!this.vertices[code]) {
      this.vertices[code] = course;
      this.adjList[code] = [];
    }
  }

  removeVertex(code) {
    if (this.vertices[code]) {
      delete this.vertices[code];
      delete this.adjList[code];

      // Remove any incoming edges to this vertex
      for (const key in this.adjList) {
        this.adjList[key] = this.adjList[key].filter(neighbor => neighbor !== code);
      }
      return true;
    }
    return false;
  }

  addEdge(fromCode, toCode) {
    if (this.vertices[fromCode] && this.vertices[toCode]) {
      if (!this.adjList[fromCode].includes(toCode)) {
        this.adjList[fromCode].push(toCode);
      }
      return true;
    }
    return false;
  }

  removeEdge(fromCode, toCode) {
    if (this.adjList[fromCode]) {
      this.adjList[fromCode] = this.adjList[fromCode].filter(code => code !== toCode);
      return true;
    }
    return false;
  }

  // BFS: Find all courses unlocked by this course (directly or indirectly)
  bfs(startCode) {
    if (!this.vertices[startCode]) return [];
    const visited = {};
    const queue = [startCode];
    const order = [];
    visited[startCode] = true;

    while (queue.length > 0) {
      const current = queue.shift();
      order.push(current);

      const neighbors = this.adjList[current] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      }
    }
    return order; // List of unlocked course codes
  }

  // DFS: Explore all prerequisite paths from a course
  dfs(startCode) {
    if (!this.vertices[startCode]) return [];
    const visited = {};
    const order = [];

    const explore = (node) => {
      visited[node] = true;
      order.push(node);
      const neighbors = this.adjList[node] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          explore(neighbor);
        }
      }
    };

    explore(startCode);
    return order;
  }

  // Cycle Detection: Check if there's any circular prerequisite dependency
  hasCycle() {
    const visited = {};
    const recStack = {};

    const isCyclicUtil = (v) => {
      if (!visited[v]) {
        visited[v] = true;
        recStack[v] = true;

        const neighbors = this.adjList[v] || [];
        for (const neighbor of neighbors) {
          if (!visited[neighbor] && isCyclicUtil(neighbor)) {
            return true;
          } else if (recStack[neighbor]) {
            return true;
          }
        }
      }
      recStack[v] = false;
      return false;
    };

    for (const vertex in this.vertices) {
      if (isCyclicUtil(vertex)) {
        return true;
      }
    }
    return false;
  }

  // Topological Sort: Recommended order of courses
  topologicalSort() {
    // If there is a cycle, topological sort is not possible or undefined
    if (this.hasCycle()) {
      return null;
    }

    const visited = {};
    const stack = [];

    const topologicalSortUtil = (v) => {
      visited[v] = true;
      const neighbors = this.adjList[v] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          topologicalSortUtil(neighbor);
        }
      }
      stack.push(v);
    };

    for (const vertex in this.vertices) {
      if (!visited[vertex]) {
        topologicalSortUtil(vertex);
      }
    }

    // Topological sort is the reverse of the stack
    return stack.reverse();
  }

  // Shortest Path (BFS path length) between startCode and endCode
  shortestPath(startCode, endCode) {
    if (!this.vertices[startCode] || !this.vertices[endCode]) return null;
    if (startCode === endCode) return [startCode];

    const visited = {};
    const parent = {};
    const queue = [startCode];
    visited[startCode] = true;

    let found = false;
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === endCode) {
        found = true;
        break;
      }

      const neighbors = this.adjList[current] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          parent[neighbor] = current;
          queue.push(neighbor);
        }
      }
    }

    if (!found) return null;

    const path = [];
    let curr = endCode;
    while (curr !== startCode) {
      path.push(curr);
      curr = parent[curr];
    }
    path.push(startCode);
    return path.reverse();
  }

  // Get direct and indirect prerequisites for a course
  // Note: Since edge A -> B represents A is prerequisite of B,
  // B's incoming edges represent its direct prerequisites.
  getPrerequisites(courseCode) {
    if (!this.vertices[courseCode]) return null;

    const direct = [];
    // Search who has courseCode in their adjList
    for (const fromKey in this.adjList) {
      if (this.adjList[fromKey].includes(courseCode)) {
        direct.push(fromKey);
      }
    }

    // Indirect: BFS backwards on incoming edges
    const indirect = [];
    const visited = {};
    const queue = [...direct];
    for (const d of direct) {
      visited[d] = true;
    }

    while (queue.length > 0) {
      const current = queue.shift();
      if (!direct.includes(current)) {
        indirect.push(current);
      }

      // Find nodes that have an edge pointing to current
      for (const fromKey in this.adjList) {
        if (this.adjList[fromKey].includes(current)) {
          if (!visited[fromKey]) {
            visited[fromKey] = true;
            queue.push(fromKey);
          }
        }
      }
    }

    return {
      direct,
      indirect
    };
  }

  // Serialize graph structure for frontend Vis/SVG
  getGraphData() {
    const nodes = [];
    const edges = [];

    for (const code in this.vertices) {
      nodes.push({
        id: code,
        label: `${this.vertices[code].nombre} (${code})`,
        course: this.vertices[code]
      });

      const neighbors = this.adjList[code] || [];
      for (const neighbor of neighbors) {
        edges.push({
          from: code,
          to: neighbor
        });
      }
    }

    return { nodes, edges };
  }
}
