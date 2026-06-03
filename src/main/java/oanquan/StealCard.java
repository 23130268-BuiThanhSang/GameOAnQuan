package oanquan;

public class StealCard extends Card {

    public StealCard() {
        super(
                "STEAL_CARD",
                "Steal Card",
                "Steal 1 random card from opponent.",
                7,
                new StealCardEffect()
        );
    }

    @Override
    public void addCard(Player player) {
        player.cardInventory.add(
                this.id
        );
    }
}

class StealCardEffect extends Effect {
    @Override
    public void trigger(GameManager game, Turn currentTurn) {
        Player caster = game.currentPlayer;
        Player opponent = (caster == game.player1)? game.player2: game.player1;

        if(opponent.cardInventory.isEmpty()){
            return;
        }

        int randomIndex = (int)(Math.random()*opponent.cardInventory.size());
        String stolenCard =opponent.cardInventory.remove(randomIndex);
        caster.cardInventory.add(stolenCard);
    }
}
