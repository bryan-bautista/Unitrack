import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
  selectedStudent: any = null;
  history: any[] = [];
  searchCarnet = '';
  searchHistoryCode = '';

  // Form Student
  studentForm = {
    carnet: '',
    nombre: '',
    apellido: '',
    correo: '',
    fechaNacimiento: '',
    carrera: '',
    semestreActual: 1,
    position: 'end',
    index: 0
  };

  // Form Enrollment
  enrollmentForm = {
    curso: '',
    semestre: 1,
    nota: 70,
    position: 'end'
  };

  // DLL navigation
  currentHistoryIndex = -1;
  historyOrder = 'chrono'; // 'chrono' | 'reverse'
  
  errorMsg = '';
  successMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.api.getStudents().subscribe({
      next: (res) => {
        this.students = res.students;
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error cargando estudiantes';
      }
    });
  }

  selectStudent(student: any) {
    this.selectedStudent = student;
    this.loadHistory();
    this.currentHistoryIndex = -1;
  }

  loadHistory() {
    if (!this.selectedStudent) return;
    this.api.getStudentHistory(this.selectedStudent.carnet, this.historyOrder).subscribe({
      next: (res) => {
        this.history = res;
        if (this.history.length > 0 && this.currentHistoryIndex === -1) {
          this.currentHistoryIndex = 0;
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error cargando historial';
      }
    });
  }

  toggleHistoryOrder() {
    this.historyOrder = this.historyOrder === 'chrono' ? 'reverse' : 'chrono';
    this.loadHistory();
  }

  searchStudent() {
    if (!this.searchCarnet) {
      this.loadStudents();
      return;
    }
    this.api.getStudent(this.searchCarnet).subscribe({
      next: (res) => {
        this.students = [res];
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Estudiante no encontrado';
        this.students = [];
      }
    });
  }

  addStudent() {
    this.api.createStudent(this.studentForm).subscribe({
      next: (res) => {
        this.successMsg = res.message;
        this.loadStudents();
        // Reset form
        this.studentForm = {
          carnet: '',
          nombre: '',
          apellido: '',
          correo: '',
          fechaNacimiento: '',
          carrera: '',
          semestreActual: 1,
          position: 'end',
          index: 0
        };
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error creando estudiante';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  deleteStudent(carnet: string) {
    if (confirm('¿Está seguro de eliminar a este estudiante?')) {
      this.api.deleteStudent(carnet).subscribe({
        next: (res) => {
          if (this.selectedStudent?.carnet === carnet) {
            this.selectedStudent = null;
            this.history = [];
          }
          this.loadStudents();
        }
      });
    }
  }

  invertList() {
    this.api.invertStudents().subscribe({
      next: (res) => {
        this.students = res.students;
      }
    });
  }

  // --- Enrollment history DLL ---
  addEnrollment() {
    if (!this.selectedStudent) return;
    this.api.addEnrollment(this.selectedStudent.carnet, this.enrollmentForm).subscribe({
      next: (res) => {
        this.loadHistory();
        this.enrollmentForm = { curso: '', semestre: 1, nota: 70, position: 'end' };
      },
      error: (err) => {
        alert(err.error?.message || 'Error registrando inscripción');
      }
    });
  }

  deleteEnrollment(curso: string) {
    if (!this.selectedStudent) return;
    this.api.deleteEnrollment(this.selectedStudent.carnet, curso).subscribe({
      next: () => {
        this.loadHistory();
        this.currentHistoryIndex = -1;
      }
    });
  }

  sortHistory(field: string, ascending: boolean) {
    if (!this.selectedStudent) return;
    this.api.sortHistory(this.selectedStudent.carnet, { field, ascending }).subscribe({
      next: (res) => {
        this.history = res.history;
        this.currentHistoryIndex = 0;
      }
    });
  }

  // DLL navigation methods
  nextEnrollment() {
    if (this.currentHistoryIndex < this.history.length - 1) {
      this.currentHistoryIndex++;
    }
  }

  prevEnrollment() {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
    }
  }
}
