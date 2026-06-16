// Manual implementation of a Hash Table that supports multiple hash functions and collision resolution methods.
export class CustomHashTable {
  constructor(initialCapacity = 11) {
    this.capacity = initialCapacity;
    this.size = 0;
    this.buckets = new Array(this.capacity).fill(null);
    this.hashFunctionType = "division"; // "division" | "djb2"
    this.collisionMethod = "chaining"; // "chaining" | "linear" | "quadratic"
    this.collisionCount = 0;
  }

  // Convert key (string/number) to integer code
  _getKeyNumericValue(key) {
    const keyStr = String(key);
    let hash = 0;
    for (let i = 0; i < keyStr.length; i++) {
      hash += keyStr.charCodeAt(i);
    }
    return hash;
  }

  // Hash Function 1: Division method
  _hashDivision(key, m) {
    const k = this._getKeyNumericValue(key);
    return k % m;
  }

  // Hash Function 2: djb2
  _hashDjb2(key, m) {
    const keyStr = String(key);
    let hash = 5381;
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash * 33) ^ keyStr.charCodeAt(i);
    }
    // Return positive index
    return Math.abs(hash) % m;
  }

  _getHash(key, m = this.capacity) {
    if (this.hashFunctionType === "djb2") {
      return this._hashDjb2(key, m);
    }
    return this._hashDivision(key, m);
  }

  setConfiguration(hashFunc, collisionMethod) {
    const oldConfigFunc = this.hashFunctionType;
    const oldConfigMethod = this.collisionMethod;

    this.hashFunctionType = hashFunc;
    this.collisionMethod = collisionMethod;

    // Rehash all existing elements with the new configuration
    if (oldConfigFunc !== hashFunc || oldConfigMethod !== collisionMethod) {
      this._rehash(this.capacity);
    }
  }

  insert(key, val) {
    // Check load factor for resizing ( rehashing when > 0.75 )
    if (this.size / this.capacity >= 0.75) {
      this._rehash(this._nextPrime(this.capacity * 2));
    }

    if (this.collisionMethod === "chaining") {
      this._insertChaining(key, val);
    } else {
      this._insertOpenAddressing(key, val);
    }
  }

  _insertChaining(key, val) {
    const idx = this._getHash(key);
    if (this.buckets[idx] === null) {
      this.buckets[idx] = []; // Represent chain as native array for buckets, containing { key, val }
    } else {
      this.collisionCount++;
    }

    // Check if key already exists in the chain
    const chain = this.buckets[idx];
    for (let i = 0; i < chain.length; i++) {
      if (chain[i].key === key) {
        chain[i].val = val;
        return;
      }
    }

    chain.push({ key, val });
    this.size++;
  }

  _insertOpenAddressing(key, val) {
    const baseIdx = this._getHash(key);
    let i = 0;
    while (i < this.capacity) {
      let idx;
      if (this.collisionMethod === "linear") {
        idx = (baseIdx + i) % this.capacity;
      } else {
        // Quadratic probing: (base + i^2) % capacity
        idx = (baseIdx + i * i) % this.capacity;
      }

      if (i > 0 && this.buckets[idx] !== null) {
        this.collisionCount++;
      }

      const entry = this.buckets[idx];
      if (entry === null || entry.deleted || entry.key === key) {
        if (entry === null || entry.deleted) {
          this.size++;
        }
        this.buckets[idx] = { key, val, deleted: false };
        return;
      }
      i++;
    }
    // If full, rehash and retry
    this._rehash(this._nextPrime(this.capacity * 2));
    this.insert(key, val);
  }

  search(key) {
    if (this.collisionMethod === "chaining") {
      const idx = this._getHash(key);
      const chain = this.buckets[idx];
      if (chain) {
        for (let i = 0; i < chain.length; i++) {
          if (chain[i].key === key) {
            return chain[i].val;
          }
        }
      }
    } else {
      const baseIdx = this._getHash(key);
      let i = 0;
      while (i < this.capacity) {
        let idx;
        if (this.collisionMethod === "linear") {
          idx = (baseIdx + i) % this.capacity;
        } else {
          idx = (baseIdx + i * i) % this.capacity;
        }

        const entry = this.buckets[idx];
        if (entry === null) return null; // Hit empty bucket, not found
        if (!entry.deleted && entry.key === key) {
          return entry.val;
        }
        i++;
      }
    }
    return null;
  }

  delete(key) {
    if (this.collisionMethod === "chaining") {
      const idx = this._getHash(key);
      const chain = this.buckets[idx];
      if (chain) {
        for (let i = 0; i < chain.length; i++) {
          if (chain[i].key === key) {
            chain.splice(i, 1);
            this.size--;
            if (chain.length === 0) {
              this.buckets[idx] = null;
            }
            return true;
          }
        }
      }
    } else {
      const baseIdx = this._getHash(key);
      let i = 0;
      while (i < this.capacity) {
        let idx;
        if (this.collisionMethod === "linear") {
          idx = (baseIdx + i) % this.capacity;
        } else {
          idx = (baseIdx + i * i) % this.capacity;
        }

        const entry = this.buckets[idx];
        if (entry === null) return false;
        if (!entry.deleted && entry.key === key) {
          entry.deleted = true;
          this.size--;
          return true;
        }
        i++;
      }
    }
    return false;
  }

  // Rehash elements to a new capacity
  _rehash(newCapacity) {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.size = 0;
    this.collisionCount = 0;
    this.buckets = new Array(this.capacity).fill(null);

    for (let i = 0; i < oldBuckets.length; i++) {
      const entry = oldBuckets[i];
      if (entry !== null) {
        if (this.collisionMethod === "chaining") {
          // entry is a chain array
          for (let j = 0; j < entry.length; j++) {
            this._insertChaining(entry[j].key, entry[j].val);
          }
        } else {
          // entry is a single object { key, val, deleted }
          if (!entry.deleted) {
            this._insertOpenAddressing(entry.key, entry.val);
          }
        }
      }
    }
  }

  // Get prime number for rehashing sizes
  _nextPrime(n) {
    const isPrime = (num) => {
      if (num <= 1) return false;
      if (num <= 3) return true;
      if (num % 2 === 0 || num % 3 === 0) return false;
      for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
      }
      return true;
    };

    let prime = n;
    if (prime % 2 === 0) prime++;
    while (!isPrime(prime)) {
      prime += 2;
    }
    return prime;
  }

  // Real-time statistics
  getStats() {
    let occupiedBuckets = 0;
    const bucketDistribution = [];

    for (let i = 0; i < this.capacity; i++) {
      const entry = this.buckets[i];
      if (entry === null) {
        bucketDistribution.push(0);
      } else if (this.collisionMethod === "chaining") {
        occupiedBuckets++;
        bucketDistribution.push(entry.length);
      } else {
        if (!entry.deleted) {
          occupiedBuckets++;
          bucketDistribution.push(1);
        } else {
          bucketDistribution.push(-1); // -1 signifies Tombstone (deleted)
        }
      }
    }

    return {
      size: this.size,
      capacity: this.capacity,
      loadFactor: Number((this.size / this.capacity).toFixed(2)),
      collisionCount: this.collisionCount,
      occupiedBuckets,
      bucketDistribution
    };
  }

  // Return all stored items
  toArray() {
    const arr = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this.buckets[i];
      if (entry !== null) {
        if (this.collisionMethod === "chaining") {
          for (let j = 0; j < entry.length; j++) {
            arr.push(entry[j].val);
          }
        } else {
          if (!entry.deleted) {
            arr.push(entry.val);
          }
        }
      }
    }
    return arr;
  }
}
