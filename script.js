document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris-board');
    const context = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 24;

    context.scale(BLOCK_SIZE, BLOCK_SIZE);

    let score = 0;
    let board = createBoard(COLS, ROWS);
    let piece = null;

    const COLORS = [
        null,
        '#FF0D72', // T
        '#0DC2FF', // O
        '#0DFF72', // L
        '#F538FF', // J
        '#FF8E0D', // I
        '#FFE138', // S
        '#3877FF', // Z
    ];

    function createBoard(cols, rows) {
        const matrix = [];
        while (rows--) {
            matrix.push(new Array(cols).fill(0));
        }
        return matrix;
    }

    function createPiece(type) {
        if (type === 'T') {
            return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
        } else if (type === 'O') {
            return [[2, 2], [2, 2]];
        } else if (type === 'L') {
            return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
        } else if (type === 'J') {
            return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
        } else if (type === 'I') {
            return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
        } else if (type === 'S') {
            return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
        } else if (type === 'Z') {
            return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
        }
    }

    function draw() {
        // Draw the board
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(board, { x: 0, y: 0 });
        if (piece) {
            drawMatrix(piece.matrix, piece.pos);
        }
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = COLORS[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function merge(board, piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    function pieceDrop() {
        if (!piece) return;
        piece.pos.y++;
        if (collide(board, piece)) {
            piece.pos.y--;
            merge(board, piece);
            resetPiece();
            sweepBoard();
            updateScore();
        }
        dropCounter = 0;
    }

    function pieceMove(dir) {
        if (!piece) return;
        piece.pos.x += dir;
        if (collide(board, piece)) {
            piece.pos.x -= dir;
        }
    }

    function pieceRotate(dir) {
        if (!piece) return;
        const pos = piece.pos.x;
        let offset = 1;
        rotate(piece.matrix, dir);
        while (collide(board, piece)) {
            piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > piece.matrix[0].length) {
                rotate(piece.matrix, -dir);
                piece.pos.x = pos;
                return;
            }
        }
    }

    function collide(board, piece) {
        const [m, o] = [piece.matrix, piece.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function resetPiece() {
        const pieces = 'TJLOSZI';
        piece = {
            pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
            matrix: createPiece(pieces[pieces.length * Math.random() | 0]),
        };

        if (collide(board, piece)) {
            // Game Over
            board.forEach(row => row.fill(8)); // Use a different color for game over
            alert('Game Over! Score: ' + score);
            // Stop the game loop
            update = () => {};
        }
    }


    function sweepBoard() {
        let rowCount = 1;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }

            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;

            score += rowCount * 10;
            rowCount *= 2;
        }
    }

    function updateScore() {
        scoreElement.innerText = score;
    }

    let dropCounter = 0;
    let dropInterval = 1000; // 1 second
    let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            pieceDrop();
        }

        draw();
        requestAnimationFrame(update);
    }

    document.addEventListener('keydown', event => {
        if (event.keyCode === 37) { // Left arrow
            pieceMove(-1);
        } else if (event.keyCode === 39) { // Right arrow
            pieceMove(1);
        } else if (event.keyCode === 40) { // Down arrow
            pieceDrop();
        } else if (event.keyCode === 81) { // Q for rotate left
            pieceRotate(-1);
        } else if (event.keyCode === 87 || event.keyCode === 38) { // W or Up arrow for rotate right
            pieceRotate(1);
        }
    });

    resetPiece();
    updateScore();
    update();
});
