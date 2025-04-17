
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
    let moved = false;
    for (let i = 0; i < direction; i++) this.rotateGridRight();

    for (let y = 0; y < this.size; y++) {
      const originalRow = this.grid.cells[y];
      const compacted = originalRow.filter(cell => cell != null);

      for (let x = 0; x < compacted.length - 1; x++) {
        if (compacted[x].value === compacted[x + 1].value) {
          compacted[x].value *= 2;
          compacted.splice(x + 1, 1);
          moved = true;
        }
      }

      while (compacted.length < this.size) compacted.push(null);

      for (let x = 0; x < this.size; x++) {
        const oldCell = originalRow[x];
        const newCell = compacted[x];
        if (
          (oldCell && !newCell) ||
          (!oldCell && newCell) ||
          (oldCell && newCell && oldCell.value !== newCell.value)
        ) {
          moved = true;
          break;
        }
      }

      this.grid.cells[y] = compacted;
    }

    for (let i = 0; i < (4 - direction) % 4; i++) this.rotateGridRight();

    if (moved) {
      this.saveToStorage();
    }

    return moved;
  }

  rotateGridRight() {
    const newGrid = this.createEmptyGrid();
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        newGrid.cells[x][this.size - y - 1] = this.grid.cells[y][x];
        if (newGrid.cells[x][this.size - y - 1]) {
          newGrid.cells[x][this.size - y - 1].position = { x, y };
        }
      }
    }
    this.grid = newGrid;
  }

  saveToStorage() {
    localStorage.setItem('gameState', JSON.stringify(this.grid));
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
