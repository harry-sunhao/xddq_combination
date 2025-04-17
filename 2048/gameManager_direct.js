
export class GameManager {
  constructor(size) {
    this.size = size;
    this.grid = this.createEmptyGrid();
    this.loadFromStorage();
  }

  createEmptyGrid() {
    return {
      size: this.size,
      cells: Array(this.size).fill(null).map(() => Array(this.size).fill(null))
    };
  }

  setup() {
    this.loadFromStorage();
  }

  restart() {
    this.grid = this.createEmptyGrid();
    this.saveToStorage();
  }

  addRandomTile() {
    const emptyCells = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (!this.grid.cells[y][x]) emptyCells.push({ x, y });
      }
    }
    if (emptyCells.length === 0) return;
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.grid.cells[y][x] = {
      position: { x, y },
      value: Math.random() < 0.9 ? 2 : 4
    };
  }

  move(direction) {
    const oldGrid = JSON.stringify(this.grid.cells);
    let moved = false;

    const mergeRow = (row) => {
      row = row.filter(v => v !== null);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i].value === row[i + 1].value) {
          row[i].value *= 2;
          row.splice(i + 1, 1);
        }
      }
      while (row.length < this.size) row.push(null);
      return row;
    };

    if (direction === 0) { // 上
      for (let x = 0; x < this.size; x++) {
        const col = [];
        for (let y = 0; y < this.size; y++) col.push(this.grid.cells[y][x]);
        const merged = mergeRow(col);
        for (let y = 0; y < this.size; y++) this.grid.cells[y][x] = merged[y];
      }
    }

    if (direction === 1) { // 右
      for (let y = 0; y < this.size; y++) {
        let row = this.grid.cells[y].slice().reverse();
        row = mergeRow(row);
        this.grid.cells[y] = row.reverse();
      }
    }

    if (direction === 2) { // 下
      for (let x = 0; x < this.size; x++) {
        const col = [];
        for (let y = this.size - 1; y >= 0; y--) col.push(this.grid.cells[y][x]);
        const merged = mergeRow(col);
        for (let y = this.size - 1; y >= 0; y--) this.grid.cells[y][x] = merged[this.size - 1 - y];
      }
    }

    if (direction === 3) { // 左
      for (let y = 0; y < this.size; y++) {
        let row = this.grid.cells[y].slice();
        row = mergeRow(row);
        this.grid.cells[y] = row;
      }
    }

    if (JSON.stringify(this.grid.cells) !== oldGrid) {
      moved = true;
      this.saveToStorage();
    }

    return moved;
  }

  saveToStorage() {
    localStorage.setItem('gameState', JSON.stringify({ grid: this.grid }));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.grid = parsed.grid || this.createEmptyGrid();
      } catch (_) {
        this.grid = this.createEmptyGrid();
      }
    } else {
      this.grid = this.createEmptyGrid();
    }
  }
}
