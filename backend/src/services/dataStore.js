import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { SimpleLinkedList } from '../structures/SimpleLinkedList.js';
import { DoublyLinkedList } from '../structures/DoublyLinkedList.js';
import { AVLTree } from '../structures/AVLTree.js';
import { BST } from '../structures/BST.js';
import { CustomHashTable } from '../structures/CustomHashTable.js';
import { DirectedGraph } from '../structures/DirectedGraph.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  estudiantes: path.join(DATA_DIR, 'estudiantes.json'),
  inscripciones: path.join(DATA_DIR, 'inscripciones.json'),
  cursos: path.join(DATA_DIR, 'cursos.json'),
  catedraticos: path.join(DATA_DIR, 'catedraticos.json'),
  pensum: path.join(DATA_DIR, 'pensum.json')
};

// Global active data structures
export const studentsList = new SimpleLinkedList();
export const enrollmentsMap = {}; // carnet -> DoublyLinkedList
export const coursesAVL = new AVLTree();
export const coursesBST = new BST();
export const professorsHash = new CustomHashTable(17);
export const pensumGraph = new DirectedGraph();

// Read JSON helper
function readJSON(file, defaultVal = []) {
  if (!fs.existsSync(file)) return defaultVal;
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return defaultVal;
  }
}

// Write JSON helper
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Load data into active structures
export function loadAllData() {
  // 1. Load Catedráticos
  const catedraticos = readJSON(FILES.catedraticos, []);
  for (const cat of catedraticos) {
    professorsHash.insert(cat.codigo, cat);
  }

  // 2. Load Cursos
  const cursos = readJSON(FILES.cursos, []);
  for (const cur of cursos) {
    coursesAVL.insert(cur);
    coursesBST.insert(cur);
  }

  // 3. Load Estudiantes
  const estudiantes = readJSON(FILES.estudiantes, []);
  for (const est of estudiantes) {
    studentsList.insertAtEnd(est);
  }

  // 4. Load Inscripciones
  const inscripciones = readJSON(FILES.inscripciones, {});
  for (const carnet in inscripciones) {
    const dll = new DoublyLinkedList();
    for (const ins of inscripciones[carnet]) {
      dll.insertAtEnd(ins);
    }
    enrollmentsMap[carnet] = dll;
  }

  // 5. Load Pensum Graph
  const pensum = readJSON(FILES.pensum, { vertices: [], edges: [] });
  for (const v of pensum.vertices || []) {
    pensumGraph.addVertex(v);
  }
  for (const edge of pensum.edges || []) {
    pensumGraph.addEdge(edge.from, edge.to);
  }
}

// Save active structures to files
export function saveAllData() {
  // 1. Catedráticos
  writeJSON(FILES.catedraticos, professorsHash.toArray());

  // 2. Cursos (Get InOrder list which has all courses)
  writeJSON(FILES.cursos, coursesAVL.inOrder());

  // 3. Estudiantes
  writeJSON(FILES.estudiantes, studentsList.toArray());

  // 4. Inscripciones
  const insData = {};
  for (const carnet in enrollmentsMap) {
    insData[carnet] = enrollmentsMap[carnet].toArray();
  }
  writeJSON(FILES.inscripciones, insData);

  // 5. Pensum Graph
  const graphData = pensumGraph.getGraphData();
  const pensumToSave = {
    vertices: Object.values(pensumGraph.vertices),
    edges: graphData.edges
  };
  writeJSON(FILES.pensum, pensumToSave);
}
