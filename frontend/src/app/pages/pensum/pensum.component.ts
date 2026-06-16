import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface GraphNode {
  id: string;
  label: string;
  course: any;
  x: number;
  y: number;
  isPrereq?: boolean;
  isUnlocked?: boolean;
  isSelected?: boolean;
  isVisited?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  isHighlighted?: boolean;
}

@Component({
  selector: 'app-pensum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pensum.component.html',
  styleUrls: ['./pensum.component.css']
})
export class PensumComponent implements OnInit {
  nodes: GraphNode[] = [];
  edges: GraphEdge[] = [];
  
  // Draggable state
  draggingNode: GraphNode | null = null;
  dragOffset = { x: 0, y: 0 };

  // Forms
  courseForm = { codigo: '', nombre: '', creditos: 4 };
  relationForm = { fromCode: '', toCode: '' };

  // Algorithms
  selectedNode: GraphNode | null = null;
  topoSortList: any[] | null = null;
  cycleInfo = { hasCycle: false, message: '' };
  
  // BFS/DFS animation sequence
  animationSequence: string[] = [];
  animationIndex = -1;
  animationInterval: any = null;

  // Shortest path inputs
  pathInput = { from: '', to: '' };
  shortestPathList: any[] | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadGraph();
    this.checkCycles();
  }

  loadGraph() {
    this.api.getPensum().subscribe({
      next: (res) => {
        // Build graph coordinates
        this.edges = res.edges;
        this.buildNodeCoordinates(res.nodes);
        this.clearHighlights();
      }
    });
  }

  buildNodeCoordinates(apiNodes: any[]) {
    // Lay out nodes in a neat grid or circular structure initially
    const count = apiNodes.length;
    const centerX = 400;
    const centerY = 250;
    const radius = 180;

    this.nodes = apiNodes.map((node, i) => {
      // Circle position
      const angle = (i * 2 * Math.PI) / count;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Preserve positions if nodes already exist with drag modifications
      const existing = this.nodes.find(n => n.id === node.id);
      return {
        id: node.id,
        label: node.label,
        course: node.course,
        x: existing ? existing.x : x,
        y: existing ? existing.y : y
      };
    });
  }

  checkCycles() {
    this.api.detectCycles().subscribe({
      next: (res) => {
        this.cycleInfo = res;
      }
    });
  }

  // --- Add/Delete Elements ---
  addCourse() {
    this.api.addPensumCourse(this.courseForm).subscribe({
      next: () => {
        this.loadGraph();
        this.checkCycles();
        this.courseForm = { codigo: '', nombre: '', creditos: 4 };
      },
      error: (err) => alert(err.error?.message || 'Error registrando curso')
    });
  }

  deleteCourse(codigo: string) {
    if (confirm(`¿Seguro de eliminar ${codigo} del pensum?`)) {
      this.api.deletePensumCourse(codigo).subscribe({
        next: () => {
          this.loadGraph();
          this.checkCycles();
          if (this.selectedNode?.id === codigo) this.selectedNode = null;
        }
      });
    }
  }

  addRelation() {
    this.api.addPrerequisite(this.relationForm).subscribe({
      next: () => {
        this.loadGraph();
        this.checkCycles();
        this.relationForm = { fromCode: '', toCode: '' };
      },
      error: (err) => alert(err.error?.message || 'Error registrando prerrequisito')
    });
  }

  deleteRelation(from: string, to: string) {
    this.api.deletePrerequisite(from, to).subscribe({
      next: () => {
        this.loadGraph();
        this.checkCycles();
      }
    });
  }

  // --- Interactivity Highlights ---
  selectNode(node: GraphNode) {
    this.clearHighlights();
    this.selectedNode = node;
    node.isSelected = true;

    // Fetch details
    this.api.getCoursePrerequisites(node.id).subscribe({
      next: (res) => {
        // Highlight prerequisites
        const prereqCodes = [...res.direct.map((c: any) => c.codigo), ...res.indirect.map((c: any) => c.codigo)];
        this.nodes.forEach(n => {
          if (prereqCodes.includes(n.id)) {
            n.isPrereq = true;
          }
        });

        // Highlight unlocked courses (BFS forwards on outbound edges)
        this.api.runBFS(node.id).subscribe({
          next: (bfsRes) => {
            const unlockedCodes = bfsRes.sequence.filter((code: string) => code !== node.id);
            this.nodes.forEach(n => {
              if (unlockedCodes.includes(n.id)) {
                n.isUnlocked = true;
              }
            });
            this.highlightActiveEdges();
          }
        });
      }
    });
  }

  clearHighlights() {
    this.selectedNode = null;
    this.shortestPathList = null;
    this.nodes.forEach(n => {
      n.isSelected = false;
      n.isPrereq = false;
      n.isUnlocked = false;
      n.isVisited = false;
    });
    this.edges.forEach(e => e.isHighlighted = false);
    this.stopAnimation();
  }

  highlightActiveEdges() {
    this.edges.forEach(e => {
      // Highlight if edge connects selected node to unlocked node
      const fromNode = this.nodes.find(n => n.id === e.from);
      const toNode = this.nodes.find(n => n.id === e.to);
      
      if (fromNode?.isSelected && toNode?.isUnlocked) {
        e.isHighlighted = true;
      }
      // Highlight if edge connects prereq to selected node
      if (fromNode?.isPrereq && toNode?.isSelected) {
        e.isHighlighted = true;
      }
    });
  }

  // --- Graph Algorithms & Animations ---
  getTopologicalSort() {
    this.api.getTopologicalSort().subscribe({
      next: (res) => {
        this.topoSortList = res;
      },
      error: (err) => {
        alert(err.error?.message || 'Error ordenamiento topológico');
        this.topoSortList = null;
      }
    });
  }

  getShortestPath() {
    if (!this.pathInput.from || !this.pathInput.to) return;
    this.api.getShortestPath(this.pathInput.from, this.pathInput.to).subscribe({
      next: (res) => {
        this.shortestPathList = res;
        this.clearHighlights();
        
        // Highlight shortest path nodes & edges
        const codes = res.map((c: any) => c.codigo);
        this.nodes.forEach(n => {
          if (codes.includes(n.id)) n.isVisited = true;
        });

        for (let i = 0; i < codes.length - 1; i++) {
          const edge = this.edges.find(e => e.from === codes[i] && e.to === codes[i+1]);
          if (edge) edge.isHighlighted = true;
        }
      },
      error: (err) => {
        alert(err.error?.message || 'No existe camino de prerrequisitos.');
        this.shortestPathList = null;
      }
    });
  }

  // Animate BFS/DFS paso a paso
  animateAlg(type: 'bfs' | 'dfs', startCode: string) {
    if (!startCode) return;
    this.clearHighlights();
    
    const request = type === 'bfs' ? this.api.runBFS(startCode) : this.api.runDFS(startCode);
    request.subscribe({
      next: (res) => {
        this.animationSequence = res.sequence;
        this.animationIndex = 0;
        this.startAnimationTimer();
      }
    });
  }

  startAnimationTimer() {
    this.stopAnimation();
    this.animationInterval = setInterval(() => {
      if (this.animationIndex < this.animationSequence.length) {
        const nextCode = this.animationSequence[this.animationIndex];
        const node = this.nodes.find(n => n.id === nextCode);
        if (node) {
          node.isVisited = true;
        }
        this.animationIndex++;
      } else {
        this.stopAnimation();
      }
    }, 1000); // 1-second step sequence
  }

  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  // --- Drag & Drop SVG Nodos ---
  onNodeMouseDown(event: MouseEvent, node: GraphNode) {
    this.draggingNode = node;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    // Offset relative to node center
    this.dragOffset.x = event.clientX - node.x;
    this.dragOffset.y = event.clientY - node.y;
    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggingNode) {
      this.draggingNode.x = event.clientX - this.dragOffset.x;
      this.draggingNode.y = event.clientY - this.dragOffset.y;
      
      // Clamp values within SVG boundary
      if (this.draggingNode.x < 30) this.draggingNode.x = 30;
      if (this.draggingNode.x > 770) this.draggingNode.x = 770;
      if (this.draggingNode.y < 30) this.draggingNode.y = 30;
      if (this.draggingNode.y > 470) this.draggingNode.y = 470;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.draggingNode = null;
  }

  getNodeX(id: string): number {
    const node = this.nodes.find(n => n.id === id);
    return node ? node.x : 0;
  }

  getNodeY(id: string): number {
    const node = this.nodes.find(n => n.id === id);
    return node ? node.y : 0;
  }
}

