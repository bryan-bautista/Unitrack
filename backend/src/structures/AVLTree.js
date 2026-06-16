export class AVLNode {
  constructor(course) {
    this.key = course.codigo; // Course code
    this.course = course;
    this.left = null;
    this.right = null;
    this.height = 1; // Base height starts at 1
  }
}

export class AVLTree {
  constructor() {
    this.root = null;
  }

  // Helper helper functions for height and balance factor
  _getHeight(node) {
    return node ? node.height : 0;
  }

  _getBalanceFactor(node) {
    return node ? this._getHeight(node.left) - this._getHeight(node.right) : 0;
  }

  _updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
    }
  }

  // Rotations
  // Right Rotation (Single rotation to balance a LL imbalance)
  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    this._updateHeight(y);
    this._updateHeight(x);

    return x; // New root
  }

  // Left Rotation (Single rotation to balance a RR imbalance)
  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    this._updateHeight(x);
    this._updateHeight(y);

    return y; // New root
  }

  insert(course) {
    this.root = this._insertNode(this.root, course);
  }

  _insertNode(node, course) {
    if (!node) {
      return new AVLNode(course);
    }

    if (course.codigo < node.key) {
      node.left = this._insertNode(node.left, course);
    } else if (course.codigo > node.key) {
      node.right = this._insertNode(node.right, course);
    } else {
      // Key already exists, replace data
      node.course = course;
      return node;
    }

    // Update height
    this._updateHeight(node);

    // Get balance factor
    const balance = this._getBalanceFactor(node);

    // Case LL
    if (balance > 1 && course.codigo < node.left.key) {
      return this._rotateRight(node);
    }

    // Case RR
    if (balance < -1 && course.codigo > node.right.key) {
      return this._rotateLeft(node);
    }

    // Case LR
    if (balance > 1 && course.codigo > node.left.key) {
      node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }

    // Case RL
    if (balance < -1 && course.codigo < node.right.key) {
      node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }

    return node;
  }

  search(key) {
    return this._searchNode(this.root, key);
  }

  _searchNode(node, key) {
    if (!node) return null;
    if (key < node.key) return this._searchNode(node.left, key);
    if (key > node.key) return this._searchNode(node.right, key);
    return node.course;
  }

  delete(key) {
    this.root = this._deleteNode(this.root, key);
  }

  _deleteNode(node, key) {
    if (!node) return null;

    if (key < node.key) {
      node.left = this._deleteNode(node.left, key);
    } else if (key > node.key) {
      node.right = this._deleteNode(node.right, key);
    } else {
      // Node found
      if (!node.left || !node.right) {
        let temp = node.left ? node.left : node.right;
        if (!temp) {
          temp = null;
          node = null;
        } else {
          node = temp; // Copy contents of non-empty child
        }
      } else {
        // Node with two children
        const temp = this._findMinNode(node.right);
        node.key = temp.key;
        node.course = temp.course;
        node.right = this._deleteNode(node.right, temp.key);
      }
    }

    if (!node) return null;

    // Update height
    this._updateHeight(node);

    // Get balance factor
    const balance = this._getBalanceFactor(node);

    // Case LL
    if (balance > 1 && this._getBalanceFactor(node.left) >= 0) {
      return this._rotateRight(node);
    }

    // Case LR
    if (balance > 1 && this._getBalanceFactor(node.left) < 0) {
      node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }

    // Case RR
    if (balance < -1 && this._getBalanceFactor(node.right) <= 0) {
      return this._rotateLeft(node);
    }

    // Case RL
    if (balance < -1 && this._getBalanceFactor(node.right) > 0) {
      node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }

    return node;
  }

  _findMinNode(node) {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  findMin() {
    if (!this.root) return null;
    return this._findMinNode(this.root).course;
  }

  findMax() {
    if (!this.root) return null;
    let current = this.root;
    while (current.right) {
      current = current.right;
    }
    return current.course;
  }

  getHeight() {
    return this._getHeight(this.root) - 1;
  }

  inOrder() {
    const list = [];
    this._inOrderNode(this.root, list);
    return list;
  }

  _inOrderNode(node, list) {
    if (node) {
      this._inOrderNode(node.left, list);
      list.push(node.course);
      this._inOrderNode(node.right, list);
    }
  }

  preOrder() {
    const list = [];
    this._preOrderNode(this.root, list);
    return list;
  }

  _preOrderNode(node, list) {
    if (node) {
      list.push(node.course);
      this._preOrderNode(node.left, list);
      this._preOrderNode(node.right, list);
    }
  }

  postOrder() {
    const list = [];
    this._postOrderNode(this.root, list);
    return list;
  }

  _postOrderNode(node, list) {
    if (node) {
      this._postOrderNode(node.left, list);
      this._postOrderNode(node.right, list);
      list.push(node.course);
    }
  }

  getTreeStructure() {
    return this._getStructure(this.root);
  }

  _getStructure(node) {
    if (!node) return null;
    return {
      key: node.key,
      nombre: node.course.nombre,
      balanceFactor: this._getBalanceFactor(node),
      left: this._getStructure(node.left),
      right: this._getStructure(node.right)
    };
  }
}
