package oanquan;

import java.util.ArrayList;
import java.util.List;

public class GameManager {
    public Tile[] board;
    public Player player1;
    public Player player2;
    public Player currentPlayer;
    public List<Integer> lastAnimationPath = new ArrayList<>();
    public String lastScatterEvent = null;
    public GameManager(String p1Name, String p2Name) {
        player1 = new Player(p1Name, 1);
        player2 = new Player(p2Name, 2);
        currentPlayer = player1;
        board = new Tile[12];
        for (int i = 0; i < 12; i++) {
            board[i] = new Tile(i, i == 5 || i == 11);
        }
    }

    public void executeHooks(TriggerTime time, Turn currentTurn) {
        for (Effect effect : currentPlayer.activeEffects.get(time)) {
            effect.trigger(this, currentTurn);
        }
    }

    public void playTurn(int startIndex, int direction) {
        this.lastScatterEvent = null;
        Turn currentTurn = new Turn(currentPlayer);
        currentTurn.startIndex = startIndex;
        currentTurn.direction = direction;

        executeHooks(TriggerTime.AFTER_TILE_PICK, currentTurn);
        executeHooks(TriggerTime.AFTER_DIR_PICK, currentTurn);

        currentTurn.piecesInHand = board[startIndex].pickUpPieces();
        currentTurn.currentTileIndex = startIndex;

        executeHooks(TriggerTime.AFTER_PICKUP, currentTurn);

        while (currentTurn.piecesInHand > 0) {
            currentTurn.currentTileIndex = (currentTurn.currentTileIndex + direction + 12) % 12;

            executeHooks(TriggerTime.BEFORE_SOW, currentTurn);

            board[currentTurn.currentTileIndex].citizenPieces++;
            currentTurn.piecesInHand--;

            currentTurn.animationPath.add(currentTurn.currentTileIndex);

            executeHooks(TriggerTime.AFTER_SOW, currentTurn);

            if (currentTurn.piecesInHand == 0) {
                int nextIndex = (currentTurn.currentTileIndex + direction + 12) % 12;

                if (board[nextIndex].citizenPieces > 0 || board[nextIndex].mandarinPieces > 0) {
                    if (board[nextIndex].isMandarin) {
                        break;
                    } else {
                        currentTurn.piecesInHand = board[nextIndex].pickUpPieces();
                        currentTurn.currentTileIndex = nextIndex;
                    }
                }
                else {
                    handleCapture(nextIndex, currentTurn);
                    break;
                }
            }
        }

        executeHooks(TriggerTime.END_TURN, currentTurn);
        this.lastAnimationPath = currentTurn.animationPath;
        switchTurn();
    }

    private void handleCapture(int emptyIndex, Turn currentTurn) {
        int checkEmptyIndex = emptyIndex;
        int direction = currentTurn.direction;

        while (true) {
            int targetIndex = (checkEmptyIndex + direction + 12) % 12;

            if (board[targetIndex].citizenPieces == 0 && board[targetIndex].mandarinPieces == 0) {
                break;
            }
            if (board[targetIndex].isMandarin && board[targetIndex].citizenPieces < 5) {
                break;
            }
            currentTurn.currentTileIndex = targetIndex;

            executeHooks(TriggerTime.BEFORE_CAPTURE, currentTurn);

            double captured = board[targetIndex].calcScore();
            int actualPieces = board[targetIndex].mandarinPieces + board[targetIndex].citizenPieces;
            board[targetIndex].pickUpPieces();
            currentPlayer.score += captured;
            currentPlayer.capturedCount += actualPieces;

            currentTurn.animationPath.add(targetIndex);

            executeHooks(TriggerTime.AFTER_CAPTURE, currentTurn);

            int nextEmptyCheck = (targetIndex + direction + 12) % 12;
            if (board[nextEmptyCheck].citizenPieces == 0 && board[nextEmptyCheck].mandarinPieces == 0) {
                checkEmptyIndex = nextEmptyCheck;
            } else {
                break;
            }
        }
    }

    public boolean isValidMove(int index) {
        if (board[index].isMandarin) return false;
        if (board[index].citizenPieces == 0) return false;

        if (currentPlayer.playerId == 1 && (index < 0 || index > 4)) return false;
        if (currentPlayer.playerId == 2 && (index < 6 || index > 10)) return false;

        return true;
    }

    public boolean isGameOver() {
        boolean isMandarin1Empty = (board[5].mandarinPieces == 0 && board[5].citizenPieces == 0);
        boolean isMandarin2Empty = (board[11].mandarinPieces == 0 && board[11].citizenPieces == 0);

        return (isMandarin1Empty && isMandarin2Empty) || isDeadlock();
    }
    public void switchTurn() {
        currentPlayer = (currentPlayer == player1) ? player2 : player1;
        if (!isGameOver()) {
            checkAndScatterPieces();
        }
    }
    private void checkAndScatterPieces() {
        int startIdx = (currentPlayer.playerId == 1) ? 0 : 6;
        int endIdx = (currentPlayer.playerId == 1) ? 4 : 10;

        boolean isEmpty = true;
        for (int i = startIdx; i <= endIdx; i++) {
            if (board[i].citizenPieces > 0) {
                isEmpty = false;
                break;
            }
        }

        if (isEmpty) {
            Player opponent = (currentPlayer == player1) ? player2 : player1;
            int needed = 5;

            if (currentPlayer.capturedCount >= needed) {
                currentPlayer.capturedCount -= needed;
                currentPlayer.score -= needed;
                this.lastScatterEvent = "P" + currentPlayer.playerId + "_OWN";
            }
            else {
                int borrowed = needed - currentPlayer.capturedCount;

                currentPlayer.score -= currentPlayer.capturedCount;
                currentPlayer.capturedCount = 0;

                currentPlayer.score -= borrowed;
                opponent.score += borrowed;
                opponent.capturedCount -= borrowed;

                this.lastScatterEvent = "P" + currentPlayer.playerId + "_BORROW";
            }

            for (int i = startIdx; i <= endIdx; i++) {
                board[i].citizenPieces = 1;
            }
        }
    }
    public boolean isDeadlock() {
        int totalPieces = 0;
        for (Tile t : board) {
            totalPieces += t.citizenPieces + t.mandarinPieces;
        }
        return totalPieces <= 5;
    }
}