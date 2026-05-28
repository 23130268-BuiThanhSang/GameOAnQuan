package oanquan;

public class BonusSeedCard extends Card {
    public BonusSeedCard() {
        super(
                "BONUS_SEED",
                "Bonus Seed",
                "After you pick up a pit, gain +1 extra piece in hand.",
                3,
                new BonusSeedEffect()
        );
    }

    @Override
    public void addCard(Player player) {
        player.activeEffects.get(TriggerTime.AFTER_PICKUP).add(this.effect);
    }
}

class BonusSeedEffect extends Effect {
    public BonusSeedEffect() {
        this.haveLimit = false;
        this.turnleft = 0;
    }

    @Override
    public void trigger(GameManager game, Turn currentTurn) {
        currentTurn.piecesInHand += 1;
    }
}