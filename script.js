document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const currentPlayerElement = document.getElementById('current-player');
    const blackScoreElement = document.getElementById('black-score');
    const whiteScoreElement = document.getElementById('white-score');
    const resetButton = document.getElementById('reset-button');

    const PLAYER_BLACK = 'black';
    const PLAYER_WHITE = 'white';
    const SIZE = 8;

    let board = [];
    let currentPlayer;

    function initGame() {
        board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        board[3][3] = PLAYER_WHITE;
        board[3][4] = PLAYER_BLACK;
        board[4][3] = PLAYER_BLACK;
        board[4][4] = PLAYER_WHITE;
        currentPlayer = PLAYER_BLACK;
        renderBoard();
        updateInfo();
        // Make sure clicks are enabled at the start of a new game
        boardElement.addEventListener('click', handleCellClick);
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                if (board[row][col]) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece', board[row][col]);
                    cell.appendChild(piece);
                }
                boardElement.appendChild(cell);
            }
        }
    }

    function updateInfo() {
        let blackScore = 0;
        let whiteScore = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === PLAYER_BLACK) blackScore++;
                if (board[r][c] === PLAYER_WHITE) whiteScore++;
            }
        }
        currentPlayerElement.textContent = currentPlayer === PLAYER_BLACK ? '黒' : '白';
        blackScoreElement.textContent = blackScore;
        whiteScoreElement.textContent = whiteScore;
    }

    function getFlips(row, col, player) {
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        const directions = [
            { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
            { r: 0, c: -1 }, { r: 0, c: 1 },
            { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 }
        ];
        let allFlips = [];

        for (const dir of directions) {
            let flipsInDir = [];
            let r = row + dir.r;
            let c = col + dir.c;

            while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === opponent) {
                flipsInDir.push({ row: r, col: c });
                r += dir.r;
                c += dir.c;
            }

            if (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === player && flipsInDir.length > 0) {
                allFlips = allFlips.concat(flipsInDir);
            }
        }
        return allFlips;
    }

    function getValidMoves(player) {
        const validMoves = [];
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === null) {
                    if (getFlips(row, col, player).length > 0) {
                        validMoves.push({ row, col });
                    }
                }
            }
        }
        return validMoves;
    }

    function handleCellClick(event) {
        const cell = event.target.closest('.cell');
        if (!cell || board[cell.dataset.row][cell.dataset.col]) {
            return;
        }

        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        const piecesToFlip = getFlips(row, col, currentPlayer);
        if (piecesToFlip.length === 0) {
            return; // Invalid move
        }

        board[row][col] = currentPlayer;
        piecesToFlip.forEach(piece => {
            board[piece.row][piece.col] = currentPlayer;
        });

        switchPlayer();
        renderBoard();
        updateInfo();
        handleTurnEnd();
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
    }

    function handleTurnEnd() {
        if (getValidMoves(currentPlayer).length > 0) {
            return; // Game continues
        }

        // Current player has no moves, check opponent
        switchPlayer();
        updateInfo(); // Show that turn is trying to pass
        if (getValidMoves(currentPlayer).length > 0) {
            alert(`${currentPlayer === PLAYER_BLACK ? '白' : '黒'}のターンはパスされました。`);
            return; // Opponent has moves
        }

        // Neither player has moves, game over
        endGame();
    }

    function endGame() {
        let blackScore = 0;
        let whiteScore = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === PLAYER_BLACK) blackScore++;
                if (board[r][c] === PLAYER_WHITE) whiteScore++;
            }
        }

        let message = 'ゲーム終了！\n';
        if (blackScore > whiteScore) {
            message += '黒の勝ちです！';
        } else if (whiteScore > blackScore) {
            message += '白の勝ちです！';
        } else {
            message += '引き分けです！';
        }

        setTimeout(() => alert(message), 100);
        boardElement.removeEventListener('click', handleCellClick);
    }

    resetButton.addEventListener('click', initGame);
    initGame();
});
