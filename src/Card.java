public abstract class Card {
    public Effect effect;

    public Card(Effect effect) {
        this.effect = effect;
    }
    public abstract void addCard(Player _player);
}
