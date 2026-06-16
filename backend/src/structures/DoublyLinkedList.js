export class DoublyNode {
  constructor(data) {
    this.data = data; // Enrollment object: { curso, semestre, nota }
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // Insert at start
  insertAtStart(data) {
    const newNode = new DoublyNode(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  // Insert at end
  insertAtEnd(data) {
    const newNode = new DoublyNode(data);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  // Delete by course code
  deleteByCurso(cursoCodigo) {
    let current = this.head;
    while (current) {
      if (current.data.curso === cursoCodigo) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }

        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }

        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Search by course code or semester
  search(criteria) {
    // criteria is an object, e.g., { curso: '101' } or { semestre: '1' }
    const results = [];
    let current = this.head;
    while (current) {
      let match = true;
      for (const key in criteria) {
        if (current.data[key] !== criteria[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        results.push(current.data);
      }
      current = current.next;
    }
    return results;
  }

  // Bubble sort on DLL in-place (sorting by semestre or by nota)
  sortBy(field, ascending = true) {
    if (this.size <= 1) return;
    let wasChanged;
    do {
      wasChanged = false;
      let current = this.head;
      while (current && current.next) {
        const val1 = current.data[field];
        const val2 = current.next.data[field];
        let shouldSwap = false;
        if (ascending) {
          shouldSwap = val1 > val2;
        } else {
          shouldSwap = val1 < val2;
        }
        if (shouldSwap) {
          // Swap data
          const temp = current.data;
          current.data = current.next.data;
          current.next.data = temp;
          wasChanged = true;
        }
        current = current.next;
      }
    } while (wasChanged);
  }

  // Convert to array (chronological order)
  toArray() {
    const arr = [];
    let current = this.head;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  // Convert to array (reverse order)
  toArrayReverse() {
    const arr = [];
    let current = this.tail;
    while (current) {
      arr.push(current.data);
      current = current.prev;
    }
    return arr;
  }
}
