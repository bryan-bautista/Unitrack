import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { loadAllData } from './services/dataStore.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Fallback status/health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Load mock / initial data if files are empty
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

function checkAndCreateMockData() {
  const fileCheck = path.join(DATA_DIR, 'estudiantes.json');
  if (!fs.existsSync(fileCheck) || fs.readFileSync(fileCheck, 'utf8').trim() === '' || fs.readFileSync(fileCheck, 'utf8').trim() === '[]') {
    console.log("No existing data found or empty, creating mockup academic records...");
    
    // Create base mockup data files
    const mockupStudents = [
      { carnet: "2023001", nombre: "Juan", apellido: "Pérez", correo: "juan.perez@ur.edu.gt", fechaNacimiento: "2002-04-12", carrera: "Ingeniería en Sistemas", semestreActual: 3 },
      { carnet: "2023002", nombre: "María", apellido: "Gómez", correo: "maria.gomez@ur.edu.gt", fechaNacimiento: "2001-08-22", carrera: "Ingeniería en Sistemas", semestreActual: 3 },
      { carnet: "2023003", nombre: "Carlos", apellido: "Rodríguez", correo: "carlos.rod@ur.edu.gt", fechaNacimiento: "2003-01-05", carrera: "Ingeniería en Sistemas", semestreActual: 1 }
    ];

    const mockupHistory = {
      "2023001": [
        { curso: "CB101", semestre: 1, nota: 85 },
        { curso: "CB102", semestre: 2, nota: 90 },
        { curso: "SI301", semestre: 3, nota: 75 }
      ],
      "2023002": [
        { curso: "CB101", semestre: 1, nota: 95 },
        { curso: "CB102", semestre: 2, nota: 80 }
      ],
      "2023003": [
        { curso: "CB101", semestre: 1, nota: 61 }
      ]
    };

    const mockupCourses = [
      { codigo: "CB101", nombre: "Matemática Computacional 1", creditos: 5, catedraticoAsignado: "L001", horario: "07:00-09:00", cupoMaximo: 35 },
      { codigo: "CB102", nombre: "Matemática Computacional 2", creditos: 5, catedraticoAsignado: "L001", horario: "09:00-11:00", cupoMaximo: 35 },
      { codigo: "SI301", nombre: "Estructuras de Datos", creditos: 6, catedraticoAsignado: "L002", horario: "11:00-13:00", cupoMaximo: 30 },
      { codigo: "SI302", nombre: "Análisis y Diseño de Sistemas 1", creditos: 5, catedraticoAsignado: "L002", horario: "13:00-15:00", cupoMaximo: 30 },
      { codigo: "SI401", nombre: "Bases de Datos 1", creditos: 5, catedraticoAsignado: "L003", horario: "15:00-17:00", cupoMaximo: 30 }
    ];

    const mockupProfessors = [
      { codigo: "L001", nombre: "Ing. Marvin", apellido: "Morales", especialidad: "Matemáticas", correo: "marvin.morales@ur.edu.gt", cursosAsignados: ["CB101", "CB102"] },
      { codigo: "L002", nombre: "Ing. Alejandro", apellido: "Guzmán", especialidad: "Software", correo: "alejandro.guzman@ur.edu.gt", cursosAsignados: ["SI301", "SI302"] },
      { codigo: "L003", nombre: "Inga. Sandra", apellido: "López", especialidad: "Bases de Datos", correo: "sandra.lopez@ur.edu.gt", cursosAsignados: ["SI401"] }
    ];

    const mockupPensum = {
      vertices: [
        { codigo: "CB101", nombre: "Matemática Computacional 1", creditos: 5 },
        { codigo: "CB102", nombre: "Matemática Computacional 2", creditos: 5 },
        { codigo: "SI301", nombre: "Estructuras de Datos", creditos: 6 },
        { codigo: "SI302", nombre: "Análisis y Diseño de Sistemas 1", creditos: 5 },
        { codigo: "SI401", nombre: "Bases de Datos 1", creditos: 5 }
      ],
      edges: [
        { from: "CB101", to: "CB102" },
        { from: "CB102", to: "SI301" },
        { from: "SI301", to: "SI401" },
        { from: "SI301", to: "SI302" }
      ]
    };

    fs.writeFileSync(path.join(DATA_DIR, 'estudiantes.json'), JSON.stringify(mockupStudents, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'inscripciones.json'), JSON.stringify(mockupHistory, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'cursos.json'), JSON.stringify(mockupCourses, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'catedraticos.json'), JSON.stringify(mockupProfessors, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'pensum.json'), JSON.stringify(mockupPensum, null, 2));
  }
}

checkAndCreateMockData();

// Init memory structures
console.log("Loading datasets into memory structures...");
loadAllData();
console.log("Memory load done!");

app.listen(PORT, () => {
  console.log(`UniTrack backend online on port: http://localhost:${PORT}`);
});
