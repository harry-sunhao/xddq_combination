
function advancedScore(grid) {
  let score = 0;
  const size = 4;

  // 1. 空格数
  let empty = 0;
  let maxVal = 0;
  let maxPos = { x: 0, y: 0 };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = grid.cells[y][x];
      if (!cell) {
        empty++;
      } else {
        if (cell.value > maxVal) {
          maxVal = cell.value;
          maxPos = { x, y };
        }
      }
    }
  }
  score += empty * 10;

  // 2. 最大值是否在角落
  const inCorner = (maxPos.x === 0 || maxPos.x === 3) && (maxPos.y === 0 || maxPos.y === 3);
  if (inCorner) score += 20;

  // 3. 平滑性惩罚（相邻差值的总和）
  let roughness = 0;
  const dx = [1, 0], dy = [0, 1];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = grid.cells[y][x];
      if (!cell) continue;
      for (let d = 0; d < 2; d++) {
        const nx = x + dx[d], ny = y + dy[d];
        if (nx < size && ny < size) {
          const neighbor = grid.cells[ny][nx];
          if (neighbor) {
            roughness += Math.abs(Math.log2(cell.value) - Math.log2(neighbor.value));
          }
        }
      }
    }
  }
  score -= roughness * 2;

  // 4. 合并潜力
  let merges = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = grid.cells[y][x];
      if (!cell) continue;
      for (let d = 0; d < 2; d++) {
        const nx = x + dx[d], ny = y + dy[d];
        if (nx < size && ny < size) {
          const neighbor = grid.cells[ny][nx];
          if (neighbor && neighbor.value === cell.value) merges++;
        }
      }
    }
  }
  score += merges * 5;

  return score;
}
