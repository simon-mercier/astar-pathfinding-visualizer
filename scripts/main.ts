
//CELL CLASS
class Cell {
  public x: number;
  public y: number;

  public parent: Cell;

  public g: number = 0;
  public h: number = 0;
  public f: number = 0;

  public color: string;

  public cost: number;
  public id: string;

  constructor(x: number, y: number, text: string = "", color: string = 'red') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.id = '#' + pos2Id([this.x, this.y]);
    this.setColor();
    this.setText(text);
  }

  setColor(): void {
    $(this.id).velocity({
      backgroundColor: this.color,
    }, 50);

  }

  setText(text: string = ""): void {
    $(this.id).html(text);
  }
}

class NormalCell extends Cell {
  constructor(x: number, y: number, text: string = "") {
    super(x, y, text, '#c5c5c5');
  }
}

class WallCell extends Cell {
  constructor(x: number, y: number, text: string = "") {
    super(x, y, text, '#707070');
  }
}

class StartCell extends Cell {
  constructor(x: number, y: number, text: string = "") {
    super(x, y, text, '#E84650');
  }
}

class EndCell extends Cell {
  constructor(x: number, y: number, text: string = "") {
    super(x, y, text, '#0094DB');
  }
}

class FillCell extends Cell {
}

class PathCell extends Cell {
  constructor(x: number, y: number, text: string = "", color: string = '#54c758') {
    super(x, y, text, color);
  }
}

class QPath extends PathCell {
  constructor(x: number, y: number, text: string = "") {
    super(x, y, text, '#9ef25a');
  }
}

class FinalPath extends PathCell {
  constructor(x: number, y: number, text: string = "") {
    super(x, y, text, '#ff73a6');
  }
}

//main class

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  UPLEFT,
  UPRIGHT,
  DOWNLEFT,
  DOWNRIGHT,
}

/*Variables*/
const numCellsH: number = 25;
const numCellsW: number = 2 * numCellsH;
const cellArraySize: number = numCellsH * numCellsW;

var cells: Cell[][] = new Array();

var cellStart: Cell | null = null;
var cellEnd: Cell | null = null;

// @ts-ignore
var selectedCellType: string = StartCell.name;

var isMouseDown: boolean = false;

var lastElemVisited: HTMLElement | null;

/*Functions*/
jQuery(function () {
  $(".cell-type").on("click", function () {
    let cellType: string;
    switch (this.id) {
      case "start":
        // @ts-ignore
        cellType = StartCell.name;
        break;
      case "end":
        // @ts-ignore
        cellType = EndCell.name;
        break;
      case "wall":
        // @ts-ignore
        cellType = WallCell.name;
        break;
      case "erase":
        // @ts-ignore
        cellType = NormalCell.name;
        break;
      case "fill":
        // @ts-ignore
        cellType = FillCell.name;
        break;
    }
    changeSelectedCellType(cellType);
  });
});

function changeSelectedCellType(cellType: string): void {
  selectedCellType = cellType;
}

jQuery(function () {
  populateGrid();
});
function populateGrid(): void {
  for (var x = 0; x < numCellsW; x++) {
    let arrayColumn: Cell[] = [];
    for (var y = 0; y < numCellsH; y++) {
      arrayColumn.push(new NormalCell(x, y));
    }
    cells.push(arrayColumn);
  }
}

jQuery(function () {
  $("#clear").on("click", function () {
    clearAll();
  });
});
function clearAll(): void {
  resetAStar();
  showPlay();
  for (var y = 0; y < numCellsH; y++) {
    for (var x = 0; x < numCellsW; x++) {
      cells[x][y] = new NormalCell(x, y);
    }
  }

  cellStart = null;
  cellEnd = null;

  lastElemVisited = null;
}

function id2Pos(id: string): number[] {
  return [parseInt(id.substring(1, 3)), parseInt(id.substring(4, 6))];
}
function pos2Id(pos: number[]): string {
  return `x${formatedNumber(pos[0])}y${formatedNumber(pos[1])}`;
}

function formatedNumber(n: number) {
  return n > 9 ? "" + n : "0" + n;
}

function fillRecursive(cell: Cell) {
  if (cell instanceof NormalCell || cell instanceof PathCell) {
    cells[cell.x][cell.y] = new WallCell(cell.x, cell.y);

    let successors = getSuccessors(cell, false);
    for (let successor of successors) {
      fillRecursive(successor);
    }
  }
}

jQuery(function () {
  $(".cell").on("mouseover", function () { setCellType(this); });
});

function setCellType(elem: HTMLElement): void {
  if (isMouseDown && elem.className == "cell" && lastElemVisited != elem) {
    let pos = id2Pos(elem.id);
    let posX = pos[0], posY = pos[1];

    let cell: Cell = cells[posX][posY];
    switch (selectedCellType) {
      // @ts-ignore
      case FillCell.name:
        fillRecursive(cell);
        cells[posX][posY] = new WallCell(cell.x, cell.y);
        break;
      // @ts-ignore
      case StartCell.name:
        cells[posX][posY] = new StartCell(cell.x, cell.y);
        break;
      // @ts-ignore
      case EndCell.name:
        cells[posX][posY] = new EndCell(cell.x, cell.y);
        break;
      // @ts-ignore
      case WallCell.name:
        cells[posX][posY] = new WallCell(cell.x, cell.y);
        break;
      // @ts-ignore
      case NormalCell.name:
        cells[posX][posY] = new NormalCell(cell.x, cell.y);
        break;
    }
    cell = cells[posX][posY];

    if (cell instanceof StartCell) {
      //Make previous start cell normal
      if (cellStart != null) {
        cells[cellStart.x][cellStart.y] = new NormalCell(cellStart.x, cellStart.y);
        clearPathFinding();
      }
      //Assign new Start cell
      cellStart = cell;
    } else if (cell instanceof EndCell) {
      if (cellEnd != null) {
        cells[cellEnd.x][cellEnd.y] = new NormalCell(cellEnd.x, cellEnd.y);
        clearPathFinding();
      }
      cellEnd = cell;
    } else {
      if (cellStart == cell) {
        clearPathFinding();
        cellStart = null;
      }
      if (cellEnd == cell) {
        clearPathFinding();
        cellEnd = null;
      }
    }

    lastElemVisited = elem;
  }
}

jQuery(function () {
  $(".cell").on("mousedown", function () { mouseDown(this); });
});
function mouseDown(elem: HTMLElement): void {
  event.preventDefault ? event.preventDefault() : event.returnValue = false;
  isMouseDown = true;
  setCellType(elem);
}

jQuery(function () {
  $("*").on("mouseup", function () { mouseUp(); });
});
function mouseUp(): void {
  isMouseDown = false;
}

//aStar Class



var aStarPath: Cell[] = [];
var aStarSteps: AStarStep[] = [];

class AStarStep {
  public q: Cell | null;
  public successors: Cell[] | null;
  public final: Cell | null;

  constructor(q: Cell | null, successors: Cell[] | null, final: Cell | null) {
    this.q = q;
    this.successors = successors;
    this.final = final;
  }
}


function getCell(cell: Cell, direction: Direction): Cell {
  let cellPos: number[] = [];
  switch (direction) {
    case Direction.UP:
      cellPos = [cell.x, cell.y - 1];
      break;
    case Direction.UPLEFT:
      cellPos = [cell.x - 1, cell.y - 1];
      break;
    case Direction.UPRIGHT:
      cellPos = [cell.x + 1, cell.y - 1];
      break;
    case Direction.DOWN:
      cellPos = [cell.x, cell.y + 1];
      break;
    case Direction.DOWNLEFT:
      cellPos = [cell.x - 1, cell.y + 1];
      break;
    case Direction.DOWNRIGHT:
      cellPos = [cell.x + 1, cell.y + 1];
      break;
    case Direction.LEFT:
      cellPos = [cell.x - 1, cell.y];
      break;
    case Direction.RIGHT:
      cellPos = [cell.x + 1, cell.y];
      break;
  }

  return validCell(cellPos) ? cells[cellPos[0]][cellPos[1]] : null;
}

function getSuccessors(currentCell: Cell, includeDiagonal: boolean = true): Cell[] {
  let successors: Cell[] = [];
  const notDiagonalCost = 1;
  const diagonalCost = 1.4142;

  if (includeDiagonal) {
    let ul = getCell(currentCell, Direction.UPLEFT)
    if (ul != null) {
      ul.cost = diagonalCost;
      successors.push(ul);
    }

    let ur = getCell(currentCell, Direction.UPRIGHT)
    if (ur != null) {
      ur.cost = diagonalCost;
      successors.push(ur);
    }
    let dl = getCell(currentCell, Direction.DOWNLEFT)
    if (dl != null) {
      dl.cost = diagonalCost;
      successors.push(dl);
    }

    let dr = getCell(currentCell, Direction.DOWNRIGHT)
    if (dr != null) {
      dr.cost = diagonalCost;
      successors.push(dr);
    }
  }

  let up = getCell(currentCell, Direction.UP)
  if (up != null) {
    up.cost = notDiagonalCost;
    successors.push(up);
  }

  let l = getCell(currentCell, Direction.LEFT)
  if (l != null) {
    l.cost = notDiagonalCost;
    successors.push(l);
  }

  let r = getCell(currentCell, Direction.RIGHT)
  if (r != null) {
    r.cost = notDiagonalCost;
    successors.push(r);
  }

  let d = getCell(currentCell, Direction.DOWN)
  if (d != null) {
    d.cost = notDiagonalCost;
    successors.push(d);
  }
  return successors;
}

function validCell(pos: number[]): boolean {
  return pos[0] >= 0 && pos[0] < numCellsW && pos[1] >= 0 && pos[1] < numCellsH;
}

var sliderSpeed: any = 5;
var sliderSpeedMult = 100;

$(document).on('input', '#speed-range', function () {
  sliderSpeed = $(this).val();
});


var tid: number;
var step: number = 0;

jQuery(() => {
  showPlay();
});
    
jQuery(() => {
  $("#play").on('click', playAStarPath);
});

jQuery(() => {
  $("#restart").on('click', resetAStar);
});

function playAStarPath(): void {
  abortTimer();
  step = 0;
  if (aStarPath.length != 0 || aStarSteps.length != 0) {
    resetAStar();
  }
  executeAStar();
}

function executeAStar() {
  if (!$("#aStar").is(":checked")) {
    alert("No algorithms selected. Please make sure one is selected");
    return;
  }

  if (cellStart == null || cellEnd == null) {
    alert("No Start and/or End cell. Please make sure they are placed on the grid.");
    return;
  }

  aStarPath = aStar(cellStart, cellEnd);

  if (aStarPath.length == 0) {
    alert("No path connecting the Start and End cells");
    return;
  }

  showPause();

  tid = setTimeout(executeAStarStep, 1 / sliderSpeed * sliderSpeedMult);
}

jQuery(() => {
  $("#pause").on("click", () => {
    abortTimer(); 
    showResume();
  })
})

jQuery(() => {
  $("#resume").on("click", () => {
    tid = setTimeout(executeAStarStep, 1 / sliderSpeed * sliderSpeedMult);
    showPause();
  })
})

function abortTimer() {
  clearTimeout(tid);
}

function showResume(){
  $("#resume-label").show();
  $("#pause-label").hide();
  $("#play-label").hide();
  $("#no-edit").show();
}

function showPlay(){
  $("#resume-label").hide();
  $("#pause-label").hide();
  $("#play-label").show();
  $("#no-edit").hide();
}

function showPause() {
  $("#resume-label").hide();
  $("#pause-label").show();
  $("#play-label").hide();
  $("#no-edit").show();
}

function executeAStarStep(): void {
  if (step >= aStarSteps.length) {
    showPlay();
    step = 0;
    return;
  }

  let currentStep = aStarSteps[step];
  if (currentStep.successors != null) {
    for (let cell of currentStep.successors) {
      if (cell instanceof StartCell || cell instanceof EndCell || cell instanceof WallCell || cells[cell.x][cell.y] instanceof QPath || cells[cell.x][cell.y] instanceof PathCell)
        continue;
      cells[cell.x][cell.y] = new PathCell(cell.x, cell.y)
    }
  }

  if (currentStep.q != null && !(currentStep.q instanceof StartCell || currentStep.q instanceof EndCell || cells[currentStep.q.x][currentStep.q.y] instanceof QPath))
    cells[currentStep.q.x][currentStep.q.y] = new QPath(currentStep.q.x, currentStep.q.y);

  if (currentStep.final != null && cells[currentStep.final.x][currentStep.final.y] instanceof QPath)
    cells[currentStep.final.x][currentStep.final.y] = new FinalPath(currentStep.final.x, currentStep.final.y);

  step++;

  tid = setTimeout(executeAStarStep, 1 / sliderSpeed * sliderSpeedMult);
}

function resetAStar(): void {
  showPlay();
  step = 0;
  clearPathFinding();
  for (var y = 0; y < numCellsH; y++) {
    for (var x = 0; x < numCellsW; x++) {
      cells[x][y].parent = null;
      cells[x][y].g = 0;
      cells[x][y].h = 0;
      cells[x][y].f = 0;
      cells[x][y].cost = null;
    }
  }
}

function clearPathFinding(): void {
  abortTimer();
  for (var y = 0; y < numCellsH; y++) {
    for (var x = 0; x < numCellsW; x++) {
      let cell = cells[x][y];
      if (cell instanceof PathCell || cell instanceof QPath || cell instanceof FinalPath)
        cells[x][y] = new NormalCell(cell.x, cell.y);
    }
  }
  aStarPath = [];
  aStarSteps = [];
}
//following the pseudocode at: https://www.geeksforgeeks.org/a-search-algorithm/
function aStar(start: Cell, goal: Cell): Cell[] {
  resetAStar();

  let openList: Cell[] = [start];
  let closedList: Cell[] = [];

  while (openList.length > 0) {
    let q: Cell;
    openList.forEach((openCell: Cell) => {
      if (q == null || (openCell.f <= q.f && openCell.h < q.h)) {
          q = openCell;
        }
    });

    const index: number = openList.indexOf(q, 0);
    if (index > -1) {
      openList.splice(index, 1);
    }
    closedList.push(q);

    let successors: Cell[] = getSuccessors(q);

    for (let successor of successors) {

      if (closedList.indexOf(successor) > -1 || successor instanceof WallCell) {
        continue;
      }

      if (successor.id == goal.id) {
        aStarSteps.push(new AStarStep(q, successors, null));
        successor.parent = q;
        let current: Cell = successor;
        let path: Cell[] = [];
        while (current.parent) {
          path.push(current);
          current = current.parent;
        }
        path.forEach((cell) => aStarSteps.push(new AStarStep(null, null, cell)));
        return path;
      }

      var successorG = q.g + successor.cost;
      var bestG = false;

      if (openList.indexOf(successor) == -1) {
        bestG = true;
        successor.h = heuristic(successor, cellEnd);
        openList.push(successor);
      }
      else if (successorG < successor.g) {
        bestG = true;
      }

      if (bestG) {
        successor.parent = q
        successor.g = successorG;
        successor.f = successor.g + successor.h;
      }
    }

    aStarSteps.push(new AStarStep(q, successors, null));
  }

  return [];
}

function heuristic(cell: Cell, end: Cell) {
  var d1 = Math.abs(cell.x - end.x);
  var d2 = Math.abs(cell.y - end.y);
  return d1 + d2;
}

