import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface VisualNode {
  key: string;
  nombre: string;
  balanceFactor?: number;
  x: number;
  y: number;
}

interface VisualLink {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  selectedTraversal = 'inorder';
  treeMode: 'bst' | 'avl' = 'avl';
  treeRoot: any = null;
  treeHeight = 0;
  treeMin: any = null;
  treeMax: any = null;

  // Visual graph lists
  svgNodes: VisualNode[] = [];
  svgLinks: VisualLink[] = [];
  svgWidth = 800;
  svgHeight = 500;

  // Search/Create course form
  searchCode = '';
  foundCourse: any = null;

  courseForm = {
    codigo: '',
    nombre: '',
    creditos: 5,
    catedraticoAsignado: '',
    horario: '',
    cupoMaximo: 35
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCourses();
    this.loadTree();
  }

  loadCourses() {
    this.api.getCourses(this.selectedTraversal).subscribe({
      next: (res) => {
        this.courses = res;
      }
    });
  }

  loadTree() {
    this.api.getTreeStructure(this.treeMode).subscribe({
      next: (res) => {
        this.treeRoot = res.root;
        this.generateTreeCoordinates();
      }
    });

    this.api.getTreeStats(this.treeMode).subscribe({
      next: (res) => {
        this.treeHeight = res.height;
        this.treeMin = res.min;
        this.treeMax = res.max;
      }
    });
  }

  toggleTreeMode() {
    this.treeMode = this.treeMode === 'avl' ? 'bst' : 'avl';
    this.loadTree();
  }

  onTraversalChange() {
    this.loadCourses();
  }

  addCourse() {
    this.api.createCourse(this.courseForm).subscribe({
      next: (res) => {
        this.loadCourses();
        this.loadTree();
        this.courseForm = {
          codigo: '',
          nombre: '',
          creditos: 5,
          catedraticoAsignado: '',
          horario: '',
          cupoMaximo: 35
        };
      },
      error: (err) => {
        alert(err.error?.message || 'Error registrando curso');
      }
    });
  }

  deleteCourse(codigo: string) {
    if (confirm(`¿Seguro de eliminar el curso ${codigo}?`)) {
      this.api.deleteCourse(codigo).subscribe({
        next: () => {
          this.loadCourses();
          this.loadTree();
        }
      });
    }
  }

  searchCourse() {
    if (!this.searchCode) {
      this.foundCourse = null;
      return;
    }
    this.api.getCourseByCode(this.searchCode).subscribe({
      next: (res: any) => {
        this.foundCourse = res;
      },
      error: () => {
        this.foundCourse = null;
        alert('Curso no encontrado');
      }
    });
  }

  // Visual layout coordinator for tree
  generateTreeCoordinates() {
    this.svgNodes = [];
    this.svgLinks = [];
    if (!this.treeRoot) return;

    // Center root coordinates
    const startX = this.svgWidth / 2;
    const startY = 50;
    const initialDx = 180; // horizontal separation spacing

    this.traverseAndLayout(this.treeRoot, startX, startY, initialDx);
  }

  traverseAndLayout(node: any, x: number, y: number, dx: number) {
    if (!node) return;

    this.svgNodes.push({
      key: node.key,
      nombre: node.nombre,
      balanceFactor: node.balanceFactor,
      x,
      y
    });

    if (node.left) {
      const childX = x - dx;
      const childY = y + 80;
      this.svgLinks.push({ x1: x, y1: y, x2: childX, y2: childY });
      this.traverseAndLayout(node.left, childX, childY, dx * 0.55);
    }

    if (node.right) {
      const childX = x + dx;
      const childY = y + 80;
      this.svgLinks.push({ x1: x, y1: y, x2: childX, y2: childY });
      this.traverseAndLayout(node.right, childX, childY, dx * 0.55);
    }
  }
}
