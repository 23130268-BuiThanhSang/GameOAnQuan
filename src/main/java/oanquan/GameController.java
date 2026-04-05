package oanquan;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
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
        response.currentPlayer = game.currentPlayer.playerId;

        response.scores = new HashMap<>();
        response.scores.put("player1", (int) game.player1.score);
        response.scores.put("player2", (int) game.player2.score);

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

        response.message = "Move executed successfully.";
        return response;
    }
}