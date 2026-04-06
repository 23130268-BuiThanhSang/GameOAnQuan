package oanquan;

public abstract class Effect {
    public boolean haveLimit;
    public int turnleft;
    public abstract void trigger(GameManager game, Turn currentTurn);
}
