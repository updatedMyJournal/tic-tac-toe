const gameBoard = new class {
  #boardElem = document.querySelector('.gameboard');

  constructor() {
    this.board = new Array(9);

    this.#boardElem.onclick = (e) => {
      const field = e.target.closest('.field');
    
      if (!field) return;
    
      if (gameFlow.isItFirstTurn) gameFlow.startGame();
    
      if (!displayController.isMarkAllowed(field)) return;
    
      this.#setMark(field.dataset.fieldId);
      setTimeout(() => gameFlow.nextTurn());
    };
  }

  #setMark(index) {
    const mark = gameFlow.currentPlayer.mark;

    this.board[index] = mark;
    document.querySelector(`.field[data-field-id="${index}"]`).textContent = mark;
  }

  reset() {
    for (let field of this.#boardElem.querySelectorAll('.field')) {
      field.textContent = '';
    }

    this.board = new Array(9);
  }
}

const gameFlow = new class {
  #playerWrapperElem = document.querySelector('.player-wrapper');
  #mainPlayerElem = document.querySelector('.selectedByPlayer');

  mainPlayer;
  secondPlayer;
  currentPlayer;
  winner;

  isItFirstTurn = true;

  constructor() {
    this.#playerWrapperElem.onclick = this.onPlayerElemClick.bind(this);
  }

  selectMainPlayer(mark) {
    this.mainPlayer = new Player(mark);
    this.currentPlayer = this.mainPlayer;
    this.#selectSecondPlayer();
  }

  #selectSecondPlayer() {
    this.secondPlayer = this.mainPlayer.mark === 'X' ? new Player('O') : new Player('X');
  }

  startGame() {
    if (!this.mainPlayer) {
      const mark = this.#getMarkFromElem(this.#mainPlayerElem);
      
      this.selectMainPlayer(mark);
    }

    this.currentPlayer = this.mainPlayer;
    this.#playerWrapperElem.onclick = null;
    this.isItFirstTurn = false;
  }

  finishGame() {
    gameBoard.reset();
    this.winner = null;
    this.#playerWrapperElem.onclick = this.onPlayerElemClick.bind(this);
    this.isItFirstTurn = true;

    this.mainPlayer.toggleBacklight();
    displayController.hideOverlay();
    displayController.setOverlayMessage('');

    this.mainPlayer = null;
    this.secondPlayer = null;
  }

  nextTurn() {
    if (displayController.isGameOver()) {
      displayController.showOverlay();

      if (!this.winner) {
        displayController.setOverlayMessage(`It's a draw!`);
      } else {
        displayController.incrementPlayerScore(this.winner);
        displayController.refreshPlayerScore(this.winner);
        displayController.setOverlayMessage(`The winner is: ${this.winner.mark}`);
      }

      return;
    }

    this.currentPlayer = this.currentPlayer === this.mainPlayer ? this.secondPlayer : this.mainPlayer;
    this.currentPlayer.toggleBacklight();
  }

  onPlayerElemClick(e) {
    let clickedPlayerElem = e.target.closest('.X-player, .O-player');

    if (!clickedPlayerElem) return;
    
    const mark = this.#getMarkFromElem(clickedPlayerElem);

    this.selectMainPlayer(mark);
    this.#mainPlayerElem = clickedPlayerElem;
    this.mainPlayer.toggleBacklight();
  }

  #getMarkFromElem(elem) {
    return elem.className.includes('X') ? 'X' : 'O';
  }
}

const displayController = new class {
  #overlayElem = document.querySelector('.overlay');
  #overlayMessageElem = this.#overlayElem.querySelector('.message');
  #XPlayerScore = 0;
  #OPlayerScore = 0;

  incrementPlayerScore(player) {
    if (player.mark === 'X') {
      this.#XPlayerScore++;
    } else {
      this.#OPlayerScore++;
    }
  }

  refreshPlayerScore(player) {
    let mark = player.mark;
    let playerScoreElem = document.querySelector(`.${mark}-player .score`);

    playerScoreElem.textContent = mark === 'X' ? this.#XPlayerScore : this.#OPlayerScore;
  }

  showOverlay() {
    this.#overlayElem.style.visibility = 'visible';
    this.#overlayElem.onclick = gameFlow.finishGame.bind(gameFlow);
  }

  hideOverlay() {
    this.#overlayElem.style.visibility = '';
    this.#overlayElem.onclick = null;
  }

  setOverlayMessage(str) {
    this.#overlayMessageElem.textContent = str;
  }

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

        if (gameBoard.board[k] == gameFlow.mainPlayer.mark) {
          p1RowCounter++;
        } else if (gameBoard.board[k] == gameFlow.secondPlayer.mark) {
          p2RowCounter++;
        }
      }

      if (p1RowCounter >= 3) {
        gameFlow.winner = gameFlow.mainPlayer;

        return true;
      } else if (p2RowCounter >= 3) {
        gameFlow.winner = gameFlow.secondPlayer;

        return true;
      }

      //columns
      for (let j = i; j < 9; j += 3) {
        if (gameBoard.board[j] == gameFlow.mainPlayer.mark) {
          p1ColumnCounter++;
        } else if (gameBoard.board[j] == gameFlow.secondPlayer.mark) {
          p2ColumnCounter++;
        }
      }

      if (p1ColumnCounter >= 3) {
        gameFlow.winner = gameFlow.mainPlayer;

        return true;
      } else if (p2ColumnCounter >= 3) {
        gameFlow.winner = gameFlow.secondPlayer;

        return true;
      }
    }

    // diagonals
    for (let j = 0; j < 9; j += 4) {
      if (gameBoard.board[j] == gameFlow.mainPlayer.mark) {
        p1DiagonalCounter++;
      } else if (gameBoard.board[j] == gameFlow.secondPlayer.mark) {
        p2DiagonalCounter++;
      }

      if (p1DiagonalCounter >= 3) {
        gameFlow.winner = gameFlow.mainPlayer;

        return true;
      } else if (p2DiagonalCounter >= 3) {
        gameFlow.winner = gameFlow.secondPlayer

        return true;
      }
    }

    p1DiagonalCounter = 0;
    p2DiagonalCounter = 0;

    for (let j = 2; j <= 6; j += 2) {
      if (gameBoard.board[j] == gameFlow.mainPlayer.mark) {
        p1DiagonalCounter++;
      } else if (gameBoard.board[j] == gameFlow.secondPlayer.mark) {
        p2DiagonalCounter++;
      }

      if (p1DiagonalCounter >= 3) {
        gameFlow.winner = gameFlow.mainPlayer;

        return true;
      } else if (p2DiagonalCounter >= 3) {
        gameFlow.winner = gameFlow.secondPlayer;

        return true;
      }
    }

    // a draw
    if (totalCounter >= 9) return true;

    return false;
  }
}

class Player {
  #xPlayerElem = document.querySelector('.X-player');
  #oPlayerElem = document.querySelector('.O-player');

  constructor(mark) {
    this.mark = mark;
  }

  toggleBacklight() {
    this.#xPlayerElem.classList.remove('backlight');
    this.#oPlayerElem.classList.remove('backlight');
    document.querySelector(`.${this.mark}-player`).classList.add('backlight');
  }
}
