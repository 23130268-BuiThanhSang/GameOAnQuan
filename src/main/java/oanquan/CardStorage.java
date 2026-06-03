package oanquan;

import java.util.ArrayList;
import java.util.List;

public class CardStorage {
    public static List<Card> allCards() {
        List<Card> cards = new ArrayList<>();

        cards.add(new BonusSeedCard());
        cards.add(new DoubleCaptureCard());
        cards.add(new LockTileCard());
        return cards;
    }

    public static Card createById(String id) {
        if ("BONUS_SEED".equals(id)) {
            return new BonusSeedCard();
        }

        if ("DOUBLE_CAPTURE".equals(id)) {
            return new DoubleCaptureCard();
        }
        if ("LOCK_TILE".equals(id)) {
            return new LockTileCard();
        }
        return null;
    }
}
