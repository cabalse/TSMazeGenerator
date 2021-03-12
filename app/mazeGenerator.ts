export class MazeCell {
  constructor(
    public id: string,
    public set: number,
    public rightWall: boolean = false,
    public bottomWall: boolean = false
  ) {}
}

function addWall(): boolean {
  let rnd = Math.floor(Math.random() * 10) + 1;
  return rnd > 5;
}

function getCellToRight(row: MazeCell[], cell: MazeCell): MazeCell | null {
  for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
    let mazeCell = row[columnIndex];
    if (mazeCell.id === cell.id) {
      if (columnIndex === row.length) {
        return null;
      } else {
        return row[columnIndex + 1];
      }
    }
  }
  return null;
}

function unionSets(
  row: MazeCell[],
  setTarget: number,
  setToChange: number
): void {
  row.forEach((cell) => {
    if (cell.set === setToChange) cell.set = setTarget;
  });
}

function numberOfCellsForSet(row: MazeCell[], set: number): number {
  let count = 0;
  row.forEach((cell) => {
    if (cell.set === set) count++;
  });
  return count;
}

function anyOtherCellWithoutBottomWallInSet(
  row: MazeCell[],
  targetCell: MazeCell
): boolean {
  let ret = false;
  row.forEach((cell) => {
    if (
      cell.set === targetCell.set &&
      cell.id != targetCell.id &&
      !cell.bottomWall
    )
      ret = true;
  });
  return ret;
}

function addRowToMaze(
  maze: MazeCell[][],
  rowNr: number,
  columns: number,
  unUsedSet: number
): [MazeCell[][], number] {
  let set = unUsedSet;
  let row: MazeCell[];

  if (maze.length < 1) {
    [row, set] = createEmptyRow(columns, rowNr, set);
  } else {
    row = copyRow(maze[rowNr - 1], rowNr);
    removeBottomWalledCellsFromSetAndClearBottomWall(row);
    clearRightWalls(row);
    set = addsCellsToUniqueSets(row, set);
  }
  maze.push(row);

  return [maze, set];
}

function addsCellsToUniqueSets(row: MazeCell[], set: number): number {
  let setNumber = set;
  row.forEach((cell) => {
    if (cell.set === 0) cell.set = setNumber++;
  });
  return setNumber;
}

function removeBottomWalledCellsFromSetAndClearBottomWall(
  row: MazeCell[]
): void {
  row.forEach((cell) => {
    if (cell.bottomWall) {
      cell.set = 0;
      cell.bottomWall = false;
    }
  });
}

function clearRightWalls(row: MazeCell[]): void {
  row.forEach((cell) => (cell.rightWall = false));
}

function createEmptyRow(
  columns: number,
  rowNr: number,
  unUsedSet: number
): [MazeCell[], number] {
  let set = unUsedSet;
  let row = [];
  for (let index = 0; index < columns; index++) {
    let id = String(rowNr) + index;
    let cell = new MazeCell(id, set++, false);
    row.push(cell);
  }
  return [row, set];
}

function copyRow(row: MazeCell[], rowNr: number): MazeCell[] {
  let ret: MazeCell[] = [];
  let id = 0;
  row.forEach((cell) => {
    ret.push(
      new MazeCell(
        String(rowNr) + id++,
        cell.set,
        cell.rightWall,
        cell.bottomWall
      )
    );
  });
  return ret;
}

function addRightWallsToRowCells(row: MazeCell[]): void {
  row.forEach((currentCell) => {
    let cellToTheRight = getCellToRight(row, currentCell);
    if (!cellToTheRight) {
      // no cell to the right
    } else {
      if (cellToTheRight.set === currentCell.set) {
        currentCell.rightWall = true;
      } else {
        let add = addWall();
        if (add) {
          currentCell.rightWall = true;
        } else {
          unionSets(row, currentCell.set, cellToTheRight.set);
        }
      }
    }
  });
}

function addBottomWallsToRowCells(row: MazeCell[]): void {
  row.forEach((currentCell) => {
    let numberInSet = numberOfCellsForSet(row, currentCell.set);
    if (numberInSet > 1) {
      if (anyOtherCellWithoutBottomWallInSet(row, currentCell)) {
        if (addWall()) currentCell.bottomWall = true;
      }
    }
  });
}

function allCellsInTheSameSet(row: MazeCell[]): boolean {
  let same = true;
  row.forEach((cell, index) => {
    if (index < row.length - 1)
      if (cell.set != row[index + 1].set) same = false;
  });
  return same;
}

function removeWallsBetweenDifferentSetsAndUnion(row: MazeCell[]): void {
  row.forEach((cell, index) => {
    if (index < row.length - 1)
      if (cell.set != row[index + 1].set) {
        cell.rightWall = false;
        row[index + 1].set = cell.set;
      }
  });
}

export function generateMaze(rows: number, columns: number): MazeCell[][] {
  let maze: MazeCell[][] = [];
  let unUsedSet = 1;

  for (let row = 0; row < rows; row++) {
    [maze, unUsedSet] = addRowToMaze(maze, row, columns, unUsedSet);
    addRightWallsToRowCells(maze[row]);
    addBottomWallsToRowCells(maze[row]);
    if (row === rows - 1) {
      while (!allCellsInTheSameSet(maze[row])) {
        removeWallsBetweenDifferentSetsAndUnion(maze[row]);
      }
    }
  }

  return maze;
}
