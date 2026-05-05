```mermaid
---
title: STATE DIAGRAM - CÁC TRẠNG THÁI VÁN ĐẤU Ô ĂN QUAN
---
stateDiagram-v2
    [*] --> Initializing: Bắt đầu game
    
    Initializing --> WaitingForTurn: Khởi tạo bàn cờ & Hệ số (x1-x5)
    
    state WaitingForTurn {
        [*] --> CheckTurnCondition
        CheckTurnCondition --> DrawingCard: Lượt đi là bội số của 3
        CheckTurnCondition --> PlayerReady: Lượt đi bình thường
        DrawingCard --> PlayerReady: Thẻ đã vào kho
    }

    WaitingForTurn --> SelectingMove: Đến lượt người chơi
    
    state SelectingMove {
        [*] --> BrowsingCards: Xem mô tả thẻ
        BrowsingCards --> ApplyingEffect: Kích hoạt thẻ (Tùy chọn)
        ApplyingEffect --> ChoosingPit: Thẻ đã áp dụng hiệu ứng
        BrowsingCards --> ChoosingPit: Chọn ô dân trực tiếp
    }

    SelectingMove --> Sowing: Đã chọn ô & Hướng đi

    state Sowing {
        [*] --> DroppingSeed: Rải 1 quân vào ô kế
        DroppingSeed --> ValidatingEffect: Kiểm tra bẫy/ngắt lượt
        ValidatingEffect --> DroppingSeed: Ô an toàn & Còn quân
        ValidatingEffect --> FinishedSowing: Gặp thẻ "Ngắt lượt" hoặc hết quân
    }

    Sowing --> ProcessingResult: Rải xong hạt cuối cùng

    state ProcessingResult {
        [*] --> CheckingCapture: Ô kế tiếp trống?
        CheckingCapture --> CalculatingScore: Ô tiếp theo nữa có quân (Ăn quân)
        CalculatingScore --> UpdatingBoard: Cộng (Số quân x Hệ số)
        UpdatingBoard --> CheckingCapture: Kiểm tra ăn chuỗi
        CheckingCapture --> TurnEnding: Không thể ăn thêm
    }

    ProcessingResult --> CheckingGameOver: Kết thúc hành động
    
    CheckingGameOver --> WaitingForTurn: Bàn cờ còn dân
    CheckingGameOver --> GameOver: Hết dân trên 10 ô
    
    GameOver --> [*]: Hiển thị kết quả chung cuộc
    ```
