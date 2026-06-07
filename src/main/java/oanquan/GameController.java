package oanquan;

import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/game")
public class GameController {

    public GameManager game = new GameManager("Player 1", "Player 2");

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
        response.player1Cards = new ArrayList<>(game.player1.cardInventory);
        response.player2Cards = new ArrayList<>(game.player2.cardInventory);

        response.board = new HashMap<>();
        for (int i = 0; i < 12; i++) {
            Tile tile = game.board[i];
            response.board.put(
                    BoardMapper.getTileName(i),
                    new TileDto(tile.mandarinPieces, tile.citizenPieces, tile.mult,tile.lockedTurns)
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
        if (buyer.cardInventory.size() >= 3) {
            response.status = "error";
            response.message = "Khay thẻ của bạn đã đầy (Tối đa 3 thẻ)!";
            fillGameState(response);
            return response;
        }
        buyer.score -= chosen.cost;

        Card bought = CardStorage.createById(cardId);

        if (bought == null) {
            response.status = "error";
            response.message = "Unknown card id.";
            fillGameState(response);
            return response;
        }

        buyer.cardInventory.add(cardId);
        if (playerId == 1) {
            game.p1BoughtCards.add(cardId);
        } else {
            game.p2BoughtCards.add(cardId);
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
    // 9.1.5 Nhận request từ frontend
    @PostMapping("/card/use")
    public GameTurnResponse useCard(@RequestBody Map<String, Object> request) {
        int playerId = (int) request.get("playerId");
        String cardId = (String) request.get("cardId");
        int targetIndex = -1;
        if (request.get("targetIndex") != null) {
            targetIndex = (int) request.get("targetIndex");
        }

        GameTurnResponse response = new GameTurnResponse();
        Player player = (playerId == 1) ? game.player1 : game.player2;
        // 9.5.1 (GameController.useCard)
        // Kiểm tra người chơi có thẻ không
        if (!player.cardInventory.contains(cardId)) {
            response.status = "error";
            response.message = "Bạn không sở hữu thẻ kỹ năng này!";
            fillGameState(response);
            return response;
        }
        // 9.1.6 (GameService.useSkill)
        // 2.2.2.5: Backend áp dụng logic của thẻ lên game state,
        // cập nhật inventory card và chuẩn bị dữ liệu phản hồi mới.
        // Xử lý logic skill
        boolean isSuccess = game.useSkill(playerId, cardId, targetIndex);

        if (isSuccess) {
            // 2.2.2.5: Loại bỏ thẻ đã sử dụng khỏi card inventory.
            player.cardInventory.remove(cardId);

            response.status = "success";
            response.message = "Kích hoạt kỹ năng " + cardId + " thành công!";
        } else {
            response.status = "error";
            response.message = "Không thể sử dụng thẻ này vào lúc này!";
        }
        // 9.1.7 (GameController.fillGameState)
        // 2.2.2.6: Tạo dữ liệu trạng thái mới để gửi lại Frontend render.
        // Cập nhật trạng thái game
        fillGameState(response);
        // 9.1.8 Trả response về frontend
        return response;
    }

    @PostMapping("/shop/reroll")
    public GameTurnResponse rerollShopCard(@RequestBody Map<String, Integer> request) {
        int playerId = request.get("playerId");
        int cardIndex = request.get("cardIndex");

        GameTurnResponse response = new GameTurnResponse();

        if (!game.inShop) {
            response.status = "error";
            response.message = "Shop is not active.";
            fillGameState(response);
            return response;
        }

        if (cardIndex < 0 || cardIndex >= 3) {
            response.status = "error";
            response.message = "Invalid card index.";
            fillGameState(response);
            return response;
        }

        List<Card> options = (playerId == 1) ? game.p1ShopOptions : game.p2ShopOptions;
        Set<Integer> rerolledSlots = (playerId == 1) ? game.p1RerolledSlots : game.p2RerolledSlots;

        if (options == null || cardIndex >= options.size()) {
            response.status = "error";
            response.message = "Card not found.";
            fillGameState(response);
            return response;
        }

        if (rerolledSlots.contains(cardIndex)) {
            response.status = "error";
            response.message = "Thẻ này đã được đổi 1 lần rồi.";
            fillGameState(response);
            return response;
        }

        Set<String> excludedIds = new HashSet<>();

        for (Card card : options) {
            if (card != null && card.id != null) {
                excludedIds.add(card.id);
            }
        }

        Card newCard = CardStorage.randomCardExcept(excludedIds);

        if (newCard == null) {
            response.status = "error";
            response.message = "Không còn thẻ khác để đổi.";
            fillGameState(response);
            return response;
        }

        options.set(cardIndex, newCard);
        rerolledSlots.add(cardIndex);

        response.status = "success";
        response.message = "Đổi thẻ thành công.";
        fillGameState(response);
        return response;
    }
}