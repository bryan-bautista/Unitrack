import { studentsList, enrollmentsMap, saveAllData } from '../services/dataStore.js';
import { DoublyLinkedList } from '../structures/DoublyLinkedList.js';

export const getStudents = (req, res) => {
  res.json({
    size: studentsList.getSize(),
    students: studentsList.toArray()
  });
};

export const getStudentByCarnet = (req, res) => {
  const { carnet } = req.params;
  const student = studentsList.searchByCarnet(carnet);
  if (!student) {
    return res.status(404).json({ message: "Estudiante no encontrado" });
  }
  res.json(student);
};

export const createStudent = (req, res) => {
  const { carnet, nombre, apellido, correo, fechaNacimiento, carrera, semestreActual, position, index } = req.body;

  if (!carnet || !nombre || !apellido) {
    return res.status(400).json({ message: "Datos faltantes requeridos (carnet, nombre, apellido)" });
  }

  // Check if exists
  if (studentsList.searchByCarnet(carnet)) {
    return res.status(400).json({ message: "El estudiante ya existe con este carnet" });
  }

  const student = { carnet, nombre, apellido, correo, fechaNacimiento, carrera, semestreActual: Number(semestreActual) || 1 };

  try {
    if (position === 'start') {
      studentsList.insertAtStart(student);
    } else if (position === 'index') {
      const idx = Number(index);
      studentsList.insertAt(student, isNaN(idx) ? 0 : idx);
    } else {
      studentsList.insertAtEnd(student);
    }

    // Initialize double linked list for history
    enrollmentsMap[carnet] = new DoublyLinkedList();

    saveAllData();
    res.status(201).json({ message: "Estudiante creado exitosamente", student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStudent = (req, res) => {
  const { carnet } = req.params;
  const { nombre, apellido, correo, fechaNacimiento, carrera, semestreActual } = req.body;

  const student = studentsList.searchByCarnet(carnet);
  if (!student) {
    return res.status(404).json({ message: "Estudiante no encontrado" });
  }

  if (nombre) student.nombre = nombre;
  if (apellido) student.apellido = apellido;
  if (correo) student.correo = correo;
  if (fechaNacimiento) student.fechaNacimiento = fechaNacimiento;
  if (carrera) student.carrera = carrera;
  if (semestreActual) student.semestreActual = Number(semestreActual);

  saveAllData();
  res.json({ message: "Estudiante actualizado", student });
};

export const deleteStudent = (req, res) => {
  const { carnet } = req.params;
  const deleted = studentsList.deleteByCarnet(carnet);
  if (!deleted) {
    return res.status(404).json({ message: "Estudiante no encontrado" });
  }
  // Remove history as well
  delete enrollmentsMap[carnet];
  saveAllData();
  res.json({ message: "Estudiante eliminado exitosamente" });
};

export const invertStudents = (req, res) => {
  studentsList.reverse();
  saveAllData();
  res.json({ message: "Lista invertida exitosamente", students: studentsList.toArray() });
};

// --- Enrollments (Doubly Linked List) ---

export const getStudentHistory = (req, res) => {
  const { carnet } = req.params;
  const { order } = req.query; // 'reverse' or 'chrono'
  const history = enrollmentsMap[carnet];
  if (!history) {
    return res.status(404).json({ message: "Historial de estudiante no encontrado o no inicializado" });
  }

  if (order === 'reverse') {
    res.json(history.toArrayReverse());
  } else {
    res.json(history.toArray());
  }
};

export const addEnrollment = (req, res) => {
  const { carnet } = req.params;
  const { curso, semestre, nota, position } = req.body;

  if (!curso || !semestre) {
    return res.status(400).json({ message: "Curso y semestre son requeridos" });
  }

  let history = enrollmentsMap[carnet];
  if (!history) {
    history = new DoublyLinkedList();
    enrollmentsMap[carnet] = history;
  }

  const enrollment = { curso, semestre: Number(semestre), nota: Number(nota) || 0 };

  if (position === 'start') {
    history.insertAtStart(enrollment);
  } else {
    history.insertAtEnd(enrollment);
  }

  saveAllData();
  res.status(201).json({ message: "Inscripción registrada", enrollment });
};

export const deleteEnrollment = (req, res) => {
  const { carnet, curso } = req.params;
  const history = enrollmentsMap[carnet];
  if (!history) {
    return res.status(404).json({ message: "Historial no encontrado" });
  }

  const deleted = history.deleteByCurso(curso);
  if (!deleted) {
    return res.status(404).json({ message: "Curso no encontrado en el historial" });
  }

  saveAllData();
  res.json({ message: "Inscripción eliminada de historial" });
};

export const sortHistory = (req, res) => {
  const { carnet } = req.params;
  const { field, ascending } = req.body; // field = 'semestre' or 'nota', ascending = true/false

  const history = enrollmentsMap[carnet];
  if (!history) {
    return res.status(404).json({ message: "Historial no encontrado" });
  }

  const asc = ascending !== false;
  history.sortBy(field || 'semestre', asc);

  saveAllData();
  res.json({ message: `Historial ordenado por ${field} exitosamente`, history: history.toArray() });
};
