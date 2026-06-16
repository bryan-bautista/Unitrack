import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'estudiantes',
    loadComponent: () => import('./pages/students/students.component').then(m => m.StudentsComponent)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent)
  },
  {
    path: 'catedraticos',
    loadComponent: () => import('./pages/professors/professors.component').then(m => m.ProfessorsComponent)
  },
  {
    path: 'pensum',
    loadComponent: () => import('./pages/pensum/pensum.component').then(m => m.PensumComponent)
  },
  {
    path: '',
    redirectTo: 'estudiantes',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'estudiantes'
  }
];
