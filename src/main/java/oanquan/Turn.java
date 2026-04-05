package oanquan;

import java.util.ArrayList;
import java.util.List;

public class Turn {
    public Player player;
    public int startIndex;
    public int direction;
    public int piecesInHand;
    public int currentTileIndex;
    public List<Integer> animationPath;
    public Turn(Player player) {
        this.player = player;
        this.animationPath = new ArrayList<>();
    }
}