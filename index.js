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
      row.push(new Cell({index: `${i}-${j}`, selectedBy: null}));
    }
    matrix.push(row);
  }
  return matrix;
}

class Board {
  currentPlayer = 'red';
  matrix = [];

  constructor(row, col, initPlayer) {
    this.currentPlayer = initPlayer;
    this.matrix = createMatrix(row, col);
  }


  getWidth() {
    return colSize - 1;
  }


  getHeight() {
    return rowSize - 1;
  }

  switchCurrentPlayer = () => {
    if (this.currentPlayer === 'red') {
      this.currentPlayer = 'blue';
    } else {
      this.currentPlayer = 'red';
    }
  }
}

class Cell {
  constructor({index, selectedBy}) {
    this.index = index;
    this.selectedBy = selectedBy;
  }

  selectCell(currentPlayer) {
    this.selectedBy = currentPlayer;
  }
}


function areFourConnected(player, board) {
  const boardMatrix = board.matrix;
  // horizontalCheck 
  for (let j = 0; j < board.getHeight() - 3; j++) {
    for (let i = 0; i < board.getWidth(); i++) {
      if (boardMatrix[i][j].selectedBy === player && boardMatrix[i][j + 1].selectedBy === player && boardMatrix[i][j + 2].selectedBy === player && boardMatrix[i][j + 3].selectedBy === player) {
        return true;
      }
    }
  }
  // verticalCheck
  for (let i = 0; i < board.getWidth() - 3; i++) {
    for (let j = 0; j < board.getHeight(); j++) {
      if (boardMatrix[i][j].selectedBy === player && boardMatrix[i + 1][j].selectedBy === player && boardMatrix[i + 2][j].selectedBy === player && boardMatrix[i + 3][j].selectedBy === player) {
        return true;
      }
    }
  }
  // ascendingDiagonalCheck 
  for (let i = 3; i < board.getWidth(); i++) {
    for (let j = 0; j < board.getHeight() - 3; j++) {
      if (boardMatrix[i][j].selectedBy === player && boardMatrix[i - 1][j + 1].selectedBy === player && boardMatrix[i - 2][j + 2].selectedBy === player && boardMatrix[i - 3][j + 3].selectedBy === player)
        return true;
    }
  }
  // descendingDiagonalCheck
  for (let i = 3; i < board.getWidth(); i++) {
    for (let j = 3; j < board.getHeight(); j++) {
      if (boardMatrix[i][j].selectedBy === player && boardMatrix[i - 1][j - 1].selectedBy === player && boardMatrix[i - 2][j - 2].selectedBy === player && boardMatrix[i - 3][j - 3].selectedBy === player)
        return true;
    }
  }
  return false;
}


function generateMatrix(row, col) {
  return new Board(row, col, 'red');

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
            class: {
              "cell-selected": !!cell.selectedBy,
              'red': cell.selectedBy === 'red',
              'blue': cell.selectedBy === 'blue',
            },
            on: {
              click: () => {
                console.log('el clicked');
                if (!!cell.selectedBy) return;
                console.log('selecting el');
                cell.selectCell(board.currentPlayer);
                const hasPlayerWon = areFourConnected(board.currentPlayer, board);
                patch(gameStatusNode, h('div', `Won by ${hasPlayerWon ? board.currentPlayer : 'None'}`))
                board.switchCurrentPlayer();
                redrawBoard(board);

              },
            },
          },
          `el-${i}#${j}`,
        ),
      );
    }
    renderedMatrix.push(h("div.row", row));
  }

  return h("div", {props: {className: "grid-container"}}, renderedMatrix);
}

(() => {
  const container = document.getElementById("container");
  const matrix = generateMatrix(rowSize, colSize);
  vnode = drawGrid(matrix);
  gameStatusNode = h('div', "Won by: None");
  patch(
    container,
    h(
      "main",
      {
        style: {
          fontFamily: "sans",
        },
      },
      [h("h1", "Connect 4"), vnode, gameStatusNode,
      ],
    ),
  );
})();
