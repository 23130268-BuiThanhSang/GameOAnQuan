# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## Hệ thống: Game Ô Ăn Quan (Web-based)

---

## 1. Preface (Giới thiệu tài liệu)

Tài liệu này mô tả các yêu cầu nghiệp vụ (business requirements) cho hệ thống game Ô ăn quan dạng web (Client–Server). 

### 1.1. Đối tượng đọc:
- 1.1.1. Stakeholders (giảng viên, khách hàng mô phỏng). 
- 1.1.2. Developer (frontend/backend). 
- 1.1.3. Tester. 

### 1.2. Mục đích:
- 1.2.1. Xác định rõ mục tiêu sản phẩm. 
- 1.2.2. Định hướng phát triển hệ thống. 
- 1.2.3. Là cơ sở cho SRS và thiết kế sau này. 

---

## 2. Introduction (Tổng quan hệ thống)

### 2.1. Mục tiêu hệ thống

Xây dựng một trò chơi Ô ăn quan online:
- 2.1.1. Mang tính giải trí + giáo dục (trò chơi dân gian). 
- 2.1.2. Có giao diện trực quan, dễ sử dụng. 
- 2.1.3. Có thể chơi nhanh trên trình duyệt. 

### 2.2. Phạm vi hệ thống

Hệ thống bao gồm:
- 2.2.1. Giao diện web (HTML/CSS/JS + GSAP). 
- 2.2.2. Backend xử lý logic game (Java Spring Boot API). 
- 2.2.3. Không yêu cầu database phức tạp (có thể dùng LocalStorage). 

### 2.3. Giá trị mang lại
- 2.3.1. Bảo tồn trò chơi dân gian Việt Nam. 
- 2.3.2. Trải nghiệm game đơn giản nhưng có chiều sâu chiến thuật. 
- 2.3.3. Phù hợp học lập trình game cơ bản. 

---

## 3. Glossary (Thuật ngữ)

| Chỉ mục | Thuật ngữ | Ý nghĩa |
|--------|----------|--------|
| 3.1 | Ô ăn quan | Game dân gian Việt Nam |
| 3.2 | Ô dân | Các ô nhỏ chứa quân |
| 3.3 | Ô quan | Ô lớn ở 2 đầu |
| 3.4 | Rải quân | Hành động di chuyển quân |
| 3.5 | Ăn quân | Thu quân vào kho |
| 3.6 | AnimationPath | Dữ liệu đường đi animation |

---

## 4. User Requirements Definition (Yêu cầu người dùng)

### 4.1. Khả năng tương tác của người chơi:
- 4.1.1. Nhập tên và thiết lập ban đầu. 
- 4.1.2. Bắt đầu game / reset game. 
- 4.1.3. Xem luật chơi. 
- 4.1.4. Chọn ô và hướng đi để rải quân. 
- 4.1.5. Quan sát animation trực quan. 
- 4.1.6. Xem điểm số. 

### 4.2. Trải nghiệm mong muốn:
- 4.2.1. Giao diện rõ ràng, dễ hiểu. 
- 4.2.2. Phản hồi nhanh (real-time). 
- 4.2.3. Có hiệu ứng (animation + âm thanh). 
- 4.2.4. Không cần đăng nhập phức tạp. 

---

## 5. System Architecture (Kiến trúc tổng thể)

### 5.1. Thành phần công nghệ:
- 5.1.1. Frontend: HTML, CSS, JavaScript, GSAP. 
- 5.1.2. Backend: Java Spring Boot REST API. 
- 5.1.3. Kiến trúc: Client – Server. 

### 5.2. Luồng chính:
- 5.2.1. Người chơi thao tác trên UI. 
- 5.2.2. Client gửi request (API). 
- 5.2.3. Backend xử lý logic game. 
- 5.2.4. Trả về JSON. 
- 5.2.5. Frontend render + animation. 

---

## 6. System Requirements Specification (Yêu cầu hệ thống)

### 6.1. Functional Requirements (Yêu cầu chức năng)

- **6.1.1. FR1 – Quản lý Menu (UC1).**
  - Hiển thị menu chính
  - Nhập tên người chơi
  - Bật/tắt âm thanh
  - Chuyển màn hình
  - Hiển thị luật chơi (popup/modal)
  - Lưu cấu hình người chơi (LocalStorage)
  - Điều hướng quay lại menu từ màn chơi

- **6.1.2. FR2 – Khởi tạo bàn cờ (UC2).**
  - Tạo 12 ô (10 dân, 2 quan)
  - Reset trạng thái game
  - Hiển thị lại giao diện
  - Gọi API lấy dữ liệu bàn cờ mặc định
  - Khởi tạo điểm số người chơi về 0
  - Render quân vào từng ô theo dữ liệu

- **6.1.3. FR3 – Thực hiện nước đi (UC3).**
  - Chọn ô hợp lệ
  - Chọn hướng rải
  - Gửi request `/move`
  - Kiểm tra tính hợp lệ của nước đi
  - Cập nhật trạng thái bàn cờ sau mỗi lượt
  - Khóa input trong khi đang xử lý lượt
  - Chuyển lượt tiếp theo sau khi hoàn tất

- **6.1.4. FR4 – Logic ăn quân (UC4).**
  - Kiểm tra điều kiện ăn
  - Tính điểm
  - Cập nhật kho người chơi
  - Xử lý ăn quân liên hoàn
  - Áp dụng hệ số nhân (nếu có)
  - Kiểm tra điều kiện kết thúc game
  - Xác định người thắng/thua

- **6.1.5. FR5 – Animation & hiệu ứng (UC5).**
  - Hiển thị chuyển động quân
  - Đồng bộ âm thanh
  - Hiển thị điểm
  - Hiển thị animation theo đường đi (animationPath)
  - Hiệu ứng ăn quân
  - Hiệu ứng kết thúc lượt
  - Callback sau animation để mở khóa lượt 

### 6.2. Non-functional Requirements (Yêu cầu phi chức năng)
- 6.2.1. Hiệu năng: phản hồi < 1s. 
- 6.2.2. UI/UX: dễ dùng, trực quan. 
- 6.2.3. Tương thích: chạy trên Chrome/Edge. 
- 6.2.4. Khả dụng: không crash khi thao tác sai. 
- 6.2.5. Maintainability: code tách frontend/backend rõ ràng. 

---

## 7. System Models (Mô hình hệ thống)

### 7.1. Use Case Diagram  

### 7.2. Sequence Diagram:
- 7.2.1. Menu flow. 
- 7.2.2. Play turn flow. 

### 7.3. Data Flow:
- 7.3.1. Client → API → GameManager → Response. 

---

## 8. System Evolution (Phát triển tương lai)

- 8.1. Multiplayer online. 
- 8.2. AI chơi với máy. 
- 8.3. Lưu lịch sử trận đấu. 
- 8.4. Leaderboard. 
- 8.5. Mobile app version. 

---

## 9. Appendices (Phụ lục)

### 9.1. Công nghệ sử dụng:
- 9.1.1. Frontend: HTML, CSS, JS, GSAP. 
- 9.1.2. Backend: Spring Boot. 
- 9.1.3. API: RESTful. 

### 9.2. Cấu trúc file:
- 9.2.1. js/core/ → logic game. 
- 9.2.2. js/ui/ → render + animation. 
- 9.2.3. api/ → gọi backend. 
- 9.2.4. GameManager.java → xử lý chính. 

---

## 10. Index (Chỉ mục)

- 10.1. Menu → UC1. 
- 10.2. Board → UC2. 
- 10.3. Move → UC3. 
- 10.4. Capture → UC4. 
- 10.5. Animation → UC5. 
