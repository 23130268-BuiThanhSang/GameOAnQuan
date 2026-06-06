package oanquan;

import java.util.*;

public class GameManager {
    public List<String> lastP1ShopCards = new ArrayList<>();
    public List<String> lastP2ShopCards = new ArrayList<>();
    public List<String> p1BoughtCards = new ArrayList<>();
    public List<String> p2BoughtCards = new ArrayList<>();
    public Tile[] board;
    public Player player1;
    public Player player2;
    public Player currentPlayer;
    public int halfMoveCount = 0;
    public int fullTurnCount = 0;
    public boolean inShop = false;
    public int shopEventId;
    public int lastShopOpenedAtTurn = 0;
    public boolean p1ShopDone;
    public boolean p2ShopDone;
    public List<Card> p1ShopOptions = new ArrayList<>();
    public List<Card> p2ShopOptions = new ArrayList<>();
    public Set<Integer> p1RerolledSlots = new HashSet<>();
    public Set<Integer> p2RerolledSlots = new HashSet<>();
    public List<Integer> lastAnimationPath = new ArrayList<>();
    public String lastScatterEvent = null;
    public boolean skipTurn = false;
    public GameManager(String p1Name, String p2Name) {
        player1 = new Player(p1Name, 1);
        player2 = new Player(p2Name, 2);
        currentPlayer = player1;
        board = new Tile[12];
        for (int i = 0; i < 12; i++) {
            board[i] = new Tile(i, i == 5 || i == 11);
        }
    }
    // 11.1.3a.2: Hàm quản lý tập trung để duyệt và kích hoạt các hiệu ứng (Effect) đang nằm trong danh sách chờ
    public void executeHooks(TriggerTime time, Turn currentTurn) {
        for (Effect effect : currentPlayer.activeEffects.get(time)) {
            // 11.1.3a.3: Gọi hàm trigger() của hiệu ứng để can thiệp vào kết quả tính toán
            effect.trigger(this, currentTurn);
        }
    }

    public void playTurn(int startIndex, int direction) {
        this.lastScatterEvent = null;
        Turn currentTurn = new Turn(currentPlayer);
        currentTurn.startIndex = startIndex;
        currentTurn.direction = direction;

        // 11.1.3a.2: Điểm neo sau khi chọn ô (Phần Hook Architecture)
        executeHooks(TriggerTime.AFTER_TILE_PICK, currentTurn);
        executeHooks(TriggerTime.AFTER_DIR_PICK, currentTurn);

        currentTurn.piecesInHand = board[startIndex].pickUpPieces();
        currentTurn.currentTileIndex = startIndex;

        // 11.1.3a.2: Điểm neo sau khi bốc quân
        executeHooks(TriggerTime.AFTER_PICKUP, currentTurn);

        while (currentTurn.piecesInHand > 0) {
            currentTurn.currentTileIndex = (currentTurn.currentTileIndex + direction + 12) % 12;
            if (board[currentTurn.currentTileIndex].lockedTurns > 0) {
                continue;
            }
            // 11.1.3a.2: Điểm neo trước khi rải quân (Sow)
            executeHooks(TriggerTime.BEFORE_SOW, currentTurn);

            board[currentTurn.currentTileIndex].citizenPieces++;
            currentTurn.piecesInHand--;

            currentTurn.animationPath.add(currentTurn.currentTileIndex);

            // 11.1.3a.2: Điểm neo sau khi rải quân
            executeHooks(TriggerTime.AFTER_SOW, currentTurn);

            if (currentTurn.piecesInHand == 0) {
                int nextIndex = (currentTurn.currentTileIndex + direction + 12) % 12;
                while (board[nextIndex].lockedTurns > 0) {
                    nextIndex = (nextIndex + direction + 12) % 12;
                }

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

        // 11.1.3a.2: Điểm neo cuối lượt
        executeHooks(TriggerTime.END_TURN, currentTurn);
        this.lastAnimationPath = currentTurn.animationPath;

        // 11.1.3b.1 & 11.1.3b.2: Dọn dẹp (Garbage Collection) các hiệu ứng chỉ có tác dụng 1 lượt
        currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE).removeIf(e -> e instanceof DoubleScoreEffect);

        switchTurn();
    }

    private void handleCapture(int emptyIndex, Turn currentTurn) {
        int checkEmptyIndex = emptyIndex;
        int direction = currentTurn.direction;

        while (true) {
            int targetIndex = (checkEmptyIndex + direction + 12) % 12;
            while (board[targetIndex].lockedTurns > 0) {
                targetIndex = (targetIndex + direction + 12) % 12;
            }
            if (board[targetIndex].citizenPieces == 0 && board[targetIndex].mandarinPieces == 0) {
                break;
            }
            if (board[targetIndex].isMandarin && board[targetIndex].citizenPieces < 5) {
                break;
            }
            currentTurn.currentTileIndex = targetIndex;

            // 11.1.3a.2: Điểm neo TRƯỚC KHI ăn quân (Nơi hiệu ứng thẻ như Nhân đôi được kích hoạt)
            executeHooks(TriggerTime.BEFORE_CAPTURE, currentTurn);
            double captured = board[targetIndex].calcScore();
            captured *= currentTurn.scoreMultiplier;

            int actualPieces = board[targetIndex].mandarinPieces + board[targetIndex].citizenPieces;
            board[targetIndex].pickUpPieces();

            currentPlayer.score += captured;
            currentPlayer.capturedCount += actualPieces;
            currentTurn.animationPath.add(targetIndex);

            // 11.1.3a.2: Điểm neo SAU KHI ăn quân
            executeHooks(TriggerTime.AFTER_CAPTURE, currentTurn);
            int nextEmptyCheck = (targetIndex + direction + 12) % 12;
            while (board[nextEmptyCheck].lockedTurns > 0) {
                nextEmptyCheck = (nextEmptyCheck + direction + 12) % 12;
            }

            if (board[nextEmptyCheck].citizenPieces == 0 && board[nextEmptyCheck].mandarinPieces == 0) {
                checkEmptyIndex = nextEmptyCheck;
            } else {
                break;
            }
        }
    }
    public boolean isValidMove(int index) {
        if (inShop) return false;
        if (board[index].isMandarin) return false;
        if (board[index].citizenPieces == 0) return false;
        if (board[index].lockedTurns > 0) return false;
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

        if (!skipTurn) {
            currentPlayer = (currentPlayer == player1) ? player2 : player1;
        } else {
            skipTurn = false; // reset sau khi skip
        }
        if (!isGameOver()) {
            checkAndScatterPieces();
        }
        halfMoveCount++;
        if (halfMoveCount % 2 == 0) {
            fullTurnCount++;

            for (Tile t : board) {
                if (t.lockedTurns > 0) t.lockedTurns--;
            }
        }

        if (fullTurnCount > 0
                && (fullTurnCount == 5 || fullTurnCount == 10 || fullTurnCount == 15)
                && !inShop
                && lastShopOpenedAtTurn != fullTurnCount) {

            lastShopOpenedAtTurn = fullTurnCount;
            openShop();
        }
        // Cho test nhanh shop
//        if (fullTurnCount > 0 && !inShop && lastShopOpenedAtTurn != fullTurnCount) {
//            lastShopOpenedAtTurn = fullTurnCount;
//            openShop();
//        }
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

    private List<Card> generateShopOptions(List<String> lastShopHistory, List<String> boughtCards) {
        List<Card> allCards = CardStorage.allCards();
        List<Card> availableCards = new ArrayList<>();

        for (Card c : allCards) {
            if (!lastShopHistory.contains(c.id) && !boughtCards.contains(c.id)) {
                availableCards.add(c);
            }
        }

        if (availableCards.isEmpty()) {
            for (Card c : allCards) {
                if (!boughtCards.contains(c.id)) {
                    availableCards.add(c);
                }
            }
        }

        Collections.shuffle(availableCards);

        List<Card> options = new ArrayList<>();
        for (int i = 0; i < Math.min(3, availableCards.size()); i++) {
            options.add(availableCards.get(i));
        }

        lastShopHistory.clear();
        for (Card c : options) {
            lastShopHistory.add(c.id);
        }

        return options;
    }

    private void openShop() {
        inShop = true;
        shopEventId++;
        p1ShopDone = false;
        p2ShopDone = false;
        p1RerolledSlots.clear();
        p2RerolledSlots.clear();
        p1ShopOptions = generateShopOptions(lastP1ShopCards, p1BoughtCards);
        p2ShopOptions = generateShopOptions(lastP2ShopCards, p2BoughtCards);
    }
    public boolean useSkill(int playerId, String skillId, int targetIndex) {
        Player p = (playerId == 1) ? player1 : player2;

        if ("BONUS_SEED".equals(skillId)) {
            board[targetIndex].citizenPieces++;
            return true;
        }
        if ("DOUBLE_CAPTURE".equals(skillId)) {
            p.activeEffects.get(TriggerTime.BEFORE_CAPTURE).add(new DoubleScoreEffect());
            return true;
        }
        if ("LOCK_TILE".equals(skillId)) {
            board[targetIndex].lockedTurns = 3;
            return true;
        }
        if ("STEAL_CARD".equals(skillId)) {
            Player opponent = (p == player1) ? player2 : player1;
            if (opponent.cardInventory.isEmpty()) {
                return false;
            }
            int randomIndex = (int) (Math.random() * opponent.cardInventory.size());
            String stolenCard = opponent.cardInventory.remove(randomIndex);
            p.cardInventory.add(stolenCard);
            return true;
        }
        if ("SEIZE_COMMAND".equals(skillId)) {
            // Kiểm tra: không thể cướp lượt của chính mình
            if (currentPlayer == p) return false;

//             Thoát khỏi shop nếu đang trong shop
            if (inShop) {
                inShop = false;
            }

            // Chuyển quyền cho người dùng thẻ
            currentPlayer = p;

            // Skip lượt đối thủ
            skipTurn = true;

            // Reset state
            resetTurnState();

            return true;
        }
        if ("REMOVE_HIGHEST_CARD".equals(skillId)) {
            Player opponent =(p == player1)? player2: player1;

            if (opponent.cardInventory.isEmpty()) {
                return false;
            }

            String removeCard = null;
            int highestCost = -1;

            for (String cardId : opponent.cardInventory) {
                Card card =CardStorage.createById(cardId);

                if (card != null && card.cost > highestCost) {

                    highestCost =card.cost;

                    removeCard =cardId;
                }
            }
            if (removeCard != null) {
                opponent.cardInventory.remove(removeCard);
            }
            return true;
        }

        return false;
    }

    public void setCurrentPlayer(Player player) {
        this.currentPlayer = player;
    }

    public void resetTurnState() {
        this.lastAnimationPath.clear();
        this.lastScatterEvent = null;
    }

    public void setSkipTurn(boolean skip) {
        this.skipTurn = skip;
    }


}