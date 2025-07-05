class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameMode = 'ai'; // 'ai' 或 'human'
        this.gameActive = true;
        this.isAiTurn = false;

        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫排
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直排
            [0, 4, 8], [2, 4, 6] // 對角線
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // 遊戲模式切換
        document.getElementById('humanVsAi').addEventListener('click', () => {
            this.setGameMode('ai');
        });

        document.getElementById('humanVsHuman').addEventListener('click', () => {
            this.setGameMode('human');
        });

        // 棋盤點擊事件
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.cellIndex);
                this.makeMove(index);
            });
        });

        // 重置遊戲
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // 再玩一局
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetGame();
            this.hideVictoryModal();
        });
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();

        // 更新按鈕狀態
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (mode === 'ai') {
            document.getElementById('humanVsAi').classList.add('active');
            document.getElementById('player2Name').textContent = '電腦';
        } else {
            document.getElementById('humanVsHuman').classList.add('active');
            document.getElementById('player2Name').textContent = '玩家二';
        }
    }

    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '' || this.isAiTurn) {
            return;
        }

        this.board[index] = this.currentPlayer;
        this.updateCell(index, this.currentPlayer);

        if (this.checkWin()) {
            this.endGame(this.currentPlayer);
            return;
        }

        if (this.checkDraw()) {
            this.endGame('draw');
            return;
        }

        this.switchPlayer();

        // 如果是AI模式且輪到O（電腦），執行AI移動
        if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
            this.isAiTurn = true;
            setTimeout(() => {
                this.makeAiMove();
                this.isAiTurn = false;
            }, 500); // 延遲讓AI看起來在思考
        }
    }

    makeAiMove() {
        if (!this.gameActive) return;

        const bestMove = this.minimax(this.board, 'O').index;

        if (bestMove !== undefined) {
            this.board[bestMove] = 'O';
            this.updateCell(bestMove, 'O');

            if (this.checkWin()) {
                this.endGame('O');
                return;
            }

            if (this.checkDraw()) {
                this.endGame('draw');
                return;
            }

            this.switchPlayer();
        }
    }

    // Minimax算法實現AI
    minimax(board, player) {
        const availableMoves = this.getAvailableMoves(board);

        // 檢查終端狀態
        if (this.checkWinForBoard(board, 'O')) {
            return { score: 10 };
        } else if (this.checkWinForBoard(board, 'X')) {
            return { score: -10 };
        } else if (availableMoves.length === 0) {
            return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availableMoves.length; i++) {
            const move = {};
            move.index = availableMoves[i];

            board[availableMoves[i]] = player;

            if (player === 'O') {
                const result = this.minimax(board, 'X');
                move.score = result.score;
            } else {
                const result = this.minimax(board, 'O');
                move.score = result.score;
            }

            board[availableMoves[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    getAvailableMoves(board) {
        return board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    }

    checkWinForBoard(board, player) {
        return this.winningCombinations.some(combination => {
            return combination.every(index => board[index] === player);
        });
    }

    updateCell(index, player) {
        const cell = document.querySelector(`[data-cell-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add('taken');

        // 添加放置動畫
        cell.style.animation = 'none';
        cell.offsetHeight; // 觸發重排
        cell.style.animation = 'pulse 0.3s ease';
    }

    checkWin() {
        const winningCombination = this.winningCombinations.find(combination => {
            return combination.every(index => this.board[index] === this.currentPlayer);
        });

        if (winningCombination) {
            // 高亮獲勝組合
            winningCombination.forEach(index => {
                document.querySelector(`[data-cell-index="${index}"]`).classList.add('winning');
            });
            return true;
        }

        return false;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }

    updateDisplay() {
        const currentTurnElement = document.getElementById('currentTurn');
        if (this.gameActive) {
            if (this.gameMode === 'ai') {
                if (this.currentPlayer === 'X') {
                    currentTurnElement.textContent = '輪到您下棋';
                } else {
                    currentTurnElement.textContent = '電腦思考中...';
                }
            } else {
                currentTurnElement.textContent = `輪到 ${this.currentPlayer} 玩家`;
            }
        }
    }

    endGame(winner) {
        this.gameActive = false;
        const statusElement = document.getElementById('gameStatus');

        if (winner === 'draw') {
            statusElement.textContent = '平局！';
            statusElement.className = 'status-draw';
            this.showVictoryModal('平局！雙方勢均力敵！');
        } else {
            let message;
            if (this.gameMode === 'ai') {
                if (winner === 'X') {
                    message = '恭喜您獲勝！';
                    statusElement.textContent = '您贏了！';
                } else {
                    message = '電腦獲勝！再試一次吧！';
                    statusElement.textContent = '電腦贏了！';
                }
            } else {
                message = `恭喜 ${winner} 玩家獲勝！`;
                statusElement.textContent = `${winner} 玩家獲勝！`;
            }

            statusElement.className = 'status-win';
            this.showVictoryModal(message);

            // 只有玩家獲勝時才顯示煙火
            if (this.gameMode === 'human' || winner === 'X') {
                this.createFireworks();
            }
        }

        document.getElementById('currentTurn').textContent = '遊戲結束';
    }

    showVictoryModal(message) {
        const modal = document.getElementById('victoryModal');
        const messageElement = document.getElementById('victoryMessage');
        messageElement.textContent = message;
        modal.classList.add('show');
    }

    hideVictoryModal() {
        const modal = document.getElementById('victoryModal');
        modal.classList.remove('show');
    }

    createFireworks() {
        const container = document.getElementById('fireworksContainer');
        if (!container) {
            console.error('Fireworks container not found!');
            return;
        }

        const colors = ['#ff6b6b', '#4834d4', '#ffd700', '#00cec9', '#fd79a8', '#fdcb6e'];

        console.log('Creating fireworks!'); // 調試用

        // 創建多個煙火爆炸點
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createFireworkExplosion(container, colors);
            }, i * 200);
        }

        // 8秒後清理煙火
        setTimeout(() => {
            container.innerHTML = '';
        }, 8000);
    }

    createFireworkExplosion(container, colors) {
        // 隨機位置
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.6) + (window.innerHeight * 0.1);

        // 創建爆炸中心點
        const explosion = document.createElement('div');
        explosion.className = 'firework-explosion';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';

        // 創建粒子
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';

            // 隨機顏色
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 6px ${color}`;

            // 隨機方向和距離
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = Math.random() * 100 + 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            // 設置初始位置
            particle.style.left = '0px';
            particle.style.top = '0px';

            // 添加到爆炸點
            explosion.appendChild(particle);

            // 動畫粒子
            setTimeout(() => {
                particle.style.transform = `translate(${vx}px, ${vy}px)`;
                particle.style.opacity = '0';
            }, 10);
        }

        container.appendChild(explosion);

        // 清理這個爆炸效果
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 2000);
    }

    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isAiTurn = false;

        // 清理棋盤
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.animation = '';
        });

        // 清理狀態顯示
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = '';
        }

        // 清理煙火
        const fireworksContainer = document.getElementById('fireworksContainer');
        if (fireworksContainer) {
            fireworksContainer.innerHTML = '';
        }

        this.updateDisplay();
    }
}

// 頁面載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
