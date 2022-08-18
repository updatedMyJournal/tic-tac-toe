//  X O 

let player1, player2;

const gameBoard = new class {
  constructor() {
    this.board = new Array(9);
  }

  setMark(mark, index) {
    this.board[index] = mark;
    document.querySelector(`.field[data-field-id="${index}"]`).textContent = mark;
  }

  reset() {
    for (let field of boardElem.querySelectorAll('.field')) {
      field.textContent = '';
    }

    this.board = new Array(9);
  }
}

const gameFlow = new class {
  #turn = 1;
  #winner;
  // possibly make private
  currentPlayer;

  startGame() {
    // CHANGE LATER
    player1 = new Player('X');
    player2 = new Player('O');
    gameFlow.currentPlayer = player1;
  }

  finishGame() {
    gameBoard.reset();
    this.#turn = 1;
    this.winner = null;
  }

  isItFirstTurn() {
    return this.#turn === 1;
  }

  nextTurn(player1, player2) {
    if (displayController.isGameOver()) {
      if (!this.winner) {
        alert(`It's a draw!`);
      } else {
        alert('The winner is: ' + this.winner.mark);
      }

      this.finishGame();

      return;
    }

    this.currentPlayer = this.currentPlayer === player1 ? player2 : player1;
    this.#turn++;
  }

  set winner(val) {
    this.#winner = val;
  }

  get winner() {
    return this.#winner;
  }
}

const displayController = new class {
  isMarkAllowed(elem) {
    return elem.textContent === '';
  }

  isGameOver() {
    let totalCounter = 0;
    let p1DiagonalCounter = 0;
    let p2DiagonalCounter = 0;
    
    for (let i = 0, k = 0; i < 3; i++) {
      let p1RowCounter = 0;
      let p1ColumnCounter = 0;
      let p2RowCounter = 0;
      let p2ColumnCounter = 0;

      //rows
      for (let j = 0; j < 3; j++, k++) {
        if (gameBoard.board[k]) totalCounter++;

        if (gameBoard.board[k] == player1.mark) {
          p1RowCounter++;
        } else if (gameBoard.board[k] == player2.mark) {
          p2RowCounter++;
        }
      }

      if (p1RowCounter >= 3) {
        gameFlow.winner = player1;

        return true;
      } else if (p2RowCounter >= 3) {
        gameFlow.winner = player2;

        return true;
      }

      //columns
      for (let j = i; j < 9; j += 3) {
        if (gameBoard.board[j] == player1.mark) {
          p1ColumnCounter++;
        } else if (gameBoard.board[j] == player2.mark) {
          p2ColumnCounter++;
        }
      }

      if (p1ColumnCounter >= 3) {
        gameFlow.winner = player1;

        return true;
      } else if (p2ColumnCounter >= 3) {
        gameFlow.winner = player2;

        return true;
      }
    }

    // diagonals
    for (let j = 0; j < 9; j += 4) {
      if (gameBoard.board[j] == player1.mark) {
        p1DiagonalCounter++;
      } else if (gameBoard.board[j] == player2.mark) {
        p2DiagonalCounter++;
      }

      if (p1DiagonalCounter >= 3) {
        gameFlow.winner = player1;

        return true;
      } else if (p2DiagonalCounter >= 3) {
        gameFlow.winner = player2

        return true;
      }
    }

    p1DiagonalCounter = 0;
    p2DiagonalCounter = 0;

    for (let j = 2; j <= 6; j += 2) {
      if (gameBoard.board[j] == player1.mark) {
        p1DiagonalCounter++;
      } else if (gameBoard.board[j] == player2.mark) {
        p2DiagonalCounter++;
      }

      if (p1DiagonalCounter >= 3) {
        gameFlow.winner = player1;

        return true;
      } else if (p2DiagonalCounter >= 3) {
        gameFlow.winner = player2;

        return true;
      }
    }

    // a draw
    if (totalCounter >= 9) return true;

    return false;
  }

}

class Player {
  constructor(mark) {
    this.mark = mark;
  }
}

const boardElem = document.querySelector('.gameboard');

boardElem.onclick = (e) => {
  const field = e.target.closest('.field');

  if (!field) return;

  if (gameFlow.isItFirstTurn()) gameFlow.startGame();

  if (!displayController.isMarkAllowed(field)) return;

  gameBoard.setMark(gameFlow.currentPlayer.mark, field.dataset.fieldId);

  // FIX LATER
  setTimeout(() => gameFlow.nextTurn(player1, player2));
};
