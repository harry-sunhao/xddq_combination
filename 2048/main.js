
import { GameManager } from './gameManager.js';

window.addEventListener("DOMContentLoaded", () => {
  const dirText = ['上', '右', '下', '左'];
  let game = new GameManager(4);
  window.game = game;

  if (!localStorage.getItem("gameState")) {
    game.restart();
  }

  document.getElementById('go').addEventListener('click', step);

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

  function simulateMove(originalGrid, dir) {
    const simGame = new GameManager(4);
    simGame.grid = JSON.parse(JSON.stringify(originalGrid));
    simGame.move(dir);
    return simGame.grid;
  }

  function scoreGrid(grid) {
    let empty = 0;
    let maxVal = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cell = grid.cells[y][x];
        if (!cell) empty++;
        else maxVal = Math.max(maxVal, cell.value);
      }
    }
    return empty * 10 + Math.log2(maxVal);
  }
  function step() {
    const board = getCurrentState();
    if (board.every(v => v === 0)) return alert("当前棋盘为空，请设置内容");

    const currentGrid = JSON.parse(JSON.stringify(game.grid));

    // 原始算法：随机方向
    const originalMove = Math.floor(Math.random() * 4);
    const originalGrid = simulateMove(currentGrid, originalMove);
    const originalScore = scoreGrid(originalGrid);

    // 改进算法：评分函数选最优
    let bestMove = -1;
    let bestScore = -Infinity;
    for (let dir = 0; dir < 4; dir++) {
      const testGrid = simulateMove(currentGrid, dir);
      const score = scoreGrid(testGrid);
      if (score > bestScore) {
        bestScore = score;
        bestMove = dir;
      }
    }

    // 更新显示内容
    document.getElementById("original-move").innerText = dirText[originalMove];
    document.getElementById("original-score").innerText = originalScore.toFixed(1);
    document.getElementById("improved-move").innerText = dirText[bestMove];
    document.getElementById("improved-score").innerText = bestScore.toFixed(1);
    document.getElementById("improved-move").style.color = "";

    // 决策逻辑：
    if (originalMove === bestMove || originalScore >= bestScore) {
      game.move(originalMove);
      renderGrid(originalMove);
    } else {
      // 不执行任何移动，标红推荐方向
      document.getElementById("improved-move").style.color = "red";
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

  function clear1() {
    if (!confirm("是否确认清空全部？")) return;
    const grid = {
      size: 4,
      cells: [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ]
    };
    localStorage.setItem("gameState", JSON.stringify({ grid }));
    game.setup();
    renderGrid();
  }

  window.getGrid = renderGrid;
  window.clear1 = clear1;
  setGrid();
  game.setup();
  renderGrid();
});
