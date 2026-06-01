/**
 * js/api/apiClient.js
 * Quản lý giao tiếp với Backend Java
 */

const ApiClient = {
    async sendMove(startIndex, direction) {
        try {
            const response = await fetch(`${API_BASE_URL}/move`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startIndex: startIndex, direction: direction })
            });

            if (!response.ok) throw new Error("Lỗi kết nối đến Server!");
            return await response.json();

        } catch (error) {
            console.error("API Error:", error);
            alert("Không thể kết nối đến Máy chủ Game. Vui lòng bật Backend!");
            return null;
        }
    },

    async sendResign(playerId) {
        try {
            const response = await fetch(`${API_BASE_URL}/resign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId })
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu đầu hàng:", error);
            return null;
        }
    },

    async sendReset() {
        try {
            const response = await fetch(`${API_BASE_URL}/reset`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi reset game:", error);
            return null;
        }
    }
};