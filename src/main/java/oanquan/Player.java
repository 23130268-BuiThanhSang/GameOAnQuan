package oanquan;

import java.util.*;

public class Player {

    // Kho thẻ kỹ năng của người chơi
    public List<String> cardInventory = new ArrayList<>();

    // Nếu true thì lượt đi tiếp theo được nhân đôi điểm ăn được
    public boolean doubleScoreNextMove = false;

    public String name;
    public double score;
    public int playerId;
    int capturedCount = 0;
    public Map<TriggerTime, List<Effect>> activeEffects;

    public Player(String name, int playerId) {
        this.name = name;
        this.playerId = playerId;
        this.score = 0;

        this.activeEffects = new HashMap<>();
        for (TriggerTime time : TriggerTime.values()) {
            activeEffects.put(time, new ArrayList<>());
        }
    }
}