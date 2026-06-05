package oanquan;

public class RemoveHighestCard extends Card {
    public RemoveHighestCard() {
        super(
                "REMOVE_HIGHEST_CARD",
                "Remove Highest Card",
                "Loại bỏ 1 thẻ có giá cao nhất của đối thủ",
                8,
                null

        );
    }

    @Override
    public void addCard(Player player){
        player.cardInventory.add(this.id);
    }
}
