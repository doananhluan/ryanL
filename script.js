const openModalBtn = document.getElementById('openModalBtn');
        const dialogModal = document.getElementById('dialogModal');
        const modalContent = dialogModal.querySelector('.modal-content');
        const dialogTitle = document.getElementById('dialogTitle');
        const dialogMessage = document.getElementById('dialogMessage');
        const yesBtn = document.getElementById('yesBtn');
        const noBtn = document.getElementById('noBtn');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText'); // Phần tử text trong notification
        const continueBtn = document.getElementById('continueBtn'); // Nút Tiếp tục
        const modalCloseBtn = document.getElementById('modalCloseBtn'); // Nút đóng mới

        let noClickCount = 0; // Biến đếm số lần click nút "Không"
        let notificationTimeoutId; // Lưu ID của setTimeout để có thể xóa

        // Nội dung mặc định ban đầu của đoạn hội thoại dài
        const defaultLongMessage = `Chào mừng bạn đến với hộp thoại tùy chỉnh của chúng tôi! Đây là một đoạn văn bản mẫu khá dài để minh họa chức năng cuộn khi nội dung vượt quá kích thước cho phép. Điều này đảm bảo rằng tất cả thông tin quan trọng sẽ luôn hiển thị đầy đủ cho người dùng, bất kể độ dài của đoạn hội thoại.
                    <br><br>
                    Trong nhiều trường hợp, bạn có thể cần hiển thị các điều khoản sử dụng, chính sách bảo mật, hoặc một mô tả chi tiết về một hành động nào đó. Việc có thanh cuộn tự động sẽ giúp trải nghiệm người dùng mượt mà hơn rất nhiều, tránh việc nội dung bị cắt cụt và buộc người dùng phải đoán hoặc tìm cách khác để đọc.
                    <br><br>
                    Hãy thử kéo thanh cuộn hoặc sử dụng con lăn chuột của bạn để xem toàn bộ nội dung. Bạn cũng có thể điều chỉnh chiều cao tối đa của vùng văn bản cuộn trong CSS (lớp \`.dialog-text-scrollable\`) để phù hợp với thiết kế tổng thể của ứng dụng hoặc trang web của bạn.
                    <br><br>
                    Ngoài ra, chúng tôi đã thêm một nút đóng rõ ràng ở góc trên bên phải của hộp thoại này để bạn có thể dễ dàng thoát khỏi nó. Đây là một yếu tố UI quan trọng giúp người dùng cảm thấy có quyền kiểm soát.
                    <br><br>
                    Cảm ơn bạn đã thử nghiệm! Chúng tôi hy vọng tính năng này hữu ích cho dự án của bạn.`;


        // Hàm hiển thị modal
        function showModal(title = "Xác Nhận Hành Động", message = defaultLongMessage) { // Sử dụng defaultLongMessage làm mặc định
            dialogTitle.textContent = title;
            dialogMessage.innerHTML = message; // Dùng innerHTML để hiển thị <br>
            dialogModal.classList.remove('hidden');
            // Re-enable "No" button and reset its style when showing modal
            noBtn.disabled = false;
            noBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            noClickCount = 0; // Reset noClickCount here as well for a fresh start

            setTimeout(() => {
                dialogModal.classList.add('show');
                modalContent.classList.add('show');
            }, 10);
        }

        // Hàm ẩn modal
        function hideModal() {
            dialogModal.classList.remove('show');
            modalContent.classList.remove('show');
            setTimeout(() => {
                dialogModal.classList.add('hidden');
                noClickCount = 0; // Reset số lần click khi đóng modal
                noBtn.disabled = false; // Re-enable "No" button
                noBtn.classList.remove('opacity-50', 'cursor-not-allowed'); // Reset style
                // Reset nội dung về ban đầu
                dialogTitle.textContent = "Xác Nhận Hành Động";
                dialogMessage.innerHTML = defaultLongMessage;
            }, 300);
        }

        // Hàm hiển thị thông báo
        function showNotification(message, showContinueBtn = false) {
            if (notificationTimeoutId) {
                clearTimeout(notificationTimeoutId); // Xóa timeout cũ nếu có
            }
            notificationText.textContent = message;
            if (showContinueBtn) {
                continueBtn.classList.remove('hidden'); // Hiển thị nút Tiếp tục
            } else {
                continueBtn.classList.add('hidden'); // Ẩn nút Tiếp tục
            }

            notification.classList.add('show');
            if (!showContinueBtn) { // Nếu không có nút Tiếp tục, tự động ẩn
                notificationTimeoutId = setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        }

        // Lắng nghe sự kiện click vào nút "Mở Hộp Thoại"
        openModalBtn.addEventListener('click', () => {
            showModal(); // Mở hộp thoại với nội dung mặc định ban đầu (có đoạn dài)
        });

        // Lắng nghe sự kiện click vào nút "Có"
        yesBtn.addEventListener('click', () => {
            hideModal();
            showNotification('Bạn đã chọn: Có! Nhấn Tiếp tục để đến trang mới.', true); // Hiển thị nút Tiếp tục
        });

        // Lắng nghe sự kiện click vào nút "Không"
        noBtn.addEventListener('click', () => {
            noClickCount++;
            let currentDialogMessage = '';

            if (noClickCount === 1) {
                currentDialogMessage = 'Bạn đã chọn Không lần 1. Bạn có muốn suy nghĩ lại không?';
            } else if (noClickCount === 2) {
                currentDialogMessage = 'Bạn đã chọn Không lần 2. Quyết định cuối cùng chứ?';
            } else if (noClickCount === 3) {
                currentDialogMessage = 'Bạn đã chọn Không lần 3. Hãy cân nhắc kỹ!';
            } else { // noClickCount >= 4
                currentDialogMessage = `Bạn đã chọn Không ${noClickCount} lần. Nút "Không" đã bị vô hiệu hóa.`;
            }

            dialogMessage.textContent = currentDialogMessage; // Cập nhật nội dung đoạn thoại
            showNotification(`Bạn đã chọn: Không! (Lần ${noClickCount})`); // Hiển thị thông báo (không có nút tiếp tục)

            if (noClickCount >= 4) { // Check AFTER noClickCount is incremented
                noBtn.disabled = true;
                noBtn.classList.add('opacity-50', 'cursor-not-allowed'); // Apply Tailwind classes
            }
        });

        // Lắng nghe sự kiện click vào nút "Tiếp tục" trong thông báo
        continueBtn.addEventListener('click', () => {
            notification.classList.remove('show'); // Ẩn thông báo
            continueBtn.classList.add('hidden'); // Ẩn nút Tiếp tục
            window.location.href = 'https://www.google.com'; // Chuyển hướng tới trang web khác
        });

        // Lắng nghe sự kiện click vào nút đóng mới trong modal
        modalCloseBtn.addEventListener('click', () => {
            hideModal();
        });

        // Lắng nghe sự kiện click ra ngoài vùng nội dung modal để đóng modal
        dialogModal.addEventListener('click', (e) => {
            if (e.target === dialogModal) { // Chỉ đóng khi click trực tiếp vào overlay
                hideModal();
            }
        });

        // Lắng nghe sự kiện nhấn phím Escape để đóng modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dialogModal.classList.contains('show')) {
                hideModal();
            }
        });
