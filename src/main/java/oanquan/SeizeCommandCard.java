package oanquan;

public class SeizeCommandCard extends Card{
        public SeizeCommandCard() {
            super(
                    "SEIZE_COMMAND",
                    "Seize Command",
                    "Cướp lấy lượt của đối thủ.",
                    9,
                        null
//                    new SeizeCommandEffect()
            );
        }
    @Override
    public void addCard(Player player) {

    }
}

/**
 * back end effect for Seize Command card - when triggered, it will change the current player to the one who used the card and skip the current turn of the original player. It also resets the turn state to ensure that the new current player can act immediately.
 */
//class SeizeCommandEffect extends Effect {
//    public SeizeCommandEffect() {
//        this.haveLimit = false;
//        this.turnleft = 0;
//    }
//
//    @Override
//    public void trigger(GameManager game, Turn currentTurn) {
//       Player playerUsingCard = currentTurn.player;
//        //this is my turn not action
//       if (game.currentPlayer == playerUsingCard) {
//           return;
//       }
//
//        //seize the command and claim the right to act before all others
//       game.setCurrentPlayer(playerUsingCard);
//
//        game.setSkipTurn(true);
//
//
//       game.resetTurnState();
//
//
//    }
//}