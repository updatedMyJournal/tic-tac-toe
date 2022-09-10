const gameBoard = new class {
  boardElem = document.querySelector('.gameboard');

  constructor() {
    this.board = new Array(9);
    this.boardElem.onclick = this.onclickBoardHandler.bind(this);
  }

  onclickBoardHandler(e) {
    const field = e.target.closest('.field');
    
    if (!field) return;
  
    if (gameFlow.isItFirstTurn) gameFlow.startGame();
  
    if (!displayController.isMarkAllowed(field)) return;
    
    this.setMark(field.dataset.fieldId);
    setTimeout(() => gameFlow.nextTurn());
  }

  setMark(index) {
    const mark = gameFlow.currentPlayer.mark;
    const field = document.querySelector(`.field[data-field-id="${index}"]`);

    this.colorizeFieldText(field);

    this.board[index] = mark;
    field.textContent = mark;
  }

  colorizeFieldText(elem) {
    const mark = gameFlow.currentPlayer.mark.toLowerCase();

    elem.style.color = `rgb(var(--${mark}-player-color))`;
  }

  reset() {
    for (let field of this.boardElem.querySelectorAll('.field')) {
      field.textContent = '';
      field.style.color = '';
    }

    this.board = new Array(9);
    this.boardElem.style.visibility = '';
    this.boardElem.onclick = this.onclickBoardHandler.bind(this);
  }
}

const gameFlow = new class {
  #playerWrapperElem = document.querySelector('.player-wrapper');
  #mainPlayerElem = document.querySelector('.X-player');
  #opponentPickerElem = document.querySelector('select');

  mainPlayer;
  opponent;
  currentPlayer;
  winner;

  isItFirstTurn = true;
  aiTimer;
  isPrevSelectedOpponentHuman = false;

  constructor() {
    const restartButton = document.querySelector('.restart');

    this.#opponentPickerElem.onchange = () => {
      if (this.#opponentPickerElem.value === 'human') {
        this.#playerWrapperElem.onclick = null;
        this.isPrevSelectedOpponentHuman = true;

        displayController.setLogMessage('X Turn');
        displayController.resetPlayerScores();
      } else {
        aiLogic.setAIDifficulty();
        displayController.setLogMessage('Select your player or start the game');

        if (this.isPrevSelectedOpponentHuman) {
          displayController.resetPlayerScores();
        }

        this.isPrevSelectedOpponentHuman = false;
      }
      
      this.restart();
    };

    this.#playerWrapperElem.onclick = this.onPlayerElemClick.bind(this);
    restartButton.onclick = this.restart.bind(this);
  }

  selectMainPlayer(mark) {
    this.mainPlayer = new Player(mark);
    this.currentPlayer = this.mainPlayer;
    this.#selectOpponent();
  }

  #selectOpponent() {
    this.opponent = this.mainPlayer.mark === 'X' ? new Player('O') : new Player('X');
  }

  startGame() {
    if (!this.mainPlayer) {
      const mark = this.#getMarkFromElem(this.#mainPlayerElem);
      
      this.selectMainPlayer(mark);
    }

    // if AI is 'X', AI starts the game
    if (this.#opponentPickerElem.value === 'ai' && this.opponent.mark === 'X') {
      aiLogic.setAIDifficulty();
      gameBoard.boardElem.onclick = null;
      this.currentPlayer = this.opponent;

      this.aiTimer = setTimeout(() => {
        gameBoard.setMark(aiLogic.getBestAIMoveIndex());
        this.nextTurn();
      }, 1000);
    } else {
      this.currentPlayer = this.mainPlayer;
    }

    this.#playerWrapperElem.onclick = null;
    this.isItFirstTurn = false;
  }

  finishGame() {
    gameBoard.reset();

    this.#mainPlayerElem = document.querySelector('.X-player');
    this.winner = null;
    this.isItFirstTurn = true;
    this.aiTimer = null;
    
    displayController.hideOverlay();
    displayController.setDefaultBacklight();

    if (this.#opponentPickerElem.value === 'human') {
      displayController.setLogMessage('X Turn');
    } else {
      this.#playerWrapperElem.onclick = this.onPlayerElemClick.bind(this);
      displayController.setLogMessage('Select your player or start the game');
    }
    
    this.mainPlayer = null;
    this.opponent = null;
  }

  nextTurn() {
    if (this.isGameOver()) {
      this.#assignWinner();
      
      displayController.hideGameboard();
      displayController.showOverlay();
      displayController.setLogMessage('Game over!');
      
      if (!this.winner) {
        displayController.setOverlayMessage('draw');
      } else {
        displayController.incrementPlayerScore(this.winner);
        displayController.refreshPlayerScore(this.winner);
        displayController.setOverlayMessage(this.winner.mark);
      }

      return;
    }

    gameBoard.boardElem.onclick = gameBoard.onclickBoardHandler.bind(gameBoard);
    this.currentPlayer = this.currentPlayer === this.mainPlayer ? this.opponent : this.mainPlayer;
    this.currentPlayer.toggleBacklight();
    displayController.setLogMessage(`${this.currentPlayer.mark} Turn`);

    if (this.#opponentPickerElem.value === 'ai' && this.currentPlayer === this.opponent) {
      gameBoard.boardElem.onclick = null;

      this.aiTimer = setTimeout(() => {
        gameBoard.setMark(aiLogic.getBestAIMoveIndex());
        this.nextTurn();
      }, 1000);
    }
  }

  onPlayerElemClick(e) {
    let clickedPlayerElem = e.target.closest('.X-player, .O-player');

    if (!clickedPlayerElem || clickedPlayerElem === this.mainPlayer) return;
    
    const mark = this.#getMarkFromElem(clickedPlayerElem);

    this.selectMainPlayer(mark);
    this.#mainPlayerElem = clickedPlayerElem;
    this.mainPlayer.toggleBacklight();
    
    if (this.#opponentPickerElem.value === 'ai' && this.opponent.mark === 'X') {
      this.startGame();
    }

  }

  restart() {
    clearTimeout(this.aiTimer);
    this.finishGame();
  }

  #getMarkFromElem(elem) {
    return elem.className.includes('X') ? 'X' : 'O';
  }

  isGameOver() {
    const board = gameBoard.board;
    let totalCounter = 0;

    for (let i = 0, h = 0, v = 0; i < 9; i++, h += 3, v++) {
      if (board[i]) totalCounter++;
      
      // rows
      if (
        h <= 6
        && board[h] 
        && board[h] === board[h + 1] 
        && board[h + 1] === board[h + 2]
      ) {
        if (board[h] === this.mainPlayer.mark || board[h] === this.opponent.mark) {
          return true;
        }
      }
      
      // columns
      if (
        v <= 2
        && board[v] 
        && board[v] === board[v + 3] 
        && board[v + 3] === board[v + 6]
      ) {
        if (board[v] === this.mainPlayer.mark || board[v] === this.opponent.mark) {
          return true;
        }
      }
    }

    // diagonals
    if (
      board[0] 
      && board[0] === board[4]
      && board[4] === board[8]
    ) {
      if (board[0] === this.mainPlayer.mark || board[0] === this.opponent.mark) {
        return true;
      }
    }

    if (
      board[2] 
      && board[2] === board[4]
      && board[4] === board[6]
    ) {
      if (board[2] === this.mainPlayer.mark || board[2] === this.opponent.mark) {
        return true;
      }
    }

    // draw
    if (totalCounter >= 9) return true;

    return false;
  }

  #assignWinner() {
    let score = aiLogic.evaluateCurrentStateAsAI(gameBoard.board);

    if (score > 0) {
      this.winner = this.opponent;
    } else if (score < 0) {
      this.winner = this.mainPlayer;
    }
  }
}

const displayController = new class {
  #overlayElem = document.querySelector('.overlay');
  #XPlayerScore = 0;
  #OPlayerScore = 0;

  incrementPlayerScore(player) {
    if (player.mark === 'X') {
      this.#XPlayerScore++;
    } else {
      this.#OPlayerScore++;
    }
  }

  setLogMessage(str) {
    let logElem = document.querySelector('.log');

    logElem.textContent = str;
  }

  refreshPlayerScore(player) {
    let mark = player.mark;
    let playerScoreElem = document.querySelector(`.${mark}-player .score`);

    playerScoreElem.textContent = mark === 'X' ? this.#XPlayerScore : this.#OPlayerScore;
  }

  resetPlayerScores() {
    const XPlayerScoreElem = document.querySelector(`.X-player .score`);
    const OPlayerScoreElem = document.querySelector(`.O-player .score`);

    XPlayerScoreElem.textContent = '-';
    OPlayerScoreElem.textContent = '-';
    this.#XPlayerScore = 0;
    this.#OPlayerScore = 0;
  }

  showOverlay() {
    this.#overlayElem.style.visibility = 'visible';
    this.#overlayElem.onclick = gameFlow.finishGame.bind(gameFlow);
  }

  hideOverlay() {
    this.#overlayElem.className = 'overlay';
    this.#overlayElem.style.visibility = '';
    this.#overlayElem.onclick = null;
  }

  setOverlayMessage(str = '') {
    const overlayWinnerElem = this.#overlayElem.querySelector('.winner');
    const overlayTextElem = this.#overlayElem.querySelector('.text');

    switch(str) {
      case 'X':
      case 'O':
        overlayWinnerElem.textContent = str;
        overlayTextElem.textContent = 'WINNER!';
        this.#overlayElem.classList.add(`${str}-win`);
        break;
      case 'draw':
        overlayWinnerElem.textContent = 'XO';
        overlayTextElem.textContent = 'DRAW!';
        this.#overlayElem.classList.add('draw');
        break;
      default:
        overlayWinnerElem.textContent = '';
        overlayTextElem.textContent = '';
        break;
    }
  }

  hideGameboard() {
    gameBoard.boardElem.style.visibility = 'hidden';
  }

  isMarkAllowed(elem) {
    return elem.textContent === '';
  }

  setDefaultBacklight() {
    const xPlayerElem = document.querySelector('.X-player');
    const oPlayerElem = document.querySelector('.O-player');

    xPlayerElem.classList.add('backlight');
    oPlayerElem.classList.remove('backlight');
  }
}

const aiLogic = new class {
  #maxDepth = 2;
  #skill = 50;

  setAIDifficulty() {
    const select = document.querySelector('select');
    const index = select.selectedIndex;
    const difficulty = select.options[index].dataset.difficulty;

    switch(difficulty) {
      case 'easy':
        this.#maxDepth = 1;
        this.#skill = 15;
        break;
      case 'medium':
        this.#maxDepth = 2;
        this.#skill = 40;
        break;
      case 'impossible':
        this.#maxDepth = 100;
        this.#skill = 100;
        break;
    }
  }

  getBestAIMoveIndex() {
    const board = gameBoard.board;
    let bestScore = -10;
    let index;

    // AI has the chance of making a random move on easier difficulties.
    if (!this.#isAISkilledEnoughForOptimalMove()) {
      index = this.#getRandomAvailableIndex();

      return index;
    }

    for (let i = 0; i < board.length; i++) {
      if (board[i] !== undefined) continue;

      let score;

      board[i] = gameFlow.opponent.mark;

      /**
       * Why false? We set our mark on every available field in turn
       * and look out for the worst move of our adversary (human player in this case).
       * In other words: we are maximizer here.
       */
      score = this.#minimax(board, 0, false);
      board[i] = undefined;

      if (score > bestScore) {
        bestScore = score;
        index = i;
      }
    }

    return index;
  }

  #minimax(board, depth, isMax) {
    if (depth >= this.#maxDepth || gameFlow.isGameOver()) {
      const score = this.evaluateCurrentStateAsAI(board);

      /**
       * depth is for finding the shortest way
       * the bigger the depth the worse result
       */
      if (score === 10) {
        return score - depth;
      } else if (score === -10) {
        return score + depth;
      } else {
        return score;
      }
    }

    let bestValue;

    // maximizer
    if (isMax) {
      bestValue = -10;

      for (let i = 0; i < board.length; i++) {
        if (board[i] !== undefined) continue;

        board[i] = gameFlow.opponent.mark;
        bestValue = Math.max(bestValue, this.#minimax(board, depth + 1, false));
        board[i] = undefined;
      }

      return bestValue;
    } 
      // minimizer
      else {
      bestValue = 10;

      for (let i = 0; i < board.length; i++) {
        if (board[i] !== undefined) continue;

        board[i] = gameFlow.mainPlayer.mark;
        bestValue = Math.min(bestValue, this.#minimax(board, depth + 1, true));
        board[i] = undefined;
      }

      return bestValue;
    }
  }

  evaluateCurrentStateAsAI(board) {
    const opponentMark = gameFlow.opponent.mark;

    for (let i = 0, h = 0, v = 0; i < 3; i++, h += 3, v++) {
      
      // rows
      if (
        board[h] 
        && board[h] === board[h + 1] 
        && board[h + 1] === board[h + 2]
      ) {
        if (board[h] === opponentMark) {
          return 10;
        } else {
          return -10;
        }
      }
      
      // columns
      if (
        board[v] 
        && board[v] === board[v + 3] 
        && board[v + 3] === board[v + 6]
      ) {
        if (board[v] === opponentMark) {
          return 10;
        } else {
          return -10;
        }
      }
    }

    // diagonals
    if (
      board[0] 
      && board[0] === board[4]
      && board[4] === board[8]
    ) {
      if (board[0] === opponentMark) {
        return 10;
      } else {
        return -10;
      }
    }

    if (
      board[2] 
      && board[2] === board[4]
      && board[4] === board[6]
    ) {
      if (board[2] === opponentMark) {
        return 10;
      } else {
        return -10;
      }
    }

    return 0;
  }

  #isAISkilledEnoughForOptimalMove() {
    const random = Math.floor(Math.random() * 100) + 1;

    return random <= this.#skill;
  }

  #getRandomAvailableIndex() {
    let index;

    while(true) {
      index = Math.floor(Math.random() * 9);

      const field = document.querySelector(`.field[data-field-id="${index}"]`);

      if (displayController.isMarkAllowed(field)) break;
    }

    return index;
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
