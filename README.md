# UniTrack - Manual Técnico y Guía de Uso

UniTrack es una plataforma integral de gestión universitaria desarrollada con **Angular 17+** en el frontend y **Node.js (Express)** en el backend. Su principal objetivo es demostrar la implementación manual y visualización interactiva de estructuras de datos fundamentales sin el uso de librerías externas.

---

## 1. Arquitectura del Sistema

El proyecto está organizado como un monorrepositorio modular:

- **Servidor Backend (Node.js + Express)**:
  - `src/structures/`: Implementaciones nativas de las estructuras de datos.
  - `src/controllers/`: Controladores REST.
  - `src/routes/`: Ruteador Express.
  - `src/services/dataStore.js`: Administra la persistencia JSON y el estado global en memoria.
- **Frontend (Angular 17)**:
  - `src/app/pages/`: Vistas dedicadas para Estudiantes, Cursos, Catedráticos y Pensum.
  - `src/app/services/api.service.ts`: Maneja las conexiones HTTP con el servidor Express.

---

## 2. Documentación de Estructuras de Datos y Complejidad Big-O

Todas las estructuras de datos se implementaron desde cero en JavaScript/TypeScript sin librerías auxiliares.

### 2.1 Lista Enlazada Simple (`SimpleLinkedList`)
- **Uso**: Directorio de Estudiantes. Cada nodo contiene un objeto estudiante y un puntero al siguiente.
- **Operaciones y Complejidades**:
  - `insertAtStart`: \(O(1)\) (Inserción al inicio)
  - `insertAtEnd`: \(O(N)\) (Inserción al final recorriendo la lista)
  - `insertAt(index)`: \(O(N)\) (Inserción en posición intermedia)
  - `deleteByCarnet`: \(O(N)\) (Búsqueda lineal y desconexión)
  - `searchByCarnet`: \(O(N)\) (Búsqueda secuencial)
  - `reverse`: \(O(N)\) (Inversión in-place de punteros)

### 2.2 Lista Doblemente Enlazada (`DoublyLinkedList`)
- **Uso**: Historial de Inscripciones de cada estudiante. Cada nodo contiene punteros anterior (`prev`) y siguiente (`next`).
- **Operaciones y Complejidades**:
  - `insertAtStart` / `insertAtEnd`: \(O(1)\) (Utilizando referencias cabeza/cola)
  - `deleteByCurso`: \(O(N)\)
  - `sortBy(field)`: \(O(N^2)\) (Bubble Sort adaptado para intercambiar datos entre nodos de la lista doblemente enlazada)

### 2.3 Árboles Binarios (BST y AVL)
- **Uso**: Catálogo de Cursos organizado jerárquicamente por código de curso.
- **AVL (Balanceo Automático)**:
  - Implementa rotaciones simples (izquierda/derecha) y dobles (izquierda-derecha/derecha-izquierda) para mantener una diferencia máxima de altura de 1 entre subárboles.
- **Operaciones y Complejidades**:
  - `insert`: BST: \(O(N)\) (Peor caso desbalanceado), AVL: \(O(\log N)\) (Balanceo constante)
  - `delete`: BST: \(O(N)\), AVL: \(O(\log N)\)
  - `search`: BST: \(O(N)\), AVL: \(O(\log N)\)
  - `inOrder` / `preOrder` / `postOrder`: \(O(N)\) (Recorrido de todos los nodos)

### 2.4 Tabla Hash (`CustomHashTable`)
- **Uso**: Directorio de Catedráticos indexados por código de empleado.
- **Especificaciones**:
  - **Funciones Hash**: 
    1. *División*: `h(k) = k % m`
    2. *djb2*: Desplazamiento polinomial `hash * 33 + char`
  - **Colisiones**: Chaining (encadenamiento usando arrays de buckets) y Open Addressing (Linear Probing y Quadratic Probing).
  - **Rehashing**: Redimensionamiento automático a un tamaño primo mayor cuando el factor de carga supera 0.75.
- **Operaciones y Complejidades**:
  - `insert` / `search` / `delete`: Promedio: \(O(1)\), Peor caso (colisión total): \(O(N)\)

### 2.5 Grafo Dirigido (`DirectedGraph`)
- **Uso**: Mapa de prerrequisitos del Pensum de Estudios.
- **Estructura**: Lista de adyacencia (`adjList`).
- **Operaciones y Complejidades**:
  - `addVertex` / `addEdge`: \(O(1)\)
  - `removeVertex`: \(O(V + E)\)
  - `bfs` / `dfs`: \(O(V + E)\)
  - `hasCycle` (Detección de dependencias circulares): \(O(V + E)\)
  - `topologicalSort` (Pensum sugerido): \(O(V + E)\)
  - `shortestPath` (Camino BFS mínimo): \(O(V + E)\)

---

## 3. Endpoints de la API REST

### Estudiantes y Matrículas
- `GET /api/estudiantes`: Retorna la lista enlazada simple de estudiantes.
- `POST /api/estudiantes`: Registra un estudiante (acepta posición `start`, `end`, o `index`).
- `DELETE /api/estudiantes/:carnet`: Elimina un estudiante.
- `POST /api/estudiantes/invertir`: Invierte in-place la lista.
- `GET /api/estudiantes/:carnet/historial`: Retorna la lista doblemente enlazada de inscripciones.
- `POST /api/estudiantes/:carnet/historial/ordenar`: Ordena las inscripciones.

### Cursos (Árboles)
- `GET /api/cursos/tree?mode=[bst|avl]`: Devuelve el árbol en formato jerárquico.
- `POST /api/cursos`: Inserta un curso en ambos árboles.
- `DELETE /api/cursos/:codigo`: Elimina un curso.

### Catedráticos (Tabla Hash)
- `GET /api/catedraticos/stats`: Devuelve factor de carga, colisiones y estado de celdas.
- `POST /api/catedraticos/config`: Cambia función hash y resolución de colisiones al vuelo.

### Pensum (Grafo)
- `GET /api/pensum/topological-sort`: Retorna orden recomendado.
- `GET /api/pensum/detect-cycles`: Valida que no haya prerrequisitos circulares.
- `GET /api/pensum/shortest-path/:from/:to`: Camino más corto entre materias.

---

## 4. Instrucciones de Instalación y Ejecución

### Requisitos Previos
- **Node.js** (v18 o superior)
- **NPM** (v9 o superior)

### Paso 1: Configurar e iniciar el Backend
1. Entra a la carpeta del servidor:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   *El backend se levantará en: `http://localhost:3000`*

### Paso 2: Configurar e iniciar el Frontend (Angular)
1. Abre una nueva terminal y navega a la carpeta de frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Angular:
   ```bash
   npm install
   ```
3. Ejecuta la aplicación de desarrollo:
   ```bash
   npm start
   ```
   *El frontend estará disponible en: `http://localhost:4200`*
