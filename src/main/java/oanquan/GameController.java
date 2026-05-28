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
            response.message = game.inShop ? "Shop is active - resolve shop first." : "Invalid move!";
            fillGameState(response);
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

        fillGameState(response);
        return response;
    }

    @GetMapping("/board")
    public GameTurnResponse getInitialBoard() {
        GameTurnResponse response = new GameTurnResponse();

        response.status = "success";
        fillGameState(response);
        response.message = "Initial board loaded.";
        return response;
    }

    @PostMapping("/reset")
    public GameTurnResponse resetBoard() {
        this.game = new GameManager("Player 1", "Player 2");
        GameTurnResponse response = new GameTurnResponse();

        response.status = "success";
        fillGameState(response);
        response.message = "Game has been reset.";

        return response;
    }
    @PostMapping("/resign")
    public GameTurnResponse resignGame(@RequestBody Map<String, Integer> request) {
        int resigningPlayerId = request.get("playerId");
        GameTurnResponse response = new GameTurnResponse();

        response.status = "game_complete";
        response.message = "Một người chơi đã đầu hàng.";
        response.winner = (resigningPlayerId == 1) ? "Player 2" : "Player 1";

        game.lastAnimationPath = new ArrayList<>();
        game.lastScatterEvent = null;

        fillGameState(response);
        return response;
    }

    private void fillGameState(GameTurnResponse response) {
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

        response.scatterEvent = game.lastScatterEvent;

        response.halfMoveCount = game.halfMoveCount;
        response.fullTurnCount = game.fullTurnCount;

        response.inShop = game.inShop;
        response.shopEventId = game.shopEventId;
        response.p1ShopDone = game.p1ShopDone;
        response.p2ShopDone = game.p2ShopDone;

        if (game.inShop) {
            response.p1ShopOptions = new ArrayList<>();
            if (game.p1ShopOptions != null) {
                for (Card c : game.p1ShopOptions) {
                    response.p1ShopOptions.add(new GameTurnResponse.CardOptionDto(
                            c.id, c.name, c.description, c.cost
                    ));
                }
            }

            response.p2ShopOptions = new ArrayList<>();
            if (game.p2ShopOptions != null) {
                for (Card c : game.p2ShopOptions) {
                    response.p2ShopOptions.add(new GameTurnResponse.CardOptionDto(
                            c.id, c.name, c.description, c.cost
                    ));
                }
            }
        } else {
            response.p1ShopOptions = new ArrayList<>();
            response.p2ShopOptions = new ArrayList<>();
        }
    }

    @PostMapping("/shop/buy")
    public GameTurnResponse buyShop(@RequestBody Map<String, Object> request) {
        int playerId = (int) request.get("playerId");
        String cardId = (String) request.get("cardId");

        GameTurnResponse response = new GameTurnResponse();

        if (!game.inShop) {
            response.status = "error";
            response.message = "Shop is not active.";
            fillGameState(response);
            return response;
        }

        if (playerId == 1 && game.p1ShopDone) {
            response.status = "error";
            response.message = "Player 1 already resolved shop.";
            fillGameState(response);
            return response;
        }
        if (playerId == 2 && game.p2ShopDone) {
            response.status = "error";
            response.message = "Player 2 already resolved shop.";
            fillGameState(response);
            return response;
        }

        Player buyer = (playerId == 1) ? game.player1 : game.player2;
        List<Card> options = (playerId == 1) ? game.p1ShopOptions : game.p2ShopOptions;

        Card chosen = null;
        if (options != null) {
            for (Card c : options) {
                if (c != null && c.id != null && c.id.equals(cardId)) {
                    chosen = c;
                    break;
                }
            }
        }

        if (chosen == null) {
            response.status = "error";
            response.message = "Card not found in your shop options.";
            fillGameState(response);
            return response;
        }

        if (buyer.score < chosen.cost) {
            response.status = "error";
            response.message = "Not enough score to buy this card.";
            fillGameState(response);
            return response;
        }

        buyer.score -= chosen.cost;

        Card bought;
        if ("BONUS_SEED".equals(cardId)) bought = new BonusSeedCard();
        else {
            response.status = "error";
            response.message = "Unknown card id.";
            fillGameState(response);
            return response;
        }

        bought.addCard(buyer);

        if (playerId == 1) game.p1ShopDone = true;
        else game.p2ShopDone = true;

        if (game.p1ShopDone && game.p2ShopDone) {
            game.inShop = false;
            game.p1ShopOptions = new ArrayList<>();
            game.p2ShopOptions = new ArrayList<>();
        }

        response.status = "success";
        response.message = "Player " + playerId + " bought " + cardId + " for " + chosen.cost + " score.";
        fillGameState(response);
        return response;
    }

    @PostMapping("/shop/skip")
    public GameTurnResponse skipShop(@RequestBody Map<String, Integer> request) {
        int playerId = request.get("playerId");
        GameTurnResponse response = new GameTurnResponse();

        if (!game.inShop) {
            response.status = "error";
            response.message = "Shop is not active.";
            fillGameState(response);
            return response;
        }

        if (playerId == 1) game.p1ShopDone = true;
        else if (playerId == 2) game.p2ShopDone = true;

        if (game.p1ShopDone && game.p2ShopDone) {
            game.inShop = false;
            game.p1ShopOptions = new ArrayList<>();
            game.p2ShopOptions = new ArrayList<>();
        }

        response.status = "success";
        response.message = "Player " + playerId + " skipped shop.";
        fillGameState(response);
        return response;
    }
}