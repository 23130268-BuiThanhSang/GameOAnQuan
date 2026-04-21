/**
 * js/ui/boardRender.js
 * Chịu trách nhiệm render dữ liệu lên DOM
 */

const BoardRender = {
    // Hàm vẽ một ô cờ cụ thể dựa trên dữ liệu TileDto từ Backend
    updateHoleDOM(holeId, tileData) {
        const holeElement = document.getElementById(holeId);
        if (!holeElement) return;

        let innerHTML = '';
        const mandarinCount = tileData.mandarinPieces;
        const citizenCount = tileData.citizenPieces;
        const mult = tileData.mult;

        // 1. Vẽ Hệ số nhân (Mult) nếu > 1
        if (mult > 1.0) {
            innerHTML += `<div class="mult-badge">x${mult}</div>`;
        }

        // 2. Vẽ Ngọc Quan (Nếu có)
        if (mandarinCount > 0) {
            innerHTML += `<img src="assets/images/quan_gem_token.png" class="gem-token quan-gem" style="position: absolute; top: 15%; z-index: 2;">`;
        }

        // 3. Vẽ Ngọc Dân (Xếp chồng)
        if (citizenCount > 0) {
            let stackHTML = `<div class="stacked-view">`;
            // Giới hạn hiển thị tối đa 6 viên để không bị tràn ô
            let renderCount = Math.min(citizenCount, 6);
            for (let i = 0; i < renderCount; i++) {
                let offsetX = (Math.random() - 0.5) * 15; // Rải ngẫu nhiên một chút cho tự nhiên
                let offsetY = (Math.random() - 0.5) * 15;
                stackHTML += `<img src="assets/images/dan_gem_token.png" class="gem-token dan-gem" style="transform: translate(${offsetX}px, ${offsetY}px); z-index: 1;">`;
            }
            if (citizenCount > 6) {
                stackHTML += `<span style="color: #ffd700; font-size: 14px; font-weight: bold; position: absolute; z-index: 3;">+</span>`;
            }
            stackHTML += `</div>`;
            innerHTML += stackHTML;
        }

        // 4. Vẽ Tổng số lượng (Badge đếm)
        const totalPhysicalPieces = mandarinCount + citizenCount;
        innerHTML += `<div class="count-badge">${totalPhysicalPieces}</div>`;

        holeElement.innerHTML = innerHTML;
    },

    // Hàm render toàn bộ bàn cờ và điểm số
    renderFullState(gameState) {
        if (!gameState) return;

        // 1. CẬP NHẬT ĐÈN BÁO LƯỢT CHƠI
        document.getElementById('tray-p1').classList.remove('active-turn');
        document.getElementById('tray-p2').classList.remove('active-turn');

        if (gameState.currentPlayer === 1) {
            document.getElementById('tray-p1').classList.add('active-turn');
        } else if (gameState.currentPlayer === 2) {
            document.getElementById('tray-p2').classList.add('active-turn');
        }
        if (gameState.capturedCount) {
            const p1Captured = document.querySelector("#tray-p1 .captured-box");
            const p2Captured = document.querySelector("#tray-p2 .captured-box");
            if(p1Captured) p1Captured.innerText = `Quân: ${gameState.capturedCount.player1 || 0}`;
            if(p2Captured) p2Captured.innerText = `Quân: ${gameState.capturedCount.player2 || 0}`;
            this.renderCapturedVisuals('tray-p1', gameState.capturedCount.player1 || 0);
            this.renderCapturedVisuals('tray-p2', gameState.capturedCount.player2 || 0);

        }

        // 2. Cập nhật điểm số (Chuẩn ID)
        if (gameState.scores) {
            const p1Score = document.querySelector("#tray-p1 .score-board");
            const p2Score = document.querySelector("#tray-p2 .score-board");
            if(p1Score) p1Score.innerText = `Điểm: ${gameState.scores.player1 || 0}`;
            if(p2Score) p2Score.innerText = `Điểm: ${gameState.scores.player2 || 0}`;
        }

        // 3. Vẽ lại 12 ô cờ
        for (const [holeId, tileData] of Object.entries(gameState.board)) {
            this.updateHoleDOM(holeId, tileData);
        }
    },
    // HÀM MỚI 1: Bốc sạch ngọc ở ô bắt đầu
    clearHole(holeId) {
        const holeElement = document.getElementById(holeId);
        if (!holeElement) return;

        // Giữ lại cái nhãn x2, x3 (emult-badg)
        const multBadge = holeElement.querySelector('.mult-badge');
        let innerHTML = multBadge ? multBadge.outerHTML : '';

        // Cập nhật số về 0
        innerHTML += `<div class="count-badge">0</div>`;
        holeElement.innerHTML = innerHTML;
    },

    // HÀM MỚI 2: Cộng thêm 1 viên ngọc (hiệu ứng thả tức thời)
    incrementHole(holeId) {
        const holeElement = document.getElementById(holeId);
        if (!holeElement) return;

        // Lấy số đếm hiện tại và cộng 1
        const badge = holeElement.querySelector('.count-badge');
        let currentCount = badge ? parseInt(badge.innerText) || 0 : 0;
        currentCount++;

        // Tìm hoặc tạo khay chứa ngọc dân để nhét thêm hình vào
        let stack = holeElement.querySelector('.stacked-view');
        if (!stack) {
            stack = document.createElement('div');
            stack.className = 'stacked-view';
            if (badge) {
                holeElement.insertBefore(stack, badge); // Chèn dưới số đếm
            } else {
                holeElement.appendChild(stack);
            }
        }

        // Tối đa chỉ vẽ 6 viên ngọc
        if (currentCount <= 6) {
            let offsetX = (Math.random() - 0.5) * 15;
            let offsetY = (Math.random() - 0.5) * 15;
            let img = document.createElement('img');
            img.src = 'assets/images/dan_gem_token.png';
            img.className = 'gem-token dan-gem';
            img.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            img.style.zIndex = '1';
            stack.appendChild(img);
        }

        // Cập nhật nhãn số đếm
        if (badge) badge.innerText = currentCount;
    },
    getPieceCount(holeId) {
        const holeElement = document.getElementById(holeId);
        if (!holeElement) return 0;
        const badge = holeElement.querySelector('.count-badge');
        return badge ? parseInt(badge.innerText) || 0 : 0;
    },
    renderCapturedVisuals(trayId, count) {
        const visualContainer = document.querySelector(`#${trayId} .captured-visuals`);
        if (!visualContainer) return;

        visualContainer.innerHTML = ''; // Xóa ngọc cũ
        if (count > 0) {
            // Tối đa hiển thị 8 viên tượng trưng
            let displayCount = Math.min(count, 8);
            for (let i = 0; i < displayCount; i++) {
                let offsetX = (Math.random() - 0.5) * 30 - 12; // Rải ngẫu nhiên trái phải
                let offsetY = (Math.random() - 0.5) * 15 - 12; // Rải ngẫu nhiên lên xuống
                visualContainer.innerHTML += `<img src="assets/images/dan_gem_token.png" style="transform: translate(${offsetX}px, ${offsetY}px); z-index: ${i}">`;
            }
        }
    },

};