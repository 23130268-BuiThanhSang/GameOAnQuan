package oanquan;

public class DoubleCaptureCard extends Card {

    public DoubleCaptureCard() {
        super(
                "DOUBLE_CAPTURE",
                "Double Capture",
                "Activate to double your points in the next turn.",
                5,
                null
        );
    }

    @Override
    public void addCard(Player player) {
        player.doubleScoreNextMove = true;
    }
}