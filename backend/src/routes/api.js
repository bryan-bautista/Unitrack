import express from 'express';
import {
  getStudents, getStudentByCarnet, createStudent, updateStudent, deleteStudent, invertStudents,
  getStudentHistory, addEnrollment, deleteEnrollment, sortHistory
} from '../controllers/studentController.js';
import {
  getCourses, getCourseByCode, createCourse, deleteCourse, getTreeStats, getTreeStructure
} from '../controllers/courseController.js';
import {
  getProfessors, getProfessorByCode, createProfessor, deleteProfessor, getHashStats, configureHashTable
} from '../controllers/professorController.js';
import {
  getPensum, addCourseVertex, removeCourseVertex, addPrerequisiteEdge, removePrerequisiteEdge,
  getTopologicalSort, detectCycles, getCoursePrerequisites, getShortestPath, runBFS, runDFS
} from '../controllers/pensumController.js';

const router = express.Router();

// --- Students & DLL History ---
router.get('/estudiantes', getStudents);
router.get('/estudiantes/:carnet', getStudentByCarnet);
router.post('/estudiantes', createStudent);
router.put('/estudiantes/:carnet', updateStudent);
router.delete('/estudiantes/:carnet', deleteStudent);
router.post('/estudiantes/invertir', invertStudents);

router.get('/estudiantes/:carnet/historial', getStudentHistory);
router.post('/estudiantes/:carnet/historial', addEnrollment);
router.delete('/estudiantes/:carnet/historial/:curso', deleteEnrollment);
router.post('/estudiantes/:carnet/historial/ordenar', sortHistory);

// --- Courses Catalog (BST/AVL) ---
router.get('/cursos', getCourses);
router.get('/cursos/inorden', getCourses); // Same under /inorden path
router.get('/cursos/stats', getTreeStats);
router.get('/cursos/tree', getTreeStructure);
router.get('/cursos/:codigo', getCourseByCode);
router.post('/cursos', createCourse);
router.delete('/cursos/:codigo', deleteCourse);

// --- Professors Directory (Hash Table) ---
router.get('/catedraticos', getProfessors);
router.get('/catedraticos/stats', getHashStats);
router.post('/catedraticos/config', configureHashTable);
router.get('/catedraticos/:codigo', getProfessorByCode);
router.post('/catedraticos', createProfessor);
router.delete('/catedraticos/:codigo', deleteProfessor);

// --- Pensum Map (Graph) ---
router.get('/pensum', getPensum);
router.post('/pensum/cursos', addCourseVertex);
router.delete('/pensum/cursos/:codigo', removeCourseVertex);
router.post('/pensum/prerrequisitos', addPrerequisiteEdge);
router.delete('/pensum/prerrequisitos/:from/:to', removePrerequisiteEdge);
router.get('/pensum/topological-sort', getTopologicalSort);
router.get('/pensum/detect-cycles', detectCycles);
router.get('/pensum/:curso/prerequisites', getCoursePrerequisites);
router.get('/pensum/shortest-path/:from/:to', getShortestPath);
router.get('/pensum/bfs/:code', runBFS);
router.get('/pensum/dfs/:code', runDFS);

export default router;
