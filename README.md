# Business Requirement Document (BRD) - Dự án Game Ô Ăn Quan: Expansion Edition (Effect Cards)

## 1. Giới thiệu (Introduction)
Dự án này phát triển một hệ thống giải trí (Entertainment system) mô phỏng trò chơi Ô Ăn Quan truyền thống nhưng được tích hợp thêm cơ chế **Thẻ hiệu ứng (Effect Cards)** để tăng tính chiến thuật và sự biến hóa trong lối chơi [5].

## 2. Mục tiêu dự án (Project Goals)
*   **Tính sáng tạo và tiến hóa:** Phát triển dựa trên nền tảng cũ nhưng có khả năng tiến hóa (Evolution) để tích hợp các tính năng mới mà không làm hỏng cấu trúc cốt lõi [6, 7].
*   **Trải nghiệm người dùng:** Đảm bảo tính chấp nhận được (Acceptability) thông qua giao diện trực quan, giúp người chơi dễ dàng nắm bắt các thẻ hiệu ứng mới [3, 8].
*   **Độ tin cậy:** Hệ thống phải xử lý chính xác các logic chồng chéo khi nhiều thẻ hiệu ứng được kích hoạt cùng lúc [2, 9].

## 3. Các bên liên quan (Stakeholders)
*   **Người chơi (End-users):** Đối tượng chính, đòi hỏi tính giải trí và luật chơi công bằng [10].
*   **Nhà phát triển (Developers):** Cần bản đặc tả chi tiết để thiết kế kiến trúc hệ thống linh hoạt [11].
*   **Người thiết kế luật chơi (Game Designer):** Đưa ra các yêu cầu về cân bằng game và thuộc tính thẻ bài.

## 4. Yêu cầu chức năng (Functional Requirements)

### 4.1. Cơ chế chơi cơ bản (Core Gameplay)
*   **Thiết lập bàn cờ:** Khởi tạo 10 ô dân (5 quân mỗi ô) và 2 ô quan [Luật truyền thống].
*   **Rải quân (Sowing):** Cho phép người chơi chọn ô và hướng rải quân (xuôi hoặc ngược chiều kim đồng hồ).
*   **Tính điểm:** Tự động thu thập quân và cộng điểm khi đạt điều kiện "ăn" quân.

### 4.2. Hệ thống Thẻ hiệu ứng (Effect Card System) - *Tính năng mở rộng*
*   **Khởi tạo thẻ:** Mỗi người chơi bắt đầu ván đấu với một số lượng thẻ ngẫu nhiên từ bộ bài chung.
*   **Kích hoạt thẻ:** Người chơi có thể sử dụng thẻ trước hoặc sau khi thực hiện lượt rải quân (tùy loại thẻ).
*   **Các loại hiệu ứng (Ví dụ):**
    *   *Thẻ "Đổi chiều":* Đổi hướng rải quân ngay lập tức.
    *   *Thẻ "Lá chắn":* Bảo vệ một ô dân khỏi bị đối phương ăn trong 1 lượt.
    *   *Thẻ "Thêm quân":* Thêm 1-2 quân vào một ô bất kỳ.
*   **Quản lý lượt:** Hệ thống phải kiểm soát việc sử dụng thẻ để không vi phạm quy trình lượt chơi đã định nghĩa [12, 13].

## 5. Yêu cầu phi chức năng (Non-functional Requirements)

### 5.1. Khả năng bảo trì (Maintainability)
*   Kiến trúc phần mềm phải được thiết kế theo dạng Module (ví dụ: dùng Pattern Observer hoặc MVC) để dễ dàng thêm các loại thẻ hiệu ứng mới trong tương lai mà không cần viết lại mã nguồn cơ bản [2, 14, 15].

### 5.2. Hiệu quả (Efficiency)
*   Việc xử lý các hiệu ứng đồ họa của thẻ bài không được gây trễ (lag) làm ảnh hưởng đến luồng xử lý logic của game [3, 16].

### 5.3. Tính đúng đắn (Dependability)
*   Hệ thống phải có cơ chế kiểm tra điều kiện (Validation) để tránh việc sử dụng thẻ sai luật hoặc gây lỗi trạng thái bàn cờ [2, 17].

## 6. User Stories (Tiếp cận Agile)
Dựa trên lý thuyết Agile, yêu cầu được mô tả qua góc nhìn người dùng [18, 19]:
*   **Là một người chơi**, tôi muốn rút thẻ hiệu ứng ngẫu nhiên để mỗi ván đấu đều có sự khác biệt và thú vị.
*   **Là một người chơi**, tôi muốn xem mô tả của thẻ hiệu ứng trước khi sử dụng để tránh nhầm lẫn chiến thuật.
*   **Là một người chơi**, tôi muốn hệ thống hiển thị rõ ô nào đang chịu ảnh hưởng của thẻ hiệu ứng (ví dụ: đang được bảo vệ).

## 7. Mô hình hệ thống (System Modeling)
*   **Context Model:** Chỉ ra sự tương tác giữa Người chơi - Giao diện Game - Bộ quản lý thẻ bài [20].
*   **State Diagram:** Mô tả các trạng thái của ván đấu: *Chờ lượt -> Chọn ô -> Chọn thẻ -> Rải quân -> Kiểm tra hiệu ứng -> Kết thúc lượt* [13, 21].

## 8. Kế hoạch kiểm thử (Testing Plan)
*   **Unit Testing:** Kiểm tra từng hiệu ứng thẻ bài riêng lẻ [22, 23].
*   **Component Testing:** Kiểm tra sự tương tác giữa thẻ hiệu ứng và logic rải quân truyền thống [24].
*   **User Testing (Alpha/Beta):** Cho phép người chơi trải nghiệm để đánh giá độ cân bằng của các thẻ bài mới [25].
C
