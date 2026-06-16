import { pensumGraph, saveAllData } from '../services/dataStore.js';

export const getPensum = (req, res) => {
  res.json(pensumGraph.getGraphData());
};

export const addCourseVertex = (req, res) => {
  const { codigo, nombre, creditos } = req.body;
  if (!codigo || !nombre) {
    return res.status(400).json({ message: "Código y nombre son obligatorios" });
  }

  const courseNode = { codigo, nombre, creditos: Number(creditos) || 0 };
  pensumGraph.addVertex(courseNode);
  saveAllData();
  res.status(201).json({ message: "Curso agregado al pensum (grafo)", courseNode });
};

export const removeCourseVertex = (req, res) => {
  const { codigo } = req.params;
  const removed = pensumGraph.removeVertex(codigo);
  if (!removed) {
    return res.status(404).json({ message: "Curso no encontrado en el pensum" });
  }
  saveAllData();
  res.json({ message: "Curso eliminado del pensum (y todas sus relaciones de prerrequisito)" });
};

export const addPrerequisiteEdge = (req, res) => {
  const { fromCode, toCode } = req.body; // A -> B (A es prerrequisito de B)
  if (!fromCode || !toCode) {
    return res.status(400).json({ message: "fromCode (prerrequisito) y toCode (curso destino) son obligatorios" });
  }

  const added = pensumGraph.addEdge(fromCode, toCode);
  if (!added) {
    return res.status(404).json({ message: "Curso de origen o destino no existe en el grafo" });
  }

  saveAllData();
  res.status(201).json({ message: "Relación de prerrequisito agregada", relation: { fromCode, toCode } });
};

export const removePrerequisiteEdge = (req, res) => {
  const { from, to } = req.params;
  const removed = pensumGraph.removeEdge(from, to);
  if (!removed) {
    return res.status(404).json({ message: "Error al remover la relación" });
  }
  saveAllData();
  res.json({ message: "Relación de prerrequisito eliminada" });
};

export const getTopologicalSort = (req, res) => {
  const sorted = pensumGraph.topologicalSort();
  if (sorted === null) {
    return res.status(400).json({
      message: "No se puede realizar el ordenamiento topológico porque existen ciclos (dependencias circulares) en el pensum."
    });
  }
  
  // Map codes to course details
  const courseDetails = sorted.map(code => pensumGraph.vertices[code]);
  res.json(courseDetails);
};

export const detectCycles = (req, res) => {
  const cyclic = pensumGraph.hasCycle();
  res.json({
    hasCycle: cyclic,
    message: cyclic ? "Se detectaron ciclos en el pensum de estudios." : "El pensum no contiene ciclos (dependencias circulares)."
  });
};

export const getCoursePrerequisites = (req, res) => {
  const { curso } = req.params;
  const prereqs = pensumGraph.getPrerequisites(curso);
  if (!prereqs) {
    return res.status(404).json({ message: "Curso no encontrado" });
  }

  // Resolve details
  const directDetails = prereqs.direct.map(code => pensumGraph.vertices[code]);
  const indirectDetails = prereqs.indirect.map(code => pensumGraph.vertices[code]);

  res.json({
    course: pensumGraph.vertices[curso],
    direct: directDetails,
    indirect: indirectDetails
  });
};

export const getShortestPath = (req, res) => {
  const { from, to } = req.params;
  const path = pensumGraph.shortestPath(from, to);
  if (!path) {
    return res.status(404).json({ message: "No se encontró ningún camino de prerrequisitos entre los dos cursos." });
  }

  const pathDetails = path.map(code => pensumGraph.vertices[code]);
  res.json(pathDetails);
};

export const runBFS = (req, res) => {
  const { code } = req.params;
  const result = pensumGraph.bfs(code);
  const resultDetails = result.map(c => pensumGraph.vertices[c]);
  res.json({
    startNode: code,
    sequence: result,
    details: resultDetails
  });
};

export const runDFS = (req, res) => {
  const { code } = req.params;
  const result = pensumGraph.dfs(code);
  const resultDetails = result.map(c => pensumGraph.vertices[c]);
  res.json({
    startNode: code,
    sequence: result,
    details: resultDetails
  });
};
