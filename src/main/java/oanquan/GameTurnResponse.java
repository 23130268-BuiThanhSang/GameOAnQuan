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
}