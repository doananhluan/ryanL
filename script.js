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

const defaultLongMessage = `Vậy là qua một cái trả đơn đã mở đầu cho nhiều chương khác. Mở đầu cho âm mưu bổ béo chui để bán nội tạng 😏 . Mà nay ú nu rồi. Cảm ớn mí ngừ nha.
 
<br> 2 đứa đã đi qua cũng nhiều vui buồn cùng nhau. Mong những ngày về sau 2 đứa luôn có nhau, iu shuong quan tâm nhau.
  
Đã sắp qua chương mới, nhiều thứ phía trước vui buồn, khó khăn có đủ, dù sao quan trọng vẫn là chúng ta luôn quan tâm iu shương nhau.

Chui là một người khô khan, ông già khó ở nên chịu thì chịu, ko chịu thì chịu nha êm. Già z chứ shương mí ngừ nha. Mặc dù mí ngừ lì lắm.

Hôm nay là một ngày nắng đẹp, mây trời trong xanh,  thời tiết như cũng ủng hộ chui gửi tới Em những lời này.
"Em Làm zợ Anh nha" ❤️

Từ Ông già đáng ghét dễ ở.`;

const initialDialogTitle = "Gửi Tới Em";

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
    window.location.href = 'https://doananhluan.github.io/ryanL/home';
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



