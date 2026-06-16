import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // --- Students ---
  getStudents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estudiantes`);
  }

  getStudent(carnet: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/estudiantes/${carnet}`);
  }

  createStudent(studentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/estudiantes`, studentData);
  }

  updateStudent(carnet: string, studentData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/estudiantes/${carnet}`, studentData);
  }

  deleteStudent(carnet: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/estudiantes/${carnet}`);
  }

  invertStudents(): Observable<any> {
    return this.http.post(`${this.baseUrl}/estudiantes/invertir`, {});
  }

  // --- Student History (DLL) ---
  getStudentHistory(carnet: string, order = 'chrono'): Observable<any> {
    return this.http.get(`${this.baseUrl}/estudiantes/${carnet}/historial?order=${order}`);
  }

  addEnrollment(carnet: string, enrollment: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/estudiantes/${carnet}/historial`, enrollment);
  }

  deleteEnrollment(carnet: string, curso: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/estudiantes/${carnet}/historial/${curso}`);
  }

  sortHistory(carnet: string, sortConfig: { field: string, ascending: boolean }): Observable<any> {
    return this.http.post(`${this.baseUrl}/estudiantes/${carnet}/historial/ordenar`, sortConfig);
  }

  // --- Courses (BST/AVL) ---
  getCourses(traversal = 'inorder'): Observable<any> {
    return this.http.get(`${this.baseUrl}/cursos?traversal=${traversal}`);
  }

  getTreeStructure(mode: 'bst' | 'avl'): Observable<any> {
    return this.http.get(`${this.baseUrl}/cursos/tree?mode=${mode}`);
  }

  getTreeStats(mode: 'bst' | 'avl'): Observable<any> {
    return this.http.get(`${this.baseUrl}/cursos/stats?mode=${mode}`);
  }

  createCourse(course: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cursos`, course);
  }

  deleteCourse(codigo: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cursos/${codigo}`);
  }

  getCourseByCode(codigo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/cursos/${codigo}`);
  }


  // --- Professors (Hash Table) ---
  getProfessors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catedraticos`);
  }

  getProfessorStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/catedraticos/stats`);
  }

  configureHashTable(config: { hashFunction: string, collisionMethod: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/catedraticos/config`, config);
  }

  createProfessor(prof: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/catedraticos`, prof);
  }

  deleteProfessor(codigo: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/catedraticos/${codigo}`);
  }

  getProfessorByCode(codigo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/catedraticos/${codigo}`);
  }


  // --- Pensum (Graph) ---
  getPensum(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum`);
  }

  addPensumCourse(course: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/pensum/cursos`, course);
  }

  deletePensumCourse(codigo: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/pensum/cursos/${codigo}`);
  }

  addPrerequisite(edge: { fromCode: string, toCode: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/pensum/prerrequisitos`, edge);
  }

  deletePrerequisite(from: string, to: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/pensum/prerrequisitos/${from}/${to}`);
  }

  getTopologicalSort(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum/topological-sort`);
  }

  detectCycles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum/detect-cycles`);
  }

  getCoursePrerequisites(curso: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum/${curso}/prerequisites`);
  }

  getShortestPath(from: string, to: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum/shortest-path/${from}/${to}`);
  }

  runBFS(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum/bfs/${code}`);
  }

  runDFS(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pensum/dfs/${code}`);
  }
}
