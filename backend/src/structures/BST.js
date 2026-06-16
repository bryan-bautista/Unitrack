export class BSTNode {
  constructor(course) {
    this.key = course.codigo; // Course code (string/number comparing key)
    this.course = course;
    this.left = null;
    this.right = null;
  }
}

export class BST {
  constructor() {
    this.root = null;
  }

  insert(course) {
    const newNode = new BSTNode(course);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    this._insertNode(this.root, newNode);
  }

  _insertNode(node, newNode) {
    if (newNode.key < node.key) {
      if (!node.left) {
        node.left = newNode;
      } else {
        this._insertNode(node.left, newNode);
      }
    } else if (newNode.key > node.key) {
      if (!node.right) {
        node.right = newNode;
      } else {
        this._insertNode(node.right, newNode);
      }
    } else {
      // Key already exists, replace data
      node.course = newNode.course;
    }
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
      return node;
    } else if (key > node.key) {
      node.right = this._deleteNode(node.right, key);
      return node;
    } else {
      // Node found
      if (!node.left && !node.right) {
        return null;
      }
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Node has two children: get minimum node of right subtree
      const minRight = this._findMinNode(node.right);
      node.key = minRight.key;
      node.course = minRight.course;
      node.right = this._deleteNode(node.right, minRight.key);
      return node;
    }
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
    return this._getHeightNode(this.root);
  }

  _getHeightNode(node) {
    if (!node) return -1;
    return 1 + Math.max(this._getHeightNode(node.left), this._getHeightNode(node.right));
  }

  // Traversals
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

  // Get raw JSON representation of the tree structure for visualization
  getTreeStructure() {
    return this._getStructure(this.root);
  }

  _getStructure(node) {
    if (!node) return null;
    return {
      key: node.key,
      nombre: node.course.nombre,
      left: this._getStructure(node.left),
      right: this._getStructure(node.right)
    };
  }
}
