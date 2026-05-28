package oanquan;

import java.util.List;
import java.util.Map;

public class GameTurnResponse {
    public String status;
    public int currentPlayer;
    public Map<String, Integer> scores;
    public Map<String, TileDto> board;
    public List<String> animationPath;
    public String message;
    public Map<String, Integer> capturedCount;

    public String winner;
    public String scatterEvent;

    public int halfMoveCount;
    public int fullTurnCount;

    public boolean inShop;
    public int shopEventId;
    public boolean p1ShopDone;
    public boolean p2ShopDone;
    public List<CardOptionDto> p1ShopOptions, p2ShopOptions;

    public static class CardOptionDto {
        public String id;
        public String name;
        public String description;
        public int cost;

        public CardOptionDto() {}

        public CardOptionDto(String id, String name, String description, int cost) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.cost = cost;
        }
    }
}