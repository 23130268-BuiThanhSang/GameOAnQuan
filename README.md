Business Requirement Document (BRD) - Dự án Game Ô Ăn Quan: Expansion Edition (Effect Cards)

1. Lời nói đầu (Preface) [1]
Tài liệu này xác định các yêu cầu nghiệp vụ và kỹ thuật cho dự án trò chơi "Ô Ăn Quan" phiên bản số hóa. Đối tượng đọc chính là giảng viên hướng dẫn và sinh viên thực hiện dự án.
Phiên bản: 1.0
Trạng thái: Bản thảo đồ án môn học.

3. Giới thiệu (Introduction) [2]
Dự án này phát triển một hệ thống giải trí (Entertainment system) mô phỏng trò chơi Ô Ăn Quan truyền thống nhưng được tích hợp thêm cơ chế Thẻ hiệu ứng (Effect Cards) và hệ số điểm để tăng tính chiến thuật và sự biến hóa trong lối chơi.

4. Thuật ngữ (Glossary) [3]
Ô Quan: Hai ô hình bán nguyệt ở hai đầu bàn cờ.
Ô Dân: 10 ô hình vuông chia đều cho hai người chơi.
Rải quân: Hành động lấy quân từ một ô và rải lần lượt vào các ô kế tiếp.
Thẻ Sự Kiện: Các hiệu ứng đặc biệt làm thay đổi luật chơi tạm thời hoặc vĩnh viễn khi áp dụng.

5. Định nghĩa yêu cầu người dùng (User Requirements Definition) [4]
Dịch vụ cung cấp:
Người chơi có thể chọn ô, chọn hướng đi và thực hiện rải quân đúng luật.
Hệ thống tự động tính điểm và nhận diện các tình huống "ăn quân", "ăn chuỗi".
Mỗi người chơi được rút 1 thẻ sự kiện ngẫu nhiên sau mỗi 3 lượt đi.
Yêu cầu phi chức năng [5]:
Khả năng bảo trì (Maintainability): Kiến trúc phần mềm phải được thiết kế theo dạng Module (ví dụ: dùng Pattern Observer hoặc MVC) để dễ dàng thêm các loại thẻ hiệu ứng mới trong tương lai mà không cần viết lại mã nguồn cơ bản.
Hiệu quả (Efficiency): Việc xử lý các hiệu ứng đồ họa của thẻ bài không được gây trễ (lag) làm ảnh hưởng đến luồng xử lý logic của game.
Tính đúng đắn (Dependability): Hệ thống phải có cơ chế kiểm tra điều kiện (Validation) để tránh việc sử dụng thẻ sai luật hoặc gây lỗi trạng thái bàn cờ.

6. Kiến trúc hệ thống (System Architecture) [6]
Hệ thống được thiết kế theo mô hình MVC (Model-View-Controller):
Model: Quản lý mảng dữ liệu bàn cờ (12 ô), số lượng quân và danh sách thẻ sự kiện.
View: Hiển thị bàn cờ, hiệu ứng di chuyển và bảng thông báo sự kiện.
Controller: Xử lý logic rải quân, kiểm tra va chạm, áp dụng hiệu ứng thẻ bài, tính toán điểm số cuối cùng và chuyển lượt.

7. Đặc tả yêu cầu hệ thống (System Requirements Specification) [7]
7.1. Logic trò chơi & Hệ số điểm
Khởi tạo: 10 ô dân (5 dân/ô), 2 ô quan (1 quan/ô).
Hệ số điểm (New): Mỗi ô chứa dân sẽ có hệ số điểm xuất hiện ngẫu nhiên từ x1 đến x5.
Công thức tính điểm: Điểm lượt ăn = (Số lượng dân ăn được) x (Hệ số điểm tại ô đó).
Luật ăn quân: Ăn khi phía sau ô rải xong là 1 ô trống, tiếp theo là 1 ô có quân.
7.2. Cơ chế Thẻ Sự Kiện (Mở rộng) [8]
Thẻ "Đổi chiều": Buộc đối thủ đi ngược hướng đã chọn.
Thẻ "Hố sâu": Đặt bẫy tại ô trống, tiêu diệt quân khi đi vào.
Thẻ "Ngắt lượt": Dừng hành động rải quân ngay lập tức khi gặp ô này.

8. User Stories (Tiếp cận Agile) [9, 10]
Dựa trên lý thuyết Agile, yêu cầu được mô tả qua góc nhìn người dùng:
Là một người chơi, tôi muốn rút thẻ hiệu ứng ngẫu nhiên để mỗi ván đấu đều có sự khác biệt và thú vị.
Là một người chơi, tôi muốn xem mô tả của thẻ hiệu ứng trước khi sử dụng để tránh nhầm lẫn chiến thuật.
Là một người chơi, tôi muốn hệ thống hiển thị rõ ô nào đang chịu ảnh hưởng của thẻ hiệu ứng (ví dụ: đang được bảo vệ).
Là người chơi, tôi muốn thấy rõ ô nào đang có hệ số điểm cao để ưu tiên tấn công.

10. Mô hình hệ thống (System Models) [11]
Context Model: Chỉ ra sự tương tác giữa Người chơi - Giao diện Game - Bộ quản lý thẻ bài.
State Diagram: Mô tả các trạng thái của ván đấu: Chờ lượt -> Chọn ô -> Chọn thẻ -> Rải quân -> Kiểm tra hiệu ứng -> Kết thúc lượt.

12. Phát triển hệ thống (System Evolution) [12]
Dự kiến thay đổi: Nâng cấp AI để người dùng có thể chơi với máy.
Mở rộng: Thêm chế độ chơi qua mạng LAN hoặc tích hợp bảng xếp hạng online.

13. Kế hoạch kiểm thử (Testing Plan) [13]
Unit Testing: Kiểm tra từng hiệu ứng thẻ bài riêng lẻ.
Component Testing: Kiểm tra sự tương tác giữa thẻ hiệu ứng và logic rải quân truyền thống.
User Testing (Alpha/Beta): Cho phép người chơi trải nghiệm để đánh giá độ cân bằng của các thẻ bài mới.

14. Phụ lục (Appendices) [14]
Yêu cầu phần cứng: Máy tính có cài đặt môi trường chạy (JVM cho Java, .NET cho C#, hoặc trình duyệt cho Web).
Thiết kế Database (nếu có): Lưu cấu hình các loại thẻ sự kiện dưới dạng file JSON.

