
export function getBestGreedyMove(game, scoreFn) {
  let bestDir = -1;
  let bestScore = -Infinity;

  for (let dir = 0; dir < 4; dir++) {
    const sim = new game.constructor(game.size);
    sim.grid = JSON.parse(JSON.stringify(game.grid));
    const moved = sim.move(dir);
    if (!moved) continue;
    const score = scoreFn(sim.grid);
    if (score > bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }

  return { bestDir, bestScore };
}
