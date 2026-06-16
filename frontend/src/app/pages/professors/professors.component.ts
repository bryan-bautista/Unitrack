import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-professors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professors.component.html',
  styleUrls: ['./professors.component.css']
})
export class ProfessorsComponent implements OnInit {
  professors: any[] = [];
  hashStats: any = null;
  buckets: any[] = []; // Raw buckets layout from backend

  // HashTable Configuration
  hashConfig = {
    hashFunction: 'division',
    collisionMethod: 'chaining'
  };

  // Add Professor Form
  professorForm = {
    codigo: '',
    nombre: '',
    apellido: '',
    especialidad: '',
    correo: '',
    cursosAsignadosInput: '' // parsed as array
  };

  // Search Professor Form
  searchCode = '';
  foundProfessor: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadProfessors();
    this.loadStats();
  }

  loadProfessors() {
    this.api.getProfessors().subscribe({
      next: (res) => {
        this.professors = res;
      }
    });
  }

  loadStats() {
    this.api.getProfessorStats().subscribe({
      next: (res) => {
        this.hashStats = res.stats;
        this.buckets = res.buckets;
      }
    });
  }

  updateConfig() {
    this.api.configureHashTable(this.hashConfig).subscribe({
      next: (res) => {
        this.hashStats = res.stats;
        this.loadProfessors();
        this.loadStats();
        alert('Configuración actualizada. Elementos re-hasheados en la tabla.');
      },
      error: (err) => {
        alert(err.error?.message || 'Error actualizando configuración');
      }
    });
  }

  addProfessor() {
    // Parse courses input
    const parsedCursos = this.professorForm.cursosAsignadosInput
      ? this.professorForm.cursosAsignadosInput.split(',').map(s => s.trim())
      : [];

    const sendData = {
      codigo: this.professorForm.codigo,
      nombre: this.professorForm.nombre,
      apellido: this.professorForm.apellido,
      especialidad: this.professorForm.especialidad,
      correo: this.professorForm.correo,
      cursosAsignados: parsedCursos
    };

    this.api.createProfessor(sendData).subscribe({
      next: (res) => {
        this.loadProfessors();
        this.loadStats();
        // Reset form
        this.professorForm = {
          codigo: '',
          nombre: '',
          apellido: '',
          especialidad: '',
          correo: '',
          cursosAsignadosInput: ''
        };
      },
      error: (err) => {
        alert(err.error?.message || 'Error registrando catedrático');
      }
    });
  }

  deleteProfessor(codigo: string) {
    if (confirm(`¿Seguro de remover al catedrático ${codigo}?`)) {
      this.api.deleteProfessor(codigo).subscribe({
        next: () => {
          this.loadProfessors();
          this.loadStats();
        }
      });
    }
  }

  searchProfessor() {
    if (!this.searchCode) {
      this.foundProfessor = null;
      return;
    }
    this.api.getProfessorByCode(this.searchCode).subscribe({
      next: (res: any) => {
        this.foundProfessor = res;
      },
      error: () => {
        this.foundProfessor = null;
        alert('Catedrático no encontrado');
      }
    });
  }
}
