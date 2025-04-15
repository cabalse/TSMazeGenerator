import { useEffect, useState } from "react";

const MAZE_SQUARE = "w-4 h-4";

type MazeCell = {
  id: string;
  set: number;
  rightWall: boolean;
  bottomWall: boolean;
};

function addWall(): boolean {
  const rnd = Math.floor(Math.random() * 10) + 1;
  return rnd > 5;
}

function getCellToRight(row: MazeCell[], cell: MazeCell): MazeCell | null {
  for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
    const mazeCell = row[columnIndex];
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
  const row = [];
  for (let index = 0; index < columns; index++) {
    const id = String(rowNr) + index;
    const cell = { id, set: set++, rightWall: false, bottomWall: false };
    row.push(cell);
  }
  return [row, set];
}

function copyRow(row: MazeCell[], rowNr: number): MazeCell[] {
  const ret: MazeCell[] = [];
  let id = 0;
  row.forEach((cell) => {
    const obj: MazeCell = {
      id: `${rowNr}${id++}`,
      set: cell.set,
      rightWall: cell.rightWall,
      bottomWall: cell.bottomWall,
    };

    ret.push(obj);
  });

  return ret;
}

function addRightWallsToRowCells(row: MazeCell[]): void {
  row.forEach((currentCell) => {
    const cellToTheRight = getCellToRight(row, currentCell);
    if (!cellToTheRight) {
      // no cell to the right
    } else {
      if (cellToTheRight.set === currentCell.set) {
        currentCell.rightWall = true;
      } else {
        const add = addWall();
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
    const numberInSet = numberOfCellsForSet(row, currentCell.set);
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

function generateMaze(rows: number, columns: number): MazeCell[][] {
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

const App = () => {
  const [maze, setMaze] = useState<MazeCell[][]>([]);

  useEffect(() => {
    const mazeStructure = generateMaze(20, 20);
    setMaze(mazeStructure);
  }, []);

  return (
    <>
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="p-6 text-white bg-slate-600 rounded-lg shadow-lg">
          <div className="text-center">MAZE Generator</div>
          <div className="italic text-center">Eller's Algorithm</div>
          <div className="mt-4">
            <div className="flex flex-col">
              {maze.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-row">
                  {row.map((mazeElement) => (
                    <div
                      className={`${MAZE_SQUARE} ${
                        mazeElement.rightWall ? "border-r-2" : ""
                      } ${mazeElement.bottomWall ? "border-b-2" : ""}`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
