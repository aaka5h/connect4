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

class Board {
  currentPlayer = 'red';
  constructor(row, col, initPlayer) {
    this.currentPlayer = initPlayer;
  }
}

class Cell {
  constructor() {
  }
}

let currentPlayer = "red";
const switchCurrentPlayer = () => {
  if (currentPlayer === 'red') {
    currentPlayer = 'blue';
  } else {
    currentPlayer = 'red';
  }
}

function selectCell(cell) {
  cell.selectedBy = currentPlayer;
}

function getWidth() {
  return colSize - 1;
}


function getHeight() {
  return rowSize - 1;
}
function areFourConnected(player, board) {
  // horizontalCheck 
  for (let j = 0; j<getHeight()-3 ; j++ ){
    for (let i = 0; i<getWidth(); i++){
      if (board[i][j].selectedBy === player && board[i][j+1].selectedBy === player && board[i][j+2].selectedBy === player && board[i][j+3].selectedBy === player){
        return true;
      }
    }
  }
  // verticalCheck
  for (let i = 0; i<getWidth()-3 ; i++ ){
    for (let j = 0; j<getHeight(); j++){
      if (board[i][j].selectedBy === player && board[i+1][j].selectedBy === player && board[i+2][j].selectedBy === player && board[i+3][j].selectedBy === player){
        return true;
      }
    }
  }
  // ascendingDiagonalCheck 
  for (let i=3; i<getWidth(); i++){
    for (let j=0; j<getHeight()-3; j++){
      if (board[i][j].selectedBy === player && board[i-1][j+1].selectedBy === player && board[i-2][j+2].selectedBy === player && board[i-3][j+3].selectedBy=== player)
        return true;
    }
  }
  // descendingDiagonalCheck
  for (let i=3; i<getWidth(); i++){
    for (let j=3; j<getHeight(); j++){
      if (board[i][j].selectedBy === player && board[i-1][j-1].selectedBy === player && board[i-2][j-2].selectedBy === player && board[i-3][j-3].selectedBy === player)
        return true;
    }
  }
  return false;
}


function generateMatrix(row, col) {
  const matrix = [];

  for (let i = 0; i < row; i++) {
    const row = [];
    for (let j = 0; j < col; j++) {
      row.push({index: `${i}-${j}`, selected: false, selectedBy: null});
    }
    matrix.push(row);
  }
  return matrix;
}


const redrawBoard = (matrix) => {
  console.log(matrix);
  vnode = patch(vnode, drawGrid(matrix));
};

function drawGrid(matrix) {
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
                  selectCell(cell);
                  const hasPlayerWon = areFourConnected(currentPlayer, matrix);
                  patch(gameStatusNode, h('div', `Won by ${hasPlayerWon? currentPlayer: 'None'}`))
                  switchCurrentPlayer();
                redrawBoard(matrix);

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
