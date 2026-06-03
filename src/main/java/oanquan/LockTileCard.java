package oanquan;

public class LockTileCard extends Card {

    public LockTileCard() {
        super(
                "LOCK_TILE",
                "Lệnh Bài Cấm Vận",
                "Khóa 1 ô của đối phương trong 3 lượt. Không thể rải quân hay bốc quân tại đây!",
                1,
                null
        );
    }

    @Override
    public void addCard(Player player) {
    }
}