package oanquan;

public class DoubleScoreEffect extends Effect {
    public DoubleScoreEffect() {
        this.haveLimit = true;
        this.turnleft = 1;
    }

    @Override
    public void trigger(GameManager game, Turn currentTurn) {
        currentTurn.scoreMultiplier *= 2.0;
    }
}