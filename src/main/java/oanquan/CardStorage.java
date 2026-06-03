package oanquan;

import java.util.ArrayList;
import java.util.List;

public class CardStorage {
    public static List<Card> allCards() {
        List<Card> cards = new ArrayList<>();

        cards.add(new BonusSeedCard());
        cards.add(new DoubleCaptureCard());

        return cards;
    }

    public static Card createById(String id) {
        if ("BONUS_SEED".equals(id)) {
            return new BonusSeedCard();
        }

        if ("DOUBLE_CAPTURE".equals(id)) {
            return new DoubleCaptureCard();
        }

        return null;
    }
}
