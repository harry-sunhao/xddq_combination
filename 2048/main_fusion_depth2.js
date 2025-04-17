
import { GameManager } from './gameManager.js';

let bestMove = -1;

window.addEventListener("DOMContentLoaded", () => {
  const dirText = ['上', '右', '下', '左'];
  let game = new GameManager(4);
  window.game = game;

  if (!localStorage.getItem("gameState")) {
    game.restart();
  }

  document.getElementById('go').addEventListener('click', step);
  document.getElementById("use-recommend").addEventListener("click", () => {
    if (typeof bestMove !== "undefined" && bestMove >= 0) {
      game.move(bestMove);
      renderGrid(bestMove);
      document.getElementById("use-recommend").style.display = "none";
    } else {
      alert("没有推荐方向");
    }
  });

  const cells = document.getElementsByClassName("cell");
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener("mousedown", e => {
      let value = parseInt(cells[i].value || '0');
      value = e.offsetX > e.target.offsetWidth / 2 ? value + 1 : value - 1;
      value = Math.max(0, Math.min(11, value));
      cells[i].value = value === 0 ? '' : value;
      cells[i].style.backgroundImage = value ? `url(./img/${value}.png)` : '';
      cells[i].classList.toggle("n", !!value);
      setGrid();
    });
  }

  function getCurrentState() {
    const state = new Uint16Array(4);
    if (!game?.grid?.cells) return state;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const cell = game.grid.cells[y]?.[x];
        if (cell) {
          state[x] |= (Math.log2(cell.value) & 0xf) << (12 - 4 * y);
        }
      }
    }
    return state;
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getEmptyCells(grid) {
    const empty = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (!grid.cells[y][x]) empty.push([x, y]);
      }
    }
    return empty;
  }

  function fusionScore(grid) {
    let score = 0;
    let fusionPower = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cell = grid.cells[y][x];
        if (!cell) continue;
        const val = cell.value;
        if (val >= 128) fusionPower += Math.log2(val) ** 2;
      }
    }
    const empty = getEmptyCells(grid).length;
    score += fusionPower + empty * 5;
    return score;
  }

  function simulateMove(originalGrid, dir) {
    const simGame = new GameManager(4);
    simGame.grid = deepClone(originalGrid);
    const moved = simGame.move(dir);
    return { moved, grid: simGame.grid };
  }

  function expectimaxScore(grid, depth = 2) {
    if (depth === 0) return fusionScore(grid);

    const empty = getEmptyCells(grid);
    if (empty.length === 0) return fusionScore(grid);

    const tileValues = [2, 4, 8, 16, 32, 64];
    const tileProb = 1.0 / tileValues.length;

    let total = 0;
    for (const [x, y] of empty) {
      for (const val of tileValues) {
        const newGrid = deepClone(grid);
        newGrid.cells[y][x] = { value: val, position: { x, y } };
        let maxChildScore = -Infinity;
        for (let dir = 0; dir < 4; dir++) {
          const { moved, grid: movedGrid } = simulateMove(newGrid, dir);
          if (!moved) continue;
          const s = expectimaxScore(movedGrid, depth - 1);
          maxChildScore = Math.max(maxChildScore, s);
        }
        total += tileProb * (maxChildScore / empty.length);
      }
    }
    return total;
  }

  function step() {
    const board = getCurrentState();
    if (board.every(v => v === 0)) return alert("当前棋盘为空，请设置内容");

    const currentGrid = deepClone(game.grid);

    const originalMove = Math.floor(Math.random() * 4);
    const simOriginal = simulateMove(currentGrid, originalMove);
    const originalScore = simOriginal.moved ? fusionScore(simOriginal.grid) : -Infinity;

    bestMove = -1;
    let bestScore = -Infinity;
    for (let dir = 0; dir < 4; dir++) {
      const { moved, grid } = simulateMove(currentGrid, dir);
      if (!moved) continue;
      const score = expectimaxScore(grid, 2);
      if (score > bestScore) {
        bestScore = score;
        bestMove = dir;
      }
    }

    document.getElementById("original-move").innerText = dirText[originalMove];
    document.getElementById("original-score").innerText = originalScore.toFixed(1);
    document.getElementById("improved-move").innerText = bestMove >= 0 ? dirText[bestMove] : '-';
    document.getElementById("improved-score").innerText = bestScore.toFixed(1);
    document.getElementById("improved-move").style.color = "";
    document.getElementById("use-recommend").style.display = "none";

    if (originalMove === bestMove || originalScore >= bestScore) {
      if (simOriginal.moved) {
        game.move(originalMove);
        renderGrid(originalMove);
      } else {
        alert("原始方向不可移动");
      }
    } else {
      document.getElementById("improved-move").style.color = "red";
      document.getElementById("use-recommend").style.display = "inline-block";
    }
  }

  function renderGrid(dir) {
    const cells = game.grid.cells;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cell = cells[y][x];
        const el = document.getElementById(`grid_${x}_${y}`);
        if (cell) {
          let val = Math.log2(cell.value);
          val = val > 11 ? 11 : val;
          el.value = val;
          el.style.backgroundImage = `url(./img/${val}.png)`;
          el.classList.add("n");
        } else {
          el.value = '';
          el.style.backgroundImage = '';
          el.classList.remove("n");
        }
      }
    }
    if (dir !== undefined) document.getElementById("dir").innerText = dirText[dir];
  }

  function setGrid() {
    const data = { size: 4, cells: Array(4).fill(null).map(() => Array(4).fill(null)) };
    let counter = 11;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const val = document.getElementById(`grid_${x}_${y}`).value;
        if (val) {
          let v = parseInt(val);
          if (v === 11) v = counter++;
          data.cells[y][x] = { position: { x, y }, value: Math.pow(2, v) };
        }
      }
    }
    localStorage.setItem("gameState", JSON.stringify({ grid: data }));
    game.setup();
  }

  window.getGrid = renderGrid;
  setGrid();
  game.setup();
  renderGrid();
});
