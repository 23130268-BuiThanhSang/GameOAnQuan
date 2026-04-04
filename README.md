# 🚀 Kiến Trúc Tổng Thể & Hướng Dẫn Tích Hợp: Dự Án Game Ô Ăn Quan

Tài liệu này mô tả kiến trúc hệ thống, công nghệ sử dụng và sự phân chia trách nhiệm (Separation of Concerns) giữa các phân hệ trong dự án Game Ô Ăn Quan. Dự án được phát triển theo mô hình **Client - Server (Web Application)**.

---

## 1. Kiến Trúc Hệ Thống (System Architecture)

Hệ thống được thiết kế theo kiến trúc phân tách hoàn toàn (Decoupled Architecture) giữa Frontend và Backend. Hai phân hệ này hoạt động độc lập và chỉ giao tiếp với nhau thông qua mạng bằng **RESTful API**.

* **Frontend (Client Layer):** Chịu trách nhiệm hiển thị giao diện, tiếp nhận tương tác của người chơi, diễn hoạt (animation) và hiệu ứng hình ảnh/âm thanh (VFX/SFX).
* **Backend (Core/Logic Layer):** Đóng vai trò là Game Engine, xử lý tính toán luật chơi, quản lý trạng thái trận đấu (Game State) và trả về kết quả cho Client.

---

## 2. Stack Công Nghệ (Tech Stack)

### 2.1. Phân hệ Frontend
* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Animation Engine:** GSAP (GreenSock Animation Platform) - Xử lý chuyển động mượt mà và đồng bộ hóa các chuỗi hiệu ứng (Timeline).
* **Format Giao tiếp:** JSON.

### 2.2. Phân hệ Backend
* **Core:** Java Core (JDK 21).
* **Web Framework:** Spring Boot (Khuyến nghị sử dụng để xây dựng RESTful API một cách nhanh chóng và chuẩn hóa).

---

## 3. Phân Công Nhiệm Vụ & Định Hướng Phát Triển

Để đảm bảo hiệu suất và tránh xung đột code, quy trình phát triển được chia làm 2 luồng độc lập như sau:

### 3.1. Nhiệm vụ của Backend Team
Backend sẽ tập trung 100% vào Business Logic (Luật chơi) và cung cấp Data. **Không** xử lý bất kỳ yếu tố nào liên quan đến hiển thị UI (View).

1. **Dừng sử dụng UI Desktop:** Loại bỏ hoàn toàn sự phụ thuộc vào thư viện Java Swing (ví dụ: `GameWindow.java`). Trạng thái game sẽ được trả ra dưới dạng chuỗi JSON thay vì vẽ lên Window.
2. **Đóng gói Web API:** Sử dụng Spring Boot để bọc các class logic hiện tại (như `GameManager`) thành các API Endpoints (VD: `POST /api/game/move`).
3. **Hoàn thiện Core Logic:** Xử lý triệt để các luật chơi đặc biệt (ăn liên tiếp, mất lượt, điều kiện thắng/thua).
4. **Phát triển Hệ thống Kỹ năng (Skill/Card System):** Tiếp tục mở rộng hệ thống dựa trên nền tảng `TriggerTime`, `Card`, và `Effect` đã được thiết kế rất tốt trong mã nguồn hiện tại.
5. **Cập nhật Dữ liệu "Đường đi" (Animation Path):** Trong hàm tính toán rải quân (VD: `playTurn`), thay vì chỉ cập nhật số lượng cuối cùng, Backend cần lưu lại thứ tự các ô cờ mà ngọc đã đi qua thành một danh sách (ví dụ: `List<Integer> animationPath`) và trả về trong JSON. Điều này là **bắt buộc** để Frontend có thể diễn hoạt bàn tay bay chính xác qua từng ô.

### 3.2. Nhiệm vụ của Frontend Team
Frontend phụ trách lớp Hiển thị (Presentation Layer) và Vận hành (DevOps).

1. **Xây dựng Giao diện (UI/UX):** Code giao diện bàn cờ, khu vực hiển thị thẻ bài, điểm số và thông tin người chơi.
2. **Xử lý Hoạt ảnh (Animation/VFX):** Sử dụng GSAP để diễn hoạt quá trình rải quân dựa trên `animationPath` nhận được từ Backend. Kết hợp âm thanh và hiệu ứng hạt (Ripple/Glow) khi dùng kỹ năng.
3. **Tích hợp API (Integration):** Viết các module Client để kết nối, gửi dữ liệu lượt đi và phân tích (parse) trạng thái Game State từ Backend trả về.
4. **Triển khai (Deployment):** Setup môi trường, cấu hình CORS và đưa cả Frontend lẫn Backend lên các server hosting (Ví dụ: Vercel cho Frontend, Render/Railway cho Backend).

---

## 4. Cấu Trúc Dữ Liệu Giao Tiếp Dự Kiến (API Contract Draft)

Dưới đây là ví dụ minh họa về cấu trúc JSON mà Backend dự kiến sẽ trả về cho Frontend sau mỗi lượt đi hợp lệ:

```json
{
  "status": "success",
  "currentPlayer": 2,
  "scores": {
    "player1": 150,
    "player2": 200
  },
  "board": {
    "quan-left": { "mandarinPieces": 1, "citizenPieces": 5, "mult": 2.0 },
    "dan-1": { "mandarinPieces": 0, "citizenPieces": 0, "mult": 1.0 },
    "dan-2": { "mandarinPieces": 0, "citizenPieces": 6, "mult": 1.5 }
  },
  "animationPath": ["dan-1", "dan-2", "dan-3", "dan-4", "quan-right"],
  "message": "Player 1 captured 10 pieces!"
}
