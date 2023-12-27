import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
} from "snabbdom";

import "./src/styles/style.scss";

let vnode;
let gameStatusNode;

const patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
]);
const rowSize = 6;
const colSize = 7;

function createMatrix(row, col) {
  const matrix = [];

  for (let i = 0; i < row; i++) {
    const row = [];
    for (let j = 0; j < col; j++) {
      row.push(new Cell({ index: `${i}-${j}`, selectedBy: null }));
    }
    matrix.push(row);
  }
  return matrix;
}

class Board {
  currentPlayer = "red";
  matrix = [];

  constructor(row, col, initPlayer) {
    this.currentPlayer = initPlayer;
    this.matrix = createMatrix(row, col);
    this.isGameOver = false;
  }

  gameOver() {
    this.isGameOver = true;
  }

  getWidth() {
    return colSize;
  }

  getHeight() {
    return rowSize;
  }

  switchCurrentPlayer = () => {
    if (this.currentPlayer === "red") {
      this.currentPlayer = "yellow";
    } else {
      this.currentPlayer = "red";
    }
  };

  getCell(row, col) {
    if (row < 0 || col < 0) throw new Error("invalid index");
    if (row > this.getHeight() - 1 || col > this.getWidth() - 1)
      throw new Error("invalid index");
    return this.matrix[row][col];
  }

  getSelectedCell(clickedCell) {
    let [clickedRow, col] = clickedCell.coordinates;
    let row = 0;
    while (row <= this.getHeight() - 1) {
      if (this.getCell(row, col).selectedBy) {
        if (row === 0) return this.getCell(row, col);
        return this.getCell(row - 1, col);
      }
      row++;
    }
    return this.getCell(row - 1, col);
  }
}

class Cell {
  constructor({ index, selectedBy }) {
    this.index = index;
    this.selectedBy = selectedBy;
  }

  get coordinates() {
    return this.index.split("-");
  }
  selectCell(currentPlayer) {
    this.selectedBy = currentPlayer;
  }
}

function areFourConnected(player, board) {
  const boardMatrix = board.matrix;
  // horizontalCheck
  for (let j = 0; j < board.getWidth() - 3; j++) {
    for (let i = 0; i < board.getHeight(); i++) {
      if (
        boardMatrix[i][j].selectedBy === player &&
        boardMatrix[i][j + 1].selectedBy === player &&
        boardMatrix[i][j + 2].selectedBy === player &&
        boardMatrix[i][j + 3].selectedBy === player
      ) {
        return true;
      }
    }
  }
  // verticalCheck
  for (let i = 0; i < board.getHeight() - 3; i++) {
    for (let j = 0; j < board.getWidth(); j++) {
      if (
        boardMatrix[i][j].selectedBy === player &&
        boardMatrix[i + 1][j].selectedBy === player &&
        boardMatrix[i + 2][j].selectedBy === player &&
        boardMatrix[i + 3][j].selectedBy === player
      ) {
        return true;
      }
    }
  }
  // ascendingDiagonalCheck
  for (let i = 3; i < board.getHeight(); i++) {
    for (let j = 0; j < board.getWidth() - 3; j++) {
      if (
        boardMatrix[i][j].selectedBy === player &&
        boardMatrix[i - 1][j + 1].selectedBy === player &&
        boardMatrix[i - 2][j + 2].selectedBy === player &&
        boardMatrix[i - 3][j + 3].selectedBy === player
      )
        return true;
    }
  }
  // descendingDiagonalCheck
  for (let i = 3; i < board.getHeight(); i++) {
    for (let j = 3; j < board.getWidth(); j++) {
      if (
        boardMatrix[i][j].selectedBy === player &&
        boardMatrix[i - 1][j - 1].selectedBy === player &&
        boardMatrix[i - 2][j - 2].selectedBy === player &&
        boardMatrix[i - 3][j - 3].selectedBy === player
      )
        return true;
    }
  }
  return false;
}

function generateMatrix(row, col) {
  return new Board(row, col, "red");
}

const redrawBoard = (board) => {
  vnode = patch(vnode, drawGrid(board));
};

function drawGrid(board) {
  const matrix = board.matrix;
  const renderedMatrix = [];
  for (let i = 0; i < matrix.length; i++) {
    const cols = matrix[i];
    const row = [];
    for (let j = 0; j < cols.length; j++) {
      const cell = cols[j];
      row.push(
        h(
          "div.grid-el",
          {
            style: {},
            hook: {
              insert: (node) => {},
            },
            class: {
              "cell-selected": !!cell.selectedBy,
              // red: cell.selectedBy === "red",
              // yellow: cell.selectedBy === "yellow",
            },
            on: {
              click: () => {
                if (board.isGameOver) return;
                const targetCell = board.getSelectedCell(cell);
                if (!!targetCell.selectedBy) return;
                targetCell.selectCell(board.currentPlayer);
                const hasPlayerWon = areFourConnected(
                  board.currentPlayer,
                  board,
                );
                hasPlayerWon && board.gameOver();
                patch(
                  gameStatusNode,
                  h(
                    "div",
                    `Won by ${hasPlayerWon ? board.currentPlayer : "None"}`,
                  ),
                );
                board.switchCurrentPlayer();
                redrawBoard(board);
              },
            },
          },
          [
            h("div.grid-el__shadow"),
            cell.selectedBy &&
              h("div.grid-el__inset", {
                class: {
                  bounce: true,
                  red: cell.selectedBy === "red",
                  yellow: cell.selectedBy === "yellow",
                },
              }),
          ],
        ),
      );
    }
    renderedMatrix.push(h("div.row", row));
  }

  return h("div", { props: { className: "grid-container" } }, renderedMatrix);
}

(() => {
  const container = document.getElementById("container");
  const matrix = generateMatrix(rowSize, colSize);
  vnode = drawGrid(matrix);
  gameStatusNode = h("div", "Won by: None");
  patch(container, h("main", [h("h1", "Connect 4"), vnode, gameStatusNode]));
})();
