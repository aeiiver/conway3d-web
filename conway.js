// -----------------------------------------------------
// https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
// -----------------------------------------------------
// 1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
// 2. Any live cell with two or three live neighbors lives on to the next generation.
// 3. Any live cell with more than three live neighbors dies, as if by overpopulation.
// 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
// -----------------------------------------------------

/**
 * @typedef ConwayCell
 * @type {('alive' | 'dead')}
 */

/**
 * @typedef Conway
 * @type {object}
 * @property {number} width
 * @property {number} height
 * @property {number} depth
 * @property {ConwayCell[][][]} grid
 * @property {ConwayCell[][][]} gridBuf
 */

/**
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 * @returns {Conway}
 */
function init(width, height, depth) {
  return {
    width: width,
    height: height,
    depth: depth,

    grid: new Array(depth).fill(0).map(
      _z => new Array(height).fill(0).map(
        _y => new Array(width).fill(0).map(
          _x => 'dead'
        )
      )
    ),

    gridBuf: new Array(depth).fill(0).map(
      _z => new Array(height).fill(0).map(
        _y => new Array(width).fill(0).map(
          _x => 'dead'
        )
      )
    )
  };
}

/**
 * @param {Conway} con
 * @param {number} rate
 */
function populate(con, rate) {
  for (let z = 0; z < con.depth; z += 1) {
    for (let y = 0; y < con.height; y += 1) {
      for (let x = 0; x < con.width; x += 1) {
        con.grid[z][y][x] = Math.random() < rate ? 'alive' : 'dead';
        con.gridBuf[z][y][x] = con.grid[z][y][x];
      }
    }
  }
}

/**
 * @param {Conway} con
 */
function next(con) {
  for (let z = 0; z < con.depth; z += 1) {
    for (let y = 0; y < con.height; y += 1) {
      for (let x = 0; x < con.width; x += 1) {
        let liveNeighbors = 0;

        outer:
        for (let nz = z - 1; nz <= z + 1; nz += 1) {
          for (let ny = y - 1; ny <= y + 1; ny += 1) {
            for (let nx = x - 1; nx <= x + 1; nx += 1) {
              if (nz < 0 || nz >= con.depth)
                continue;
              if (ny < 0 || ny >= con.height)
                continue;
              if (nx < 0 || nx >= con.width)
                continue;

              if (nz === z && ny === y && nx === x)
                continue;

              if (con.grid[nz][ny][nx] === 'alive')
                liveNeighbors += 1;
              if (liveNeighbors > 3)
                break outer;
            }
          }
        }

        if (con.grid[z][y][x] === 'alive') {
          if (liveNeighbors < 2 || liveNeighbors > 3)
            con.gridBuf[z][y][x] = 'dead';
        } else {
          if (liveNeighbors === 3)
            con.gridBuf[z][y][x] = 'alive';
        }
      }
    }
  }

  for (let z = 0; z < con.depth; z += 1) {
    for (let y = 0; y < con.height; y += 1) {
      for (let x = 0; x < con.width; x += 1) {
        con.grid[z][y][x] = con.gridBuf[z][y][x];
      }
    }
  }
}

/**
 * @param {Conway} con
 */
function reset(con) {
  for (let z = 0; z < con.depth; z += 1) {
    for (let y = 0; y < con.height; y += 1) {
      for (let x = 0; x < con.width; x += 1) {
        con.grid[z][y][x] = 'dead';
        con.gridBuf[z][y][x] = con.grid[z][y][x];
      }
    }
  }
}

export default { init, populate, next, reset }
