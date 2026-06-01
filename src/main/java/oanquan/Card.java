package oanquan;

public abstract class Card {
    public String id;
    public String name;
    public String description;
    public int cost;

    public Effect effect;

    public Card(String id, String name, String description, int cost, Effect effect) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.effect = effect;
    }

    public abstract void addCard(Player player);
}