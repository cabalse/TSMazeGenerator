import { MazeCell, generateMaze } from "./mazeGenerator";

function app() {
  let maze = generateMaze(20, 20);
  let root = document.getElementById("root");

  maze.forEach((row) => {
    let rowElem = document.createElement("div");
    rowElem.className = "row";
    row.forEach((cell) => {
      let cellElem = document.createElement("div");
      let classes = "cell ";
      if (cell.rightWall) classes += "rightWall ";
      if (cell.bottomWall) classes += "bottomWall ";
      cellElem.className = classes;
      //cellElem.textContent = String(cell.set);
      rowElem.appendChild(cellElem);
    });
    root?.appendChild(rowElem);
  });
}

app();
