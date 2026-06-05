package oanquan;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class CardStorage {
    public static List<Card> allCards() {
        List<Card> cards = new ArrayList<>();

        cards.add(new BonusSeedCard());
        cards.add(new DoubleCaptureCard());
        cards.add(new LockTileCard());
        cards.add(new StealCard());
        cards.add(new SeizeCommandCard());
        cards.add(new RemoveHighestCard());
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
        if ("STEAL_CARD".equals(id)) {
            return new StealCard();
        }
        if ("SEIZE_COMMAND".equals(id)) {
            return new SeizeCommandCard();
        if ("REMOVE_HIGHEST_CARD".equals(id)) {
            return new RemoveHighestCard();
        }
        return null;
    }

    public static Card randomCardExcept(Set<String> excludedIds) {
        List<Card> all = allCards();
        List<Card> available = new ArrayList<>();

        for (Card card : all) {
            if (card != null && card.id != null && (excludedIds == null || !excludedIds.contains(card.id))) {
                available.add(card);
            }
        }

        if (available.isEmpty()) {
            return null;
        }

        Random random = new Random();
        Card selected = available.get(random.nextInt(available.size()));

        return createById(selected.id);
    }
}
