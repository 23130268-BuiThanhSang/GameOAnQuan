/**
 * js/api/apiClient.js
 * Quản lý giao tiếp với Backend Java
 */

const ApiClient = {
    async sendMove(startIndex, direction) {
        try {
            const response = await fetch(`${API_BASE_URL}/move`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    startIndex: startIndex,
                    direction: direction
                })
            });

            if (!response.ok) {
                throw new Error("Lỗi kết nối đến Server!");
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error("API Error:", error);
            alert("Không thể kết nối đến Máy chủ Game. Vui lòng bật Backend!");
            return null;
        }
    }
};