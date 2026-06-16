import { coursesAVL, coursesBST, saveAllData } from '../services/dataStore.js';

export const getCourses = (req, res) => {
  const { traversal } = req.query; // 'inorder', 'preorder', 'postorder'
  let courses = [];
  if (traversal === 'preorder') {
    courses = coursesAVL.preOrder();
  } else if (traversal === 'postorder') {
    courses = coursesAVL.postOrder();
  } else {
    courses = coursesAVL.inOrder();
  }
  res.json(courses);
};

export const getCourseByCode = (req, res) => {
  const { codigo } = req.params;
  const course = coursesAVL.search(codigo);
  if (!course) {
    return res.status(404).json({ message: "Curso no encontrado" });
  }
  res.json(course);
};

export const createCourse = (req, res) => {
  const { codigo, nombre, creditos, catedraticoAsignado, horario, cupoMaximo } = req.body;

  if (!codigo || !nombre || !creditos) {
    return res.status(400).json({ message: "Código, nombre y créditos son requeridos" });
  }

  const course = {
    codigo,
    nombre,
    creditos: Number(creditos),
    catedraticoAsignado: catedraticoAsignado || "No asignado",
    horario: horario || "TBD",
    cupoMaximo: Number(cupoMaximo) || 40
  };

  // Check if already exists
  if (coursesAVL.search(codigo)) {
    return res.status(400).json({ message: "Ya existe un curso con este código" });
  }

  coursesAVL.insert(course);
  coursesBST.insert(course);

  saveAllData();
  res.status(201).json({ message: "Curso creado e insertado en árboles BST y AVL", course });
};

export const deleteCourse = (req, res) => {
  const { codigo } = req.params;

  if (!coursesAVL.search(codigo)) {
    return res.status(404).json({ message: "Curso no encontrado" });
  }

  coursesAVL.delete(codigo);
  coursesBST.delete(codigo);

  saveAllData();
  res.json({ message: "Curso eliminado de los árboles BST y AVL" });
};

export const getTreeStats = (req, res) => {
  const { mode } = req.query; // 'bst' or 'avl'
  const tree = mode === 'bst' ? coursesBST : coursesAVL;
  res.json({
    height: tree.getHeight(),
    min: tree.findMin(),
    max: tree.findMax()
  });
};

export const getTreeStructure = (req, res) => {
  const { mode } = req.query; // 'bst' or 'avl'
  const tree = mode === 'bst' ? coursesBST : coursesAVL;
  res.json({
    mode: mode === 'bst' ? 'BST' : 'AVL',
    root: tree.getTreeStructure()
  });
};
