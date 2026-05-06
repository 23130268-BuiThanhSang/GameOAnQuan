package oanquan;

import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/game")
public class GameController {

    private GameManager game = new GameManager("Player 1", "Player 2");

    @PostMapping("/move")
    public GameTurnResponse makeMove(@RequestBody MoveRequest request) {
        GameTurnResponse response = new GameTurnResponse();

        if (!game.isValidMove(request.startIndex)) {
            response.status = "error";
            response.message = "Invalid move!";
            return response;
        }
        game.playTurn(request.startIndex, request.direction);
        response.status = "success";
        response.message = "Move executed successfully.";

        if (game.isGameOver()) {
            response.status = "game_complete";
            response.message = "Game Complete! Both mandarins have been captured.";

            if (game.player1.score > game.player2.score) {
                response.winner = "Player 1";
            } else if (game.player2.score > game.player1.score) {
                response.winner = "Player 2";
            } else {
                response.winner = "Draw";
            }
        }

        response.currentPlayer = game.currentPlayer.playerId;

        response.scores = new HashMap<>();
        response.scores.put("player1", (int) game.player1.score);
        response.scores.put("player2", (int) game.player2.score);

        response.capturedCount = new HashMap<>();
        response.capturedCount.put("player1", game.player1.capturedCount);
        response.capturedCount.put("player2", game.player2.capturedCount);

        response.board = new HashMap<>();
        for (int i = 0; i < 12; i++) {
            Tile tile = game.board[i];
            response.board.put(
                    BoardMapper.getTileName(i),
                    new TileDto(tile.mandarinPieces, tile.citizenPieces, tile.mult)
            );
        }

        response.animationPath = new ArrayList<>();
        for (Integer index : game.lastAnimationPath) {
            response.animationPath.add(BoardMapper.getTileName(index));
        }

        return response;
    }

    @GetMapping("/board")
    public GameTurnResponse getInitialBoard() {
        GameTurnResponse response = new GameTurnResponse();

        response.status = "success";
        response.currentPlayer = game.currentPlayer.playerId;

        response.scores = new HashMap<>();
        response.scores.put("player1", (int) game.player1.score);
        response.scores.put("player2", (int) game.player2.score);
        response.capturedCount = new HashMap<>();
        response.capturedCount.put("player1", game.player1.capturedCount);
        response.capturedCount.put("player2", game.player2.capturedCount);
        response.board = new HashMap<>();
        for (int i = 0; i < 12; i++) {
            Tile tile = game.board[i];
            response.board.put(
                    BoardMapper.getTileName(i),
                    new TileDto(tile.mandarinPieces, tile.citizenPieces, tile.mult)
            );
        }

        response.animationPath = new ArrayList<>();
        response.message = "Initial board loaded.";

        return response;
    }

    @PostMapping("/reset")
    public GameTurnResponse resetBoard() {
        this.game = new GameManager("Player 1", "Player 2");
        GameTurnResponse response = new GameTurnResponse();

        response.status = "success";
        response.currentPlayer = game.currentPlayer.playerId;

        response.scores = new HashMap<>();
        response.scores.put("player1", (int) game.player1.score);
        response.scores.put("player2", (int) game.player2.score);

        response.capturedCount = new HashMap<>();
        response.capturedCount.put("player1", game.player1.capturedCount);
        response.capturedCount.put("player2", game.player2.capturedCount);

        response.board = new HashMap<>();
        for (int i = 0; i < 12; i++) {
            Tile tile = game.board[i];
            response.board.put(
                    BoardMapper.getTileName(i),
                    new TileDto(tile.mandarinPieces, tile.citizenPieces, tile.mult)
            );
        }

        response.animationPath = new ArrayList<>();
        response.message = "Game has been reset.";

        return response;
    }
}