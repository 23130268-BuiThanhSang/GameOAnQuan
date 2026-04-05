package oanquan;

import java.util.Random;

public class Tile {
    public int id;
    public boolean isMandarin;
    public int citizenPieces;
    public int mandarinPieces;
    public double mult;
    public Tile(int id, boolean isMandarin) {
        this.id = id;
        this.isMandarin = isMandarin;
        Random rand = new Random();
        this.mult = rand.nextInt(1,5);
        if (isMandarin) {
            this.citizenPieces = 0;
            this.mandarinPieces = 1;
        } else {
            this.citizenPieces = 5;
            this.mandarinPieces = 0;
        }
    }

    public int pickUpPieces() {
        int total = (citizenPieces + (mandarinPieces * 10));
        this.citizenPieces = 0;
        this.mandarinPieces = 0;
        return total;
    }
    public double calcScore(){
        return (citizenPieces + (mandarinPieces * 10))*mult;
    }
}