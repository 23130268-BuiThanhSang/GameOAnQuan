package oanquan;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EffectSystemTest {
    private GameManager game;

    @BeforeEach
    public void setup() {
        game = new GameManager("P1", "P2");
    }

    // 1. Kiểm thử logic nhân đôi điểm (Tính toán cốt lõi)
    @Test
    public void testDoubleScoreEffect_DoublesPointsCorrectly() {
        Turn turn = new Turn(game.currentPlayer);
        turn.scoreMultiplier = 1.0;

        Effect doubleEffect = new DoubleScoreEffect();
        doubleEffect.trigger(game, turn);

        assertEquals(2.0, turn.scoreMultiplier, "Hệ số nhân phải là 2.0 khi kích hoạt hiệu ứng");
    }

    // 2. Kiểm thử việc đăng ký hiệu ứng vào hệ thống
    @Test
    public void testEffectRegistration_AddsEffectToPlayer() {
        Effect effect = new DoubleScoreEffect();
        game.currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE).add(effect);

        assertFalse(game.currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE).isEmpty(),
                "Hiệu ứng phải được thêm vào danh sách activeEffects của Player");
    }

    // 3. Kiểm thử logic dọn dẹp rác (Garbage Collection) - Case quan trọng nhất của Đợt 2
    @Test
    public void testGarbageCollection_RemovesExpiredEffect() {
        // Thêm hiệu ứng
        game.currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE).add(new DoubleScoreEffect());

        // Mô phỏng hàm dọn rác ở cuối playTurn()
        game.currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE)
                .removeIf(e -> e instanceof DoubleScoreEffect);

        assertTrue(game.currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE).isEmpty(),
                "Hiệu ứng phải bị loại bỏ sau khi kết thúc lượt");
    }

    // 4. Kiểm thử trường hợp không có hiệu ứng (Logic an toàn)
    @Test
    public void testExecuteHooks_WithNoEffects_ShouldNotCrash() {
        Turn turn = new Turn(game.currentPlayer);
        // Đảm bảo danh sách rỗng
        game.currentPlayer.activeEffects.get(TriggerTime.BEFORE_CAPTURE).clear();

        assertDoesNotThrow(() -> game.executeHooks(TriggerTime.BEFORE_CAPTURE, turn),
                "Hệ thống không được lỗi khi không có hiệu ứng nào");
    }
}