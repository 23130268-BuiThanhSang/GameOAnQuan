public class Turn {
    public Player player;
    public int startIndex;
    public int direction;
    public int piecesInHand;
    public int currentTileIndex;

    public Turn(Player player) {
        this.player = player;
    }
}