package oanquan;

public class TileDto {
    public int mandarinPieces;
    public int citizenPieces;
    public double mult;
    public int lockedTurns;

    public TileDto(int mandarinPieces, int citizenPieces, double mult,int lockedTurns) {
        this.mandarinPieces = mandarinPieces;
        this.citizenPieces = citizenPieces;
        this.mult = mult;
        this.lockedTurns = lockedTurns;
    }
}