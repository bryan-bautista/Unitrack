import { professorsHash, saveAllData } from '../services/dataStore.js';

export const getProfessors = (req, res) => {
  res.json(professorsHash.toArray());
};

export const getProfessorByCode = (req, res) => {
  const { codigo } = req.params;
  const professor = professorsHash.search(codigo);
  if (!professor) {
    return res.status(404).json({ message: "Catedrático no encontrado" });
  }
  res.json(professor);
};

export const createProfessor = (req, res) => {
  const { codigo, nombre, apellido, especialidad, correo, cursosAsignados } = req.body;

  if (!codigo || !nombre || !apellido) {
    return res.status(400).json({ message: "Código, nombre y apellido son obligatorios" });
  }

  const professor = {
    codigo,
    nombre,
    apellido,
    especialidad: especialidad || "General",
    correo: correo || "",
    cursosAsignados: cursosAsignados || []
  };

  professorsHash.insert(codigo, professor);
  saveAllData();
  res.status(201).json({ message: "Catedrático agregado al directorio", professor });
};

export const deleteProfessor = (req, res) => {
  const { codigo } = req.params;
  const deleted = professorsHash.delete(codigo);
  if (!deleted) {
    return res.status(404).json({ message: "Catedrático no encontrado" });
  }
  saveAllData();
  res.json({ message: "Catedrático eliminado del directorio" });
};

export const getHashStats = (req, res) => {
  const stats = professorsHash.getStats();
  // Include raw buckets data for UI visualization
  res.json({
    stats,
    buckets: professorsHash.buckets
  });
};

export const configureHashTable = (req, res) => {
  const { hashFunction, collisionMethod } = req.body; // 'division' | 'djb2', 'chaining' | 'linear' | 'quadratic'
  
  if (!hashFunction || !collisionMethod) {
    return res.status(400).json({ message: "hashFunction y collisionMethod son requeridos" });
  }

  try {
    professorsHash.setConfiguration(hashFunction, collisionMethod);
    saveAllData();
    res.json({
      message: "Configuración de Tabla Hash actualizada y re-hasheada con éxito",
      stats: professorsHash.getStats()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
