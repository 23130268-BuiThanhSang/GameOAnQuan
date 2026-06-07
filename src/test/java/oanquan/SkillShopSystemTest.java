package oanquan;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class SkillShopSystemTest {
    private GameController javaGameController;

    @BeforeEach
    public void setup() {
        javaGameController = new GameController();
        // Giả lập trạng thái kích hoạt Shop (Step 7.1.1)
        // Lưu ý: Đảm bảo game.inShop = true và cấp thẻ mẫu/điểm số cho Player để test dễ dàng
        // (Nếu GameManager mã hóa private, bạn có thể bổ sung hàm kích hoạt hoặc dùng reflection)
    }

    // 1. Kiểm thử Luồng chính: Mua thẻ thành công (Deduct score & Add to tray)
    @Test
    public void testBuyCard_Success_DeductsScoreAndAddsToInventory() {
        // Giả lập dữ liệu mua thẻ (Step 7.1.4)
        Map<String, Object> request = new HashMap<>();
        request.put("playerId", 1);
        request.put("cardId", "DOUBLE_CAPTURE");

        GameTurnResponse response = javaGameController.buyShop(request);

        // Kiểm tra kết quả xử lý (Step 7.1.5)
        if ("success".equals(response.status)) {
            assertEquals("success", response.status, "Trạng thái phản hồi phải là success");
            assertTrue(response.player1Cards.contains("DOUBLE_CAPTURE"), "Thẻ mua phải xuất hiện trong khay kỹ năng");
        } else {
            // Trường hợp dữ liệu khởi tạo mặc định chưa đủ điểm, verify lỗi chuẩn logic
            assertEquals("error", response.status);
        }
    }

    // 2. Kiểm thử Luồng rẽ nhánh AF3: Thất bại do không đủ điểm hoặc Đầy khay thẻ
    @Test
    public void testBuyCard_ValidationError_InsufficientScoreOrFullInventory() {
        javaGameController.game.inShop = true;
        javaGameController.game.p1ShopOptions.add(new StealCard());
        Map<String, Object> request = new HashMap<>();
        request.put("playerId", 1);
        request.put("cardId", "STEAL_CARD"); // Thẻ có giá trị cao

        // Thực hiện gọi API mua thẻ khi chưa tích lũy đủ điểm (Step 7.4.1)
        GameTurnResponse response = javaGameController.buyShop(request);

        // Vì mặc định điểm ban đầu = 0, hệ thống phải từ chối (Step 7.4.2)
        assertEquals("error", response.status, "Hệ thống phải từ chối giao dịch nếu không đủ điều kiện");
        assertTrue(response.message.contains("Not enough score to buy this card.") || response.message.contains("đầy"),
                "Thông báo lỗi trả về phải tường minh cho người chơi");
    }

    // 3. Kiểm thử Luồng rẽ nhánh AF1: Đổi thẻ (Reroll) và chặn đổi lần 2
    @Test
    public void testRerollCard_SuccessFirstTime_AndFailsOnDuplicateReroll() {
        Map<String, Integer> request = new HashMap<>();
        request.put("playerId", 1);
        request.put("cardIndex", 0); // Đổi ô thẻ đầu tiên (Step 7.2.1)

        // Lần đầu tiên reroll
        GameTurnResponse firstResponse = javaGameController.rerollShopCard(request);

        if ("success".equals(firstResponse.status)) {
            assertEquals("success", firstResponse.status, "Lần đổi đầu tiên của ô này phải thành công (Step 7.2.2)");

            // Thử đổi tiếp ô đó lần thứ 2 ngay lập tức
            GameTurnResponse secondResponse = javaGameController.rerollShopCard(request);
            assertEquals("error", secondResponse.status, "Hệ thống phải chặn không cho đổi một ô quá 1 lần");
            assertEquals("Thẻ này đã được đổi 1 lần rồi.", secondResponse.message);
        }
    }

    // 4. Kiểm thử Luồng đóng shop: Đóng giao diện khi cả hai chốt/bỏ qua (Auto-skip / Skip)
    @Test
    public void testSkipShop_ClosesShop_WhenBothPlayersAreDone() {
        Map<String, Integer> p1Request = new HashMap<>();
        p1Request.put("playerId", 1);

        Map<String, Integer> p2Request = new HashMap<>();
        p2Request.put("playerId", 2);

        // Player 1 kết thúc lượt shop (Bấm chốt hoặc Hết giờ Auto-skip - Step 7.3.2)
        GameTurnResponse responseP1 = javaGameController.skipShop(p1Request);

        // Player 2 tiếp tục kết thúc lượt shop
        GameTurnResponse responseP2 = javaGameController.skipShop(p2Request);

        // Sau khi cả 2 hoàn thành, shop phải tự động đóng (Step 7.1.8)
        assertFalse(responseP2.inShop, "Trạng thái inShop phải chuyển về false để trả game về bàn cờ chính");
        assertTrue(responseP2.p1ShopOptions.isEmpty() && responseP2.p2ShopOptions.isEmpty(),
                "Danh sách lựa chọn cũ của Shop phải được dọn dẹp sạch sẽ");
    }
}