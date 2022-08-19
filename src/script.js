let mainPlayer, secondPlayer;

const gameBoard = new class {
  #overlayElem = document.querySelector('.overlay');
  #overlayMessageElem = document.querySelector('.message'); 

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

  showOverlay() {
    this.#overlayElem.style.visibility = 'visible';
    this.#overlayElem.onclick = gameFlow.finishGame;
  }

  hideOverlay() {
    this.#overlayElem.style.visibility = '';
    this.#overlayElem.onclick = null;
  }

  setOverlayMessage(str) {
    this.#overlayMessageElem.textContent = str;
  }
}

const gameFlow = new class {
  #turn = 1;
  #winner;
  currentPlayer;

  #playerWrapperElem = document.querySelector('.player-wrapper');

  selectPlayer(mark) {
    mainPlayer = new Player(mark);
    secondPlayer = mainPlayer.mark === 'X' ? new Player('O') : new Player('X');
    this.currentPlayer = mainPlayer;
  }

  startGame() {
    const selectedPlayer = this.#playerWrapperElem.querySelector('.selected');
    // create a function
    const mark = selectedPlayer.className.includes('X') ? 'X' : 'O';

    this.selectPlayer(mark);
    gameFlow.currentPlayer = mainPlayer;

    this.#playerWrapperElem.onclick = null;
  }

  finishGame = () => {
    gameBoard.reset();
    this.#turn = 1;
    this.winner = null;
    this.#playerWrapperElem.onclick = displayController.onPlayerElemClick;

    gameBoard.hideOverlay();
    gameBoard.setOverlayMessage('');
    mainPlayer = null;
    secondPlayer = null;
  }

  isItFirstTurn() {
    return this.#turn === 1;
  }

  nextTurn(mainPlayer, secondPlayer) {
    if (displayController.isGameOver()) {
      gameBoard.showOverlay();

      if (!this.winner) {
        gameBoard.setOverlayMessage(`It's a draw!`);
      } else {
        gameBoard.setOverlayMessage(`The winner is: ${this.winner.mark}`);
      }

      return;
    }

    this.currentPlayer = this.currentPlayer === mainPlayer ? secondPlayer : mainPlayer;
    this.currentPlayer.toggleBacklight();

    // consider changing to boolean
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

        if (gameBoard.board[k] == mainPlayer.mark) {
          p1RowCounter++;
        } else if (gameBoard.board[k] == secondPlayer.mark) {
          p2RowCounter++;
        }
      }

      if (p1RowCounter >= 3) {
        gameFlow.winner = mainPlayer;

        return true;
      } else if (p2RowCounter >= 3) {
        gameFlow.winner = secondPlayer;

        return true;
      }

      //columns
      for (let j = i; j < 9; j += 3) {
        if (gameBoard.board[j] == mainPlayer.mark) {
          p1ColumnCounter++;
        } else if (gameBoard.board[j] == secondPlayer.mark) {
          p2ColumnCounter++;
        }
      }

      if (p1ColumnCounter >= 3) {
        gameFlow.winner = mainPlayer;

        return true;
      } else if (p2ColumnCounter >= 3) {
        gameFlow.winner = secondPlayer;

        return true;
      }
    }

    // diagonals
    for (let j = 0; j < 9; j += 4) {
      if (gameBoard.board[j] == mainPlayer.mark) {
        p1DiagonalCounter++;
      } else if (gameBoard.board[j] == secondPlayer.mark) {
        p2DiagonalCounter++;
      }

      if (p1DiagonalCounter >= 3) {
        gameFlow.winner = mainPlayer;

        return true;
      } else if (p2DiagonalCounter >= 3) {
        gameFlow.winner = secondPlayer

        return true;
      }
    }

    p1DiagonalCounter = 0;
    p2DiagonalCounter = 0;

    for (let j = 2; j <= 6; j += 2) {
      if (gameBoard.board[j] == mainPlayer.mark) {
        p1DiagonalCounter++;
      } else if (gameBoard.board[j] == secondPlayer.mark) {
        p2DiagonalCounter++;
      }

      if (p1DiagonalCounter >= 3) {
        gameFlow.winner = mainPlayer;

        return true;
      } else if (p2DiagonalCounter >= 3) {
        gameFlow.winner = secondPlayer;

        return true;
      }
    }

    // a draw
    if (totalCounter >= 9) return true;

    return false;
  }

  onPlayerElemClick(e) {
    let clickedPlayerElem = e.target.closest('.X-player, .O-player');

    if (!clickedPlayerElem) return;

    const mark = clickedPlayerElem.className.includes('X') ? 'X' : 'O';

    gameFlow.selectPlayer(mark);
    mainPlayer.toggleBacklight();
  }

}

class Player {
  #xPlayerElem = document.querySelector('.X-player');
  #oPlayerElem = document.querySelector('.O-player');

  constructor(mark) {
    this.mark = mark;
  }

  // change to static?
  toggleBacklight() {
    this.#xPlayerElem.classList.remove('selected');
    this.#oPlayerElem.classList.remove('selected');
    document.querySelector(`.${this.mark}-player`).classList.add('selected');
  }
}

// move to another place
const boardElem = document.querySelector('.gameboard');

const playerWrapperElem = document.querySelector('.player-wrapper');

playerWrapperElem.onclick = displayController.onPlayerElemClick;

boardElem.onclick = (e) => {
  const field = e.target.closest('.field');

  if (!field) return;

  if (gameFlow.isItFirstTurn()) gameFlow.startGame();

  if (!displayController.isMarkAllowed(field)) return;

  gameBoard.setMark(gameFlow.currentPlayer.mark, field.dataset.fieldId);

  // FIX LATER
  setTimeout(() => gameFlow.nextTurn(mainPlayer, secondPlayer));
};
