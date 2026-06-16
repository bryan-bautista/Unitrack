export class Node {
  constructor(data) {
    this.data = data; // Student object: { carnet, nombre, apellido, correo, fechaNacimiento, carrera, semestreActual }
    this.next = null;
  }
}

export class SimpleLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Insert at start
  insertAtStart(data) {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  // Insert at end
  insertAtEnd(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  // Insert at specific index (0-based)
  insertAt(data, index) {
    if (index < 0 || index > this.size) {
      throw new Error("Índice fuera de rango");
    }
    if (index === 0) {
      this.insertAtStart(data);
      return;
    }
    const newNode = new Node(data);
    let current = this.head;
    let previous = null;
    let i = 0;
    while (i < index) {
      previous = current;
      current = current.next;
      i++;
    }
    newNode.next = current;
    previous.next = newNode;
    this.size++;
  }

  // Delete by carnet
  deleteByCarnet(carnet) {
    if (!this.head) return false;
    if (this.head.data.carnet === carnet) {
      this.head = this.head.next;
      this.size--;
      return true;
    }
    let current = this.head;
    let previous = null;
    while (current && current.data.carnet !== carnet) {
      previous = current;
      current = current.next;
    }
    if (current) {
      previous.next = current.next;
      this.size--;
      return true;
    }
    return false;
  }

  // Search by carnet
  searchByCarnet(carnet) {
    let current = this.head;
    while (current) {
      if (current.data.carnet === carnet) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  // Convert to array for serialization / API response
  toArray() {
    const arr = [];
    let current = this.head;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  // Get size
  getSize() {
    return this.size;
  }

  // Invert list in-place
  reverse() {
    let prev = null;
    let current = this.head;
    let next = null;
    while (current) {
      next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    this.head = prev;
  }
}
