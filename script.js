// Lấy các phần tử DOM cần thiết
const openModalBtn = document.getElementById('openModalBtn');
const dialogModal = document.getElementById('dialogModal');
const modalContent = dialogModal.querySelector('.modal-content');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const backBtn = document.getElementById('backBtn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const continueBtn = document.getElementById('continueBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const backgroundMusic = document.getElementById('backgroundMusic');

let noClickCount = 0;
let notificationTimeoutId;

const defaultLongMessage = `Chào mừng bạn đến với hộp thoại tùy chỉnh của chúng tôi! Đây là một đoạn văn bản mẫu khá dài để minh họa chức năng cuộn khi nội dung vượt quá kích thước cho phép. Điều này đảm bảo rằng tất cả thông tin quan trọng sẽ luôn hiển thị đầy đủ cho người dùng, bất kể độ dài của đoạn hội thoại.
            <br><br>
            Trong nhiều trường hợp, bạn có thể cần hiển thị các điều khoản sử dụng, chính sách bảo mật, hoặc một mô tả chi tiết về một hành động nào đó. Việc có thanh cuộn tự động sẽ giúp trải nghiệm người dùng mượt mà hơn rất nhiều, tránh việc nội dung bị cắt cụt và buộc người dùng phải đoán hoặc tìm cách khác để đọc.
            <br><br>
            Hãy thử kéo thanh cuộn hoặc sử dụng con lăn chuột của bạn để xem toàn bộ nội dung. Bạn cũng có thể điều chỉnh chiều cao tối đa của vùng văn bản cuộn trong CSS (lớp \`.dialog-text-scrollable\`) để phù hợp với thiết kế tổng thể của ứng dụng hoặc trang web của bạn.
            <br><br>
            Ngoài ra, chúng tôi đã thêm một nút đóng rõ ràng ở góc trên bên phải của hộp thoại này để bạn có thể dễ dàng thoát khỏi nó. Đây là một yếu tố UI quan trọng giúp người dùng cảm thấy có quyền kiểm soát.
            <br><br>
            Cảm ơn bạn đã thử nghiệm! Chúng tôi hy vọng tính năng này hữu ích cho dự án của bạn.`;

const initialDialogTitle = "Xác Nhận Hành Động";

function updateDialogContent(title, message) {
    dialogTitle.textContent = title;
    dialogMessage.innerHTML = message;
}

function showModal(title = initialDialogTitle, message = defaultLongMessage) {
    noClickCount = 0;
    updateDialogContent(title, message);
    dialogModal.classList.remove('hidden');

    yesBtn.classList.remove('hidden');
    noBtn.classList.remove('hidden');
    backBtn.classList.add('hidden');
    noBtn.textContent = 'Không';
    noBtn.disabled = false;
    noBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    setTimeout(() => {
        dialogModal.classList.add('show');
        modalContent.classList.add('show');
    }, 10);
}

function hideModal() {
    dialogModal.classList.remove('show');
    modalContent.classList.remove('show');
    setTimeout(() => {
        dialogModal.classList.add('hidden');
        noClickCount = 0;
        noBtn.disabled = false;
        noBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        yesBtn.classList.remove('hidden');
        backBtn.classList.add('hidden');
        noBtn.textContent = 'Không';
        updateDialogContent(initialDialogTitle, defaultLongMessage);
    }, 300);
}

function showNotification(message, showContinueBtn = false) {
    if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
    }
    notificationText.textContent = message;
    if (showContinueBtn) {
        continueBtn.classList.remove('hidden');
    } else {
        continueBtn.classList.add('hidden');
    }

    notification.classList.add('show');
    if (!showContinueBtn) {
        notificationTimeoutId = setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

openModalBtn.addEventListener('click', () => {
    showModal();
});

yesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideModal();
    showNotification('Bạn đã chọn: Có! Nhấn Tiếp tục để đến trang mới.', true);
});

noBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    noClickCount++;
    let currentDialogMessage = '';
    const currentDialogTitle = dialogTitle.textContent;

    if (noClickCount === 1) {
        currentDialogMessage = 'Bạn đã chọn Không lần 1. Bạn có muốn suy nghĩ lại không?';
        yesBtn.classList.add('hidden');
        backBtn.classList.remove('hidden');
        noBtn.textContent = 'Không nữa';
    } else if (noClickCount === 2) {
        currentDialogMessage = 'Bạn đã chọn Không lần 2. Quyết định cuối cùng chứ?';
        noBtn.textContent = 'Vẫn Không';
    } else if (noClickCount === 3) {
        currentDialogMessage = 'Bạn đã chọn Không lần 3. Hãy cân nhắc kỹ!';
        noBtn.textContent = 'Chắc chắn Không';
    } else {
        currentDialogMessage = `Bạn đã chọn Không ${noClickCount} lần. Nút "Không" đã bị vô hiệu hóa.`;
    }

    updateDialogContent(currentDialogTitle, currentDialogMessage);
    showNotification(`Bạn đã chọn: Không! (Lần ${noClickCount})`);

    if (noClickCount >= 4) {
        noBtn.disabled = true;
        noBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
});

backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showModal();
    showNotification('Đã quay lại mục xác nhận hành động.');
});

continueBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notification.classList.remove('show');
    continueBtn.classList.add('hidden');
    window.location.href = 'https://doananhluan.github.io/ryanL/home.html';
});

modalCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideModal();
});

document.body.addEventListener('click', (e) => {
    if (notification.classList.contains('show')) {
        if (!notification.contains(e.target) && e.target !== openModalBtn) {
            notification.classList.remove('show');
            continueBtn.classList.add('hidden');
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialogModal.classList.contains('show')) {
        hideModal();
    }
    if (e.key === 'Escape' && notification.classList.contains('show')) {
        notification.classList.remove('show');
        continueBtn.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    backgroundMusic.play().catch(error => {
        console.log("Autoplay of background music failed, likely due to browser policy:", error);
    });
});
