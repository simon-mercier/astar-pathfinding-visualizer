var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//CELL CLASS
var Cell = /** @class */ (function () {
    function Cell(x, y, text, color) {
        if (text === void 0) { text = ""; }
        if (color === void 0) { color = 'red'; }
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.x = x;
        this.y = y;
        this.color = color;
        this.id = '#' + pos2Id([this.x, this.y]);
        this.setColor();
        this.setText(text);
    }
    Cell.prototype.setColor = function () {
        $(this.id).velocity({
            backgroundColor: this.color
        }, 50);
    };
    Cell.prototype.setText = function (text) {
        if (text === void 0) { text = ""; }
        $(this.id).html(text);
    };
    return Cell;
}());
var NormalCell = /** @class */ (function (_super) {
    __extends(NormalCell, _super);
    function NormalCell(x, y, text) {
        if (text === void 0) { text = ""; }
        return _super.call(this, x, y, text, '#c5c5c5') || this;
    }
    return NormalCell;
}(Cell));
var WallCell = /** @class */ (function (_super) {
    __extends(WallCell, _super);
    function WallCell(x, y, text) {
        if (text === void 0) { text = ""; }
        return _super.call(this, x, y, text, '#707070') || this;
    }
    return WallCell;
}(Cell));
var StartCell = /** @class */ (function (_super) {
    __extends(StartCell, _super);
    function StartCell(x, y, text) {
        if (text === void 0) { text = ""; }
        return _super.call(this, x, y, text, '#E84650') || this;
    }
    return StartCell;
}(Cell));
var EndCell = /** @class */ (function (_super) {
    __extends(EndCell, _super);
    function EndCell(x, y, text) {
        if (text === void 0) { text = ""; }
        return _super.call(this, x, y, text, '#0094DB') || this;
    }
    return EndCell;
}(Cell));
var FillCell = /** @class */ (function (_super) {
    __extends(FillCell, _super);
    function FillCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FillCell;
}(Cell));
var PathCell = /** @class */ (function (_super) {
    __extends(PathCell, _super);
    function PathCell(x, y, text, color) {
        if (text === void 0) { text = ""; }
        if (color === void 0) { color = '#54c758'; }
        return _super.call(this, x, y, text, color) || this;
    }
    return PathCell;
}(Cell));
var QPath = /** @class */ (function (_super) {
    __extends(QPath, _super);
    function QPath(x, y, text) {
        if (text === void 0) { text = ""; }
        return _super.call(this, x, y, text, '#9ef25a') || this;
    }
    return QPath;
}(PathCell));
var FinalPath = /** @class */ (function (_super) {
    __extends(FinalPath, _super);
    function FinalPath(x, y, text) {
        if (text === void 0) { text = ""; }
        return _super.call(this, x, y, text, '#ff73a6') || this;
    }
    return FinalPath;
}(PathCell));
//main class
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["DOWN"] = 1] = "DOWN";
    Direction[Direction["LEFT"] = 2] = "LEFT";
    Direction[Direction["RIGHT"] = 3] = "RIGHT";
    Direction[Direction["UPLEFT"] = 4] = "UPLEFT";
    Direction[Direction["UPRIGHT"] = 5] = "UPRIGHT";
    Direction[Direction["DOWNLEFT"] = 6] = "DOWNLEFT";
    Direction[Direction["DOWNRIGHT"] = 7] = "DOWNRIGHT";
})(Direction || (Direction = {}));
/*Variables*/
var numCellsH = 25;
var numCellsW = 2 * numCellsH;
var cellArraySize = numCellsH * numCellsW;
var cells = new Array();
var cellStart = null;
var cellEnd = null;
// @ts-ignore
var selectedCellType = StartCell.name;
var isMouseDown = false;
var lastElemVisited;
/*Functions*/
jQuery(function () {
    $(".cell-type").on("click", function () {
        var cellType;
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
function changeSelectedCellType(cellType) {
    selectedCellType = cellType;
}
jQuery(function () {
    populateGrid();
});
function populateGrid() {
    for (var x = 0; x < numCellsW; x++) {
        var arrayColumn = [];
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
function clearAll() {
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
function id2Pos(id) {
    return [parseInt(id.substring(1, 3)), parseInt(id.substring(4, 6))];
}
function pos2Id(pos) {
    return "x" + formatedNumber(pos[0]) + "y" + formatedNumber(pos[1]);
}
function formatedNumber(n) {
    return n > 9 ? "" + n : "0" + n;
}
function fillRecursive(cell) {
    if (cell instanceof NormalCell || cell instanceof PathCell) {
        cells[cell.x][cell.y] = new WallCell(cell.x, cell.y);
        var successors = getSuccessors(cell, false);
        for (var _i = 0, successors_1 = successors; _i < successors_1.length; _i++) {
            var successor = successors_1[_i];
            fillRecursive(successor);
        }
    }
}
jQuery(function () {
    $(".cell").on("mouseover", function () { setCellType(this); });
});
function setCellType(elem) {
    if (isMouseDown && elem.className == "cell" && lastElemVisited != elem) {
        var pos = id2Pos(elem.id);
        var posX = pos[0], posY = pos[1];
        var cell = cells[posX][posY];
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
        }
        else if (cell instanceof EndCell) {
            if (cellEnd != null) {
                cells[cellEnd.x][cellEnd.y] = new NormalCell(cellEnd.x, cellEnd.y);
                clearPathFinding();
            }
            cellEnd = cell;
        }
        else {
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
function mouseDown(elem) {
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    isMouseDown = true;
    setCellType(elem);
}
jQuery(function () {
    $("*").on("mouseup", function () { mouseUp(); });
});
function mouseUp() {
    isMouseDown = false;
}
//aStar Class
var aStarPath = [];
var aStarSteps = [];
var AStarStep = /** @class */ (function () {
    function AStarStep(q, successors, final) {
        this.q = q;
        this.successors = successors;
        this.final = final;
    }
    return AStarStep;
}());
function getCell(cell, direction) {
    var cellPos = [];
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
function getSuccessors(currentCell, includeDiagonal) {
    if (includeDiagonal === void 0) { includeDiagonal = true; }
    var successors = [];
    var notDiagonalCost = 1;
    var diagonalCost = 1.4142;
    if (includeDiagonal) {
        var ul = getCell(currentCell, Direction.UPLEFT);
        if (ul != null) {
            ul.cost = diagonalCost;
            successors.push(ul);
        }
        var ur = getCell(currentCell, Direction.UPRIGHT);
        if (ur != null) {
            ur.cost = diagonalCost;
            successors.push(ur);
        }
        var dl = getCell(currentCell, Direction.DOWNLEFT);
        if (dl != null) {
            dl.cost = diagonalCost;
            successors.push(dl);
        }
        var dr = getCell(currentCell, Direction.DOWNRIGHT);
        if (dr != null) {
            dr.cost = diagonalCost;
            successors.push(dr);
        }
    }
    var up = getCell(currentCell, Direction.UP);
    if (up != null) {
        up.cost = notDiagonalCost;
        successors.push(up);
    }
    var l = getCell(currentCell, Direction.LEFT);
    if (l != null) {
        l.cost = notDiagonalCost;
        successors.push(l);
    }
    var r = getCell(currentCell, Direction.RIGHT);
    if (r != null) {
        r.cost = notDiagonalCost;
        successors.push(r);
    }
    var d = getCell(currentCell, Direction.DOWN);
    if (d != null) {
        d.cost = notDiagonalCost;
        successors.push(d);
    }
    return successors;
}
function validCell(pos) {
    return pos[0] >= 0 && pos[0] < numCellsW && pos[1] >= 0 && pos[1] < numCellsH;
}
var sliderSpeed = 5;
var sliderSpeedMult = 100;
$(document).on('input', '#speed-range', function () {
    sliderSpeed = $(this).val();
});
var tid;
var step = 0;
jQuery(function () {
    showPlay();
});
jQuery(function () {
    $("#play").on('click', playAStarPath);
});
jQuery(function () {
    $("#restart").on('click', resetAStar);
});
function playAStarPath() {
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
jQuery(function () {
    $("#pause").on("click", function () {
        abortTimer();
        showResume();
    });
});
jQuery(function () {
    $("#resume").on("click", function () {
        tid = setTimeout(executeAStarStep, 1 / sliderSpeed * sliderSpeedMult);
        showPause();
    });
});
function abortTimer() {
    clearTimeout(tid);
}
function showResume() {
    $("#resume-label").show();
    $("#pause-label").hide();
    $("#play-label").hide();
    $("#no-edit").show();
}
function showPlay() {
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
function executeAStarStep() {
    if (step >= aStarSteps.length) {
        showPlay();
        step = 0;
        return;
    }
    var currentStep = aStarSteps[step];
    if (currentStep.successors != null) {
        for (var _i = 0, _a = currentStep.successors; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell instanceof StartCell || cell instanceof EndCell || cell instanceof WallCell || cells[cell.x][cell.y] instanceof QPath || cells[cell.x][cell.y] instanceof PathCell)
                continue;
            cells[cell.x][cell.y] = new PathCell(cell.x, cell.y);
        }
    }
    if (currentStep.q != null && !(currentStep.q instanceof StartCell || currentStep.q instanceof EndCell || cells[currentStep.q.x][currentStep.q.y] instanceof QPath))
        cells[currentStep.q.x][currentStep.q.y] = new QPath(currentStep.q.x, currentStep.q.y);
    if (currentStep.final != null && cells[currentStep.final.x][currentStep.final.y] instanceof QPath)
        cells[currentStep.final.x][currentStep.final.y] = new FinalPath(currentStep.final.x, currentStep.final.y);
    step++;
    tid = setTimeout(executeAStarStep, 1 / sliderSpeed * sliderSpeedMult);
}
function resetAStar() {
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
function clearPathFinding() {
    abortTimer();
    for (var y = 0; y < numCellsH; y++) {
        for (var x = 0; x < numCellsW; x++) {
            var cell = cells[x][y];
            if (cell instanceof PathCell || cell instanceof QPath || cell instanceof FinalPath)
                cells[x][y] = new NormalCell(cell.x, cell.y);
        }
    }
    aStarPath = [];
    aStarSteps = [];
}
//following the pseudocode at: https://www.geeksforgeeks.org/a-search-algorithm/
function aStar(start, goal) {
    resetAStar();
    var openList = [start];
    var closedList = [];
    var _loop_1 = function () {
        var q;
        openList.forEach(function (openCell) {
            if (q == null || openCell.f < q.f) {
                q = openCell;
            }
        });
        var index = openList.indexOf(q, 0);
        if (index > -1) {
            openList.splice(index, 1);
        }
        closedList.push(q);
        var successors = getSuccessors(q);
        for (var _i = 0, successors_2 = successors; _i < successors_2.length; _i++) {
            var successor = successors_2[_i];
            if (closedList.indexOf(successor) > -1 || successor instanceof WallCell) {
                continue;
            }
            if (successor.id == goal.id) {
                aStarSteps.push(new AStarStep(q, successors, null));
                successor.parent = q;
                var current = successor;
                var path = [];
                while (current.parent) {
                    path.push(current);
                    current = current.parent;
                }
                path.forEach(function (cell) { return aStarSteps.push(new AStarStep(null, null, cell)); });
                return { value: path };
            }
            successorG = q.g + successor.cost;
            bestG = false;
            if (openList.indexOf(successor) == -1) {
                bestG = true;
                successor.h = heuristic(successor, cellEnd);
                openList.push(successor);
            }
            else if (successorG < successor.g) {
                bestG = true;
            }
            if (bestG) {
                successor.parent = q;
                successor.g = successorG;
                successor.f = successor.g + successor.h;
            }
        }
        aStarSteps.push(new AStarStep(q, successors, null));
    };
    var successorG, bestG;
    while (openList.length > 0) {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return [];
}
function heuristic(cell, end) {
    var d1 = Math.abs(cell.x - end.x);
    var d2 = Math.abs(cell.y - end.y);
    return d1 + d2;
}
