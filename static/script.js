// document.addEventListener('DOMContentLoaded', () => {
//     const galleryTrack = document.getElementById('galleryTrack');
//     // KHAI BÁO QUAN TRỌNG: galleryItemContainers sẽ chứa các DIV bọc ảnh
//     let galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container')); 
    
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('.lightbox-close');
//     const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
//     const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

//     const scrollSpeed = 0.5; // Tốc độ cuộn của carousel
//     let scrollInterval; // Biến lưu trữ interval của cuộn tự động
//     let currentScroll = 0; // Vị trí cuộn hiện tại của carousel chính
//     const originalGalleryItemsCount = galleryItemContainers.length; // Số lượng container ảnh gốc

//     let galleryWrapperWidth = 0; // Chiều rộng của khung hiển thị carousel
//     let originalItemsFullWidth = 0; // Tổng chiều rộng của tất cả các ảnh gốc
//     let clonedItemsPrefixWidth = 0; // Chiều rộng của các ảnh clone ở đầu track

//     let lightboxCurrentIndex = 0; // Index của ảnh hiện tại trong lightbox
//     let numClones = 0; // Số lượng ảnh được nhân bản ở mỗi bên

//     // --- Biến cho chức năng KÉO TRONG LIGHTBOX ---
//     let isDraggingLightbox = false; // Cờ cho biết đang kéo ảnh trong lightbox
//     let startLightboxPosX = 0; // Vị trí X của chuột khi bắt đầu kéo trong lightbox
//     let startLightboxImgPosX = 0; // Vị trí transform X của ảnh trong lightbox khi bắt đầu kéo
//     let dragThresholdLightbox = 10; // Ngưỡng kéo tối thiểu để kích hoạt chuyển ảnh (pixels)
//     let hasDraggedLightbox = false; // Cờ cho biết đã thực hiện hành động kéo trong lightbox

//     // --- Khởi tạo và Nhân bản ảnh (Cloning) ---
//     function initializeGallery() {
//         galleryWrapperWidth = document.querySelector('.gallery-wrapper').offsetWidth;

//         originalItemsFullWidth = 0;
//         // Tính toán tổng chiều rộng của các container ảnh gốc
//         galleryItemContainers.forEach(container => {
//             originalItemsFullWidth += container.offsetWidth + 10; // +10 cho margin-right
//         });

//         // Tính toán số lượng ảnh clone cần thiết để lấp đầy khung nhìn
//         numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / originalGalleryItemsCount)) + 2; 

//         // Xóa các clone cũ nếu có, để tránh nhân bản lặp lại
//         Array.from(galleryTrack.children).forEach(child => {
//             if (child.classList.contains('cloned')) {
//                 galleryTrack.removeChild(child);
//             }
//         });

//         // Clone các ảnh cuối cùng của danh sách gốc và thêm vào ĐẦU track
//         for (let i = originalGalleryItemsCount - 1; i >= originalGalleryItemsCount - numClones; i--) {
//             const actualIndex = (i < 0) ? (originalGalleryItemsCount + i) : i; 
//             const clone = galleryItemContainers[actualIndex].cloneNode(true); // Clone toàn bộ container
//             clone.classList.add('cloned');
//             galleryTrack.prepend(clone);
//         }

//         // Clone các ảnh đầu tiên của danh sách gốc và thêm vào CUỐI track
//         for (let i = 0; i < numClones; i++) {
//             const clone = galleryItemContainers[i].cloneNode(true); // Clone toàn bộ container
//             clone.classList.add('cloned');
//             galleryTrack.appendChild(clone);
//         }

//         // Cập nhật lại danh sách galleryItemContainers sau khi clone đã được thêm vào DOM
//         galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container'));

//         // Tính toán chiều rộng của các ảnh clone ở đầu track
//         clonedItemsPrefixWidth = 0;
//         for (let i = 0; i < numClones; i++) {
//             clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//         }

//         // Đặt vị trí scroll ban đầu để bắt đầu từ ảnh gốc đầu tiên
//         currentScroll = clonedItemsPrefixWidth;
        
//         // Tắt transition ngay lập tức để đặt vị trí ban đầu không bị giật
//         galleryTrack.style.transition = 'none'; 
//         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//         // Sau khi đặt vị trí ban đầu, bật lại transition cho các cuộn mượt mà
//         requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//                 galleryTrack.style.transition = 'transform 0.01s linear'; 
//             });
//         });

//         startAutoScroll(); // Bắt đầu cuộn tự động
//     }

//     // --- Chức năng tự động cuộn ---
//     function startAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval); // Xóa interval cũ nếu có
//         scrollInterval = setInterval(() => {
//             currentScroll += scrollSpeed; // Tăng vị trí cuộn
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             // Nếu cuộn đến cuối danh sách ảnh gốc + clone ở cuối, reset về vị trí đầu ảnh gốc
//             if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) {
//                 currentScroll = clonedItemsPrefixWidth; 
                
//                 // Tắt transition để reset vị trí tức thì, tránh bị giật
//                 galleryTrack.style.transition = 'none'; 
//                 galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                
//                 // Bật lại transition sau một khoảng thời gian ngắn
//                 requestAnimationFrame(() => {
//                     requestAnimationFrame(() => {
//                         galleryTrack.style.transition = 'transform 0.01s linear'; 
//                     });
//                 });
//             }
//         }, 1000 / 60); // Cập nhật khoảng 60 lần/giây để có chuyển động mượt
//     }

//     function stopAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval); // Dừng cuộn tự động
//     }

//     // --- Xử lý rê chuột (hover) trên carousel ---
//     galleryTrack.addEventListener('mouseenter', stopAutoScroll); // Dừng khi chuột vào
//     galleryTrack.addEventListener('mouseleave', () => {
//         startAutoScroll(); // Bắt đầu lại khi chuột rời đi
//     });

//     // --- Xử lý Lightbox ---
//     function updateLightboxImage() {
//         // Lấy đường dẫn và alt của ảnh từ thẻ img bên trong container tương ứng
//         const newImgSrc = galleryItemContainers[lightboxCurrentIndex % originalGalleryItemsCount].querySelector('.gallery-item').src;
//         const newImgAlt = galleryItemContainers[lightboxCurrentIndex % originalGalleryItemsCount].querySelector('.gallery-item').alt;

//         // Reset transform và opacity của ảnh trong lightbox trước khi tải ảnh mới
//         lightboxImg.style.transition = 'none'; // Tắt transition để tránh giật khi reset
//         lightboxImg.style.transform = 'translateX(0)'; // Đặt lại vị trí X về 0
//         lightboxImg.style.opacity = '0'; // Ẩn ảnh hiện tại để có hiệu ứng mượt khi tải ảnh mới

//         // Gắn listener cho sự kiện tải ảnh hoàn tất
//         lightboxImg.onload = () => {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out'; // Bật lại transition
//             lightboxImg.style.opacity = '1'; // Hiển thị ảnh mới
//             lightboxImg.onload = null; // Gỡ bỏ listener để tránh lỗi lặp lại
//         };

//         // Cập nhật src và alt cho ảnh trong lightbox
//         lightboxImg.src = newImgSrc;
//         lightboxImg.alt = newImgAlt;

//         // Nếu ảnh mới trùng với ảnh cũ (ví dụ: chuyển từ ảnh cuối về ảnh đầu), chỉ hiển thị lại
//         if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//         }
//     }

//     // Event Delegation cho click vào ảnh carousel để mở lightbox
//     galleryTrack.addEventListener('click', (e) => {
//         // Sử dụng .closest() để tìm phần tử cha gần nhất có class 'gallery-item-container'
//         // Điều này đảm bảo click vào ảnh, overlay, hoặc icon đều hoạt động
//         const clickedContainer = e.target.closest('.gallery-item-container');
        
//         if (clickedContainer) { // Nếu tìm thấy một container hợp lệ
//             stopAutoScroll(); // Dừng cuộn tự động của carousel

//             let clickedIndex = -1;
//             // Duyệt qua danh sách các container để tìm chỉ mục của container được click
//             for (let i = 0; i < galleryItemContainers.length; i++) { 
//                 if (galleryItemContainers[i] === clickedContainer) {
//                     clickedIndex = i;
//                     break;
//                 }
//             }
            
//             // Tính toán chỉ mục của ảnh gốc (loại bỏ ảnh clone)
//             let originalIndex = (clickedIndex - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
//             if (originalIndex < 0) originalIndex += originalGalleryItemsCount; 

//             lightboxCurrentIndex = originalIndex; // Đặt chỉ mục ảnh hiện tại cho lightbox
//             updateLightboxImage(); // Cập nhật ảnh trong lightbox
//             lightbox.classList.add('active'); // Hiển thị lightbox
//         }
//     });

//     // Xử lý nút đóng lightbox
//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active'); // Ẩn lightbox
//         startAutoScroll(); // Khởi động lại cuộn tự động
//         // Reset trạng thái kéo và vị trí ảnh trong lightbox khi đóng
//         isDraggingLightbox = false;
//         lightboxImg.style.transition = 'none'; 
//         lightboxImg.style.transform = 'translateX(0)'; 
//         lightboxImg.style.opacity = '1'; // Đảm bảo ảnh hiển thị đầy đủ khi mở lại
//     });

//     // Xử lý nhấp vào khoảng trống bên ngoài ảnh trong lightbox để đóng
//     lightbox.addEventListener('click', (e) => {
//         if (e.target === lightbox || e.target === lightboxClose) { // Nếu click vào nền mờ hoặc nút đóng
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translateX(0)';
//             lightboxImg.style.opacity = '1';
//         }
//     });

//     // Xử lý phím ESC để đóng lightbox
//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translateX(0)';
//             lightboxImg.style.opacity = '1';
//         }
//     });

//     // Xử lý nút điều hướng "Previous" trong lightbox
//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (ví dụ: đóng lightbox)
//         lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
//         updateLightboxImage(); // Cập nhật ảnh mới
//     });

//     // Xử lý nút điều hướng "Next" trong lightbox
//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
//         lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
//         updateLightboxImage(); // Cập nhật ảnh mới
//     });

//     // --- CHỨC NĂNG KÉO (DRAG) TRONG LIGHTBOX ---
//     lightboxImg.addEventListener('mousedown', (e) => {
//         if (e.button !== 0) return; // Chỉ xử lý click chuột trái
//         isDraggingLightbox = true;
//         startLightboxPosX = e.clientX; // Lưu vị trí X ban đầu của chuột
//         // Lấy vị trí transform X hiện tại của ảnh trong lightbox
//         const transformMatrix = new WebKitCSSMatrix(window.getComputedStyle(lightboxImg).transform);
//         startLightboxImgPosX = transformMatrix.m41; 
//         hasDraggedLightbox = false; // Reset cờ kéo
//         lightboxImg.style.cursor = 'grabbing'; // Thay đổi con trỏ chuột
//         lightboxImg.style.transition = 'none'; // Tắt transition khi kéo để đảm bảo mượt mà
//         e.preventDefault(); // Ngăn kéo ảnh làm chọn văn bản
//     });

//     // Lắng nghe mousemove trên document để bắt sự kiện ngay cả khi chuột ra ngoài ảnh
//     document.addEventListener('mousemove', (e) => {
//         if (!isDraggingLightbox) return; // Chỉ xử lý nếu đang kéo

//         const deltaX = e.clientX - startLightboxPosX; // Độ lệch X của chuột
//         let newImgPosX = startLightboxImgPosX + deltaX; // Vị trí X mới của ảnh

//         lightboxImg.style.transform = `translateX(${newImgPosX}px)`; // Áp dụng transform

//         // Đặt cờ hasDraggedLightbox nếu chuột di chuyển đủ xa
//         if (Math.abs(deltaX) > dragThresholdLightbox) {
//             hasDraggedLightbox = true;
//         }
//     });

//     // Lắng nghe mouseup trên document để kết thúc kéo
//     document.addEventListener('mouseup', () => {
//         if (isDraggingLightbox) {
//             isDraggingLightbox = false; // Kết thúc kéo
//             lightboxImg.style.cursor = 'grab'; // Trả lại con trỏ chuột
            
//             // Bật lại transition sau khi kéo để có hiệu ứng trượt về vị trí mới
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 

//             const lightboxWidth = lightbox.offsetWidth; // Chiều rộng của lightbox
//             // Lấy vị trí transform X cuối cùng của ảnh
//             const currentImgPosX = new WebKitCSSMatrix(window.getComputedStyle(lightboxImg).transform).m41;

//             if (hasDraggedLightbox) { // Nếu thực sự đã kéo (không phải click)
//                 // Kéo sang phải đủ xa để chuyển về ảnh trước đó
//                 if (currentImgPosX > lightboxWidth * 0.2) { 
//                     lightboxPrevButton.click(); // Giả lập click nút Prev
//                 } 
//                 // Kéo sang trái đủ xa để chuyển về ảnh tiếp theo
//                 else if (currentImgPosX < -lightboxWidth * 0.2) { 
//                     lightboxNextButton.click(); // Giả lập click nút Next
//                 } else {
//                     // Nếu kéo không đủ xa để chuyển ảnh, trả ảnh về vị trí ban đầu (0,0)
//                     lightboxImg.style.transform = 'translateX(0)';
//                 }
//             } else {
//                 // Nếu đây chỉ là một click (không kéo), đảm bảo ảnh trở về vị trí 0
//                 lightboxImg.style.transform = 'translateX(0)'; 
//             }
//             hasDraggedLightbox = false; // Reset cờ kéo
//         }
//     });

//     // --- Khởi chạy khi trang tải xong ---
//     window.addEventListener('load', initializeGallery);
// });

// code đang xài 
// document.addEventListener('DOMContentLoaded', () => {
//     const galleryTrack = document.getElementById('galleryTrack');
//     let galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container')); 
    
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('.lightbox-close');
//     const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
//     const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

//     // THÊM CÁC BIẾN MỚI
//     const lightboxCounter = document.getElementById('lightbox-counter');
//     const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');

//     const scrollSpeed = 0.5;
//     let scrollInterval;
//     let currentScroll = 0;
//     const originalGalleryItemsCount = galleryItemContainers.length; // Số lượng ảnh gốc trong gallery

//     let galleryWrapperWidth = 0;
//     let originalItemsFullWidth = 0;
//     let clonedItemsPrefixWidth = 0;

//     let lightboxCurrentIndex = 0; // Index của ảnh hiện tại trong lightbox (trong số ảnh gốc)
//     let numClones = 0;

//     // --- Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX (Được đơn giản hóa) ---
//     let isDraggingLightbox = false;
//     let startLightboxPosX = 0;
//     let startLightboxPosY = 0; 
//     let startLightboxImgPosX = 0;
//     let startLightboxImgPosY = 0; 
//     let dragThresholdLightbox = 50;
//     let hasDraggedLightbox = false;

//     // Biến cho tính năng ZOOM (Nếu bạn không muốn zoom, các biến này sẽ ít quan trọng hơn)
//     let currentZoomLevel = 1; 
//     const maxZoomLevel = 1; // Đặt maxZoomLevel về 1 để vô hiệu hóa zoom
//     const minZoomLevel = 1; 
//     const zoomSensitivity = 0.1; 

//     // Biến cho Pinch-to-zoom trên di động (cũng sẽ bị vô hiệu hóa nếu maxZoomLevel = 1)
//     let initialPinchDistance = 0;
//     let isPinching = false;

//     // --- Khởi tạo và Nhân bản ảnh (Cloning) ---
//     // function initializeGallery() {
//     //     galleryWrapperWidth = document.querySelector('.gallery-wrapper').offsetWidth;
//     //     originalItemsFullWidth = 0;
//     //     galleryItemContainers.forEach(container => {
//     //         originalItemsFullWidth += container.offsetWidth + 10; 
//     //     });
//     //     numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / originalGalleryItemsCount)) + 2; 

//     //     Array.from(galleryTrack.children).forEach(child => {
//     //         if (child.classList.contains('cloned')) {
//     //             galleryTrack.removeChild(child);
//     //         }
//     //     });

//     //     for (let i = 1; i <= numClones; i++) {
//     //         const actualIndex = (originalGalleryItemsCount - i % originalGalleryItemsCount + originalGalleryItemsCount) % originalGalleryItemsCount;
//     //         const clone = galleryItemContainers[actualIndex].cloneNode(true);
//     //         clone.classList.add('cloned');
//     //         galleryTrack.prepend(clone);
//     //     }

//     //     for (let i = 0; i < numClones; i++) {
//     //         const clone = galleryItemContainers[i % originalGalleryItemsCount].cloneNode(true);
//     //         clone.classList.add('cloned');
//     //         galleryTrack.appendChild(clone);
//     //     }

//     //     galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container'));

//     //     clonedItemsPrefixWidth = 0;
//     //     for (let i = 0; i < numClones; i++) {
//     //         if (galleryItemContainers[i]) {
//     //             clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//     //         } else {
//     //             console.warn(`[initializeGallery] Phần tử galleryItemContainers[${i}] không tồn tại khi tính clonedItemsPrefixWidth.`);
//     //         }
//     //     }

//     //     currentScroll = clonedItemsPrefixWidth;
        
//     //     galleryTrack.style.transition = 'none'; 
//     //     galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//     //     requestAnimationFrame(() => {
//     //         requestAnimationFrame(() => {
//     //             galleryTrack.style.transition = 'transform 0.01s linear'; 
//     //         });
//     //     });

//     //     startAutoScroll();
//     // }

//     function initializeGallery() {
//     const galleryWrapper = document.querySelector('.gallery-wrapper'); // Thêm dòng này nếu chưa có
//     if (!galleryWrapper || !galleryTrack) {
//         console.error("Gallery wrapper or track not found!");
//         return;
//     }

//     galleryWrapperWidth = galleryWrapper.offsetWidth;

//     // Xóa clones cũ trước khi tính toán lại
//     Array.from(galleryTrack.children).forEach(child => {
//         if (child.classList.contains('cloned')) {
//             galleryTrack.removeChild(child);
//         }
//     });
//     // thao tác về nút cuộn
// const scrolltopButton = document.querySelector('.scrolltop');

//     // Hàm kiểm tra xem có phải thiết bị di động không
//     function isMobileDevice() {
//         return window.innerWidth <= 767; // Điều chỉnh breakpoint này cho phù hợp với định nghĩa mobile của bạn
//     }

//     // Hàm ẩn nút cuộn
//     function hideScrolltopButton() {
//         if (scrolltopButton && isMobileDevice()) { // Chỉ ẩn nếu là mobile
//             scrolltopButton.classList.add('hide-on-mobile-image-view');
//         }
//     }

//     // Hàm hiện nút cuộn
//     function showScrolltopButton() {
//         if (scrolltopButton) { // Luôn hiện lại khi đóng lightbox, bất kể là mobile hay desktop
//             scrolltopButton.classList.remove('hide-on-mobile-image-view');
//         }
//     }

//     // Lấy lại danh sách các item gốc SAU KHI xóa clone
//     const originalItemNodes = Array.from(galleryTrack.children);
//     const currentOriginalGalleryItemsCount = originalItemNodes.length; 

//     if (currentOriginalGalleryItemsCount === 0) {
//         console.warn("No original items in galleryTrack after clearing clones.");
//         return; 
//     }

//     originalItemsFullWidth = 0;
//     originalItemNodes.forEach(containerNode => {
//         // Đảm bảo containerNode là một element hợp lệ có offsetWidth
//         if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
//             originalItemsFullWidth += containerNode.offsetWidth + 10; // 10 là margin-right
//         } else {
//             console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
//         }
//     });

//     // Sử dụng currentOriginalGalleryItemsCount thay vì originalGalleryItemsCount (biến global)
//     // để đảm bảo tính nhất quán nếu hàm được gọi lại.
//     // Biến global originalGalleryItemsCount vẫn dùng cho mục đích hiển thị tổng số ảnh.
//     if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
//          numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
//     } else {
//         // Fallback nếu có lỗi tính toán
//         numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 3; // Hoặc một giá trị mặc định an toàn
//         console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
//     }

//     // Logic nhân bản (prepend/append) giữ nguyên, nhưng dùng originalItemNodes và currentOriginalGalleryItemsCount
//     // Ví dụ:
//     // Prepend clones
//     for (let i = 1; i <= numClones; i++) {
//         const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
//         if (originalItemNodes[actualIndex]) { // Kiểm tra node tồn tại
//             const clone = originalItemNodes[actualIndex].cloneNode(true);
//             clone.classList.add('cloned');
//             galleryTrack.prepend(clone);
//         }
//     }
//     // Append clones
//     for (let i = 0; i < numClones; i++) {
//         const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//         if (originalItemNodes[originalIndexForClone]) { // Kiểm tra node tồn tại
//              const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
//             clone.classList.add('cloned');
//             galleryTrack.appendChild(clone);
//         }
//     }

//     galleryItemContainers = Array.from(galleryTrack.children); // Cập nhật lại danh sách đầy đủ

//     clonedItemsPrefixWidth = 0;
//     for (let i = 0; i < numClones; i++) {
//         if (galleryItemContainers[i]) {
//             clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//         } else {
//              console.warn(`Prefix clone at index ${i} is undefined.`);
//         }
//     }

//     currentScroll = clonedItemsPrefixWidth;
//     galleryTrack.style.transition = 'none'; 
//     galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//     requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//             galleryTrack.style.transition = 'transform 0.01s linear'; 
//         });
//     });

//     startAutoScroll();
// }

//     // --- Chức năng tự động cuộn ---
//     function startAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//         scrollInterval = setInterval(() => {
//             currentScroll += scrollSpeed;
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             if (currentScroll >= (originalItemsFullWidth + clonedItemsPrefixWidth)) {
//                 currentScroll = clonedItemsPrefixWidth; 
                
//                 galleryTrack.style.transition = 'none'; 
//                 galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                
//                 requestAnimationFrame(() => {
//                     requestAnimationFrame(() => {
//                         galleryTrack.style.transition = 'transform 0.01s linear'; 
//                     });
//                 });
//             }
//         }, 1000 / 60);
//     }

//     function stopAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//     }

//     // --- Xử lý rê chuột (hover) trên carousel ---
//     galleryTrack.addEventListener('mouseenter', stopAutoScroll);
//     galleryTrack.addEventListener('mouseleave', () => {
//         startAutoScroll();
//     });

//     // --- Xử lý Lightbox ---
//     function updateLightboxImage() {
//         const newImgSrc = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').dataset.fullresSrc || galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').src;
//     const newImgAlt = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').alt;

//         // Luôn reset vị trí và zoom khi chuyển ảnh trong lightbox
//         lightboxImg.style.transition = 'none'; // Tắt transition để reset ngay lập tức
//         lightboxImg.style.transform = 'translate(0px, 0px) scale(1)'; 
//         lightboxImg.style.opacity = '0'; 

//         currentZoomLevel = 1; // Reset zoom level
//         startLightboxImgPosX = 0; // Reset vị trí dịch chuyển X
//         startLightboxImgPosY = 0; // Reset vị trí dịch chuyển Y

//         lightboxImg.onload = () => {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//             lightboxImg.onload = null;
//         };

//         lightboxImg.src = newImgSrc;
//         lightboxImg.alt = newImgAlt;

//         // Trường hợp ảnh đã được cache và không kích hoạt onload
//         if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//         }

//         updateLightboxCounter(); // Cập nhật bộ đếm
//         updateLightboxThumbnails(); // Cập nhật thumbnails
//     }

//     // THÊM HÀM CẬP NHẬT BỘ ĐẾM
//     function updateLightboxCounter() {
//         lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${originalGalleryItemsCount}`;
//     }

//     // THÊM HÀM CẬP NHẬT THUMBNAILS
//     function updateLightboxThumbnails() {
//         lightboxThumbnailsContainer.innerHTML = ''; // Xóa thumbnails cũ
//         galleryItemContainers.forEach((container, index) => {
//             // Chỉ lấy các ảnh gốc, bỏ qua ảnh cloned
//             if (index >= numClones && index < numClones + originalGalleryItemsCount) {
//                 const originalIndex = (index - numClones) % originalGalleryItemsCount; // Index trong số ảnh gốc

//                 const thumbImg = document.createElement('img');
//                 thumbImg.src = container.querySelector('.gallery-item').src;
//                 thumbImg.alt = `Thumbnail ${originalIndex + 1}`;
//                 thumbImg.classList.add('lightbox-thumbnail-item');
                
//                 // Đánh dấu thumbnail đang active
//                 if (originalIndex === lightboxCurrentIndex) {
//                     thumbImg.classList.add('active');
//                 }

//                 // Xử lý click vào thumbnail để chuyển ảnh
//                 thumbImg.addEventListener('click', () => {
//                     lightboxCurrentIndex = originalIndex;
//                     updateLightboxImage();
//                 });
//                 lightboxThumbnailsContainer.appendChild(thumbImg);
//             }
//         });
//         // Cuộn thanh thumbnails để thumbnail active luôn hiển thị
//         const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
//         if (activeThumbnail) {
//             activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
//         }
//     }


//     // Event Delegation cho click vào ảnh carousel để mở lightbox
//     // galleryTrack.addEventListener('click', (e) => {
//     //     const clickedContainer = e.target.closest('.gallery-item-container');
        
//     //     if (clickedContainer && !clickedContainer.classList.contains('cloned')) { 
//     //         stopAutoScroll();

//     //         let clickedIndexInFullList = -1;
//     //         for (let i = 0; i < galleryItemContainers.length; i++) { 
//     //             if (galleryItemContainers[i] === clickedContainer) {
//     //                 clickedIndexInFullList = i;
//     //                 break;
//     //             }
//     //         }
            
//     //         let tempLightboxIndex = (clickedIndexInFullList - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
//     //         if (tempLightboxIndex < 0) tempLightboxIndex += originalGalleryItemsCount; 

//     //         lightboxCurrentIndex = tempLightboxIndex;
//     //         updateLightboxImage();
//     //         lightbox.classList.add('active');
//     //         document.body.style.overflow = 'hidden'; 
//     //     }
//     // });
//     galleryTrack.addEventListener('click', (e) => {
//     const clickedContainer = e.target.closest('.gallery-item-container');

//     // Bỏ điều kiện !clickedContainer.classList.contains('cloned')
//     if (clickedContainer) { 
//         stopAutoScroll();

//         let clickedIndexInFullList = -1;
//         for (let i = 0; i < galleryItemContainers.length; i++) { 
//             if (galleryItemContainers[i] === clickedContainer) {
//                 clickedIndexInFullList = i;
//                 break;
//             }
//         }

//         // Logic tính index này có vẻ đúng để map cả ảnh gốc và clone về index của ảnh gốc
//         let tempLightboxIndex = (clickedIndexInFullList - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
//         if (tempLightboxIndex < 0) tempLightboxIndex += originalGalleryItemsCount; 

//         lightboxCurrentIndex = tempLightboxIndex;
//         updateLightboxImage();
//         lightbox.classList.add('active');
//         document.body.style.overflow = 'hidden'; 
//     }
// });

//     // Xử lý nút đóng lightbox
//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active');
//         startAutoScroll();
//         // Reset tất cả trạng thái zoom và kéo khi đóng
//         isDraggingLightbox = false;
//         currentZoomLevel = 1;
//         startLightboxImgPosX = 0;
//         startLightboxImgPosY = 0;
//         lightboxImg.style.transition = 'none'; 
//         lightboxImg.style.transform = 'translate(0px, 0px) scale(1)'; 
//         lightboxImg.style.opacity = '1';
//         document.body.style.overflow = ''; 
//     });

//     // Xử lý nhấp vào khoảng trống bên ngoài ảnh trong lightbox để đóng
//     lightbox.addEventListener('click', (e) => {
//         if (e.target === lightbox || e.target === lightboxClose) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = ''; 
//         }
//     });

//     // Xử lý phím ESC để đóng lightbox
//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = ''; 
//         }
//     });

//     // Xử lý nút điều hướng "Previous" trong lightbox
//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
//         updateLightboxImage();
//     });

//     // Xử lý nút điều hướng "Next" trong lightbox
//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
//         updateLightboxImage();
//     });

//     // --- CHỨC NĂNG KÉO (DRAG) TRONG LIGHTBOX (Zoom bị vô hiệu hóa) ---
//     function getTransformValues(element) {
//         const style = window.getComputedStyle(element);
//         const transform = style.transform || style.webkitTransform || style.mozTransform;
//         let translateX = 0, translateY = 0, scale = 1;

//         if (transform !== 'none') {
//             const matrix = new WebKitCSSMatrix(transform);
//             translateX = matrix.m41;
//             translateY = matrix.m42;
//             scale = matrix.a; 
//         }
//         return { translateX, translateY, scale };
//     }

//     function applyTransform() {
//         // Nếu zoom bị vô hiệu hóa (maxZoomLevel = 1), luôn đặt scale về 1
//         lightboxImg.style.transform = `translate(${startLightboxImgPosX}px, ${startLightboxImgPosY}px) scale(${currentZoomLevel})`;
//     }

//     function startDragLightbox(e) {
//         if (e.type === 'mousedown' && e.button !== 0) return; 
//         // if (isPinching) { // Không cần kiểm tra pinching nếu zoom bị vô hiệu hóa
//         //     isDraggingLightbox = false;
//         //     return;
//         // }
        
//         isDraggingLightbox = true;
//         hasDraggedLightbox = false; 

//         startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
//         startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;
        
//         const { translateX, translateY } = getTransformValues(lightboxImg); // Không cần scale nếu zoom bị vô hiệu hóa
//         startLightboxImgPosX = translateX;
//         startLightboxImgPosY = translateY;
//         currentZoomLevel = 1; // Luôn giữ 1 nếu zoom bị vô hiệu hóa

//         lightboxImg.style.cursor = 'grabbing';
//         lightboxImg.style.transition = 'none'; 

//         if (e.type === 'touchstart') {
//             e.preventDefault(); 
//         }
//     }

//     function dragLightbox(e) {
//         if (!isDraggingLightbox /* || isPinching */) return; // Bỏ kiểm tra isPinching

//         const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
//         const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

//         const deltaX = currentClientX - startLightboxPosX;
//         const deltaY = currentClientY - startLightboxPosY;

//         // Khi zoom bị vô hiệu hóa, ảnh luôn ở scale 1.
//         // Kéo ảnh chỉ dùng để chuyển ảnh, không để dịch chuyển tự do.
//         // Do đó, chúng ta chỉ cần cập nhật deltaX để kiểm tra ngưỡng chuyển ảnh.
//         // Vị trí Y không ảnh hưởng đến chuyển ảnh ngang.
//         // startLightboxImgPosX += deltaX; // Không cần cập nhật vị trí ảnh liên tục nếu chỉ để chuyển ảnh

//         // Để tạo cảm giác kéo nhưng vẫn căn giữa ảnh khi không zoom, 
//         // ta có thể cho phép dịch chuyển tạm thời rồi reset ở endDragLightbox.
//         let newPosX = startLightboxImgPosX + deltaX;
//         let newPosY = startLightboxImgPosY + deltaY;

//         // Nếu zoom bị vô hiệu hóa, không cần giới hạn kéo phức tạp
//         // mà chỉ cần cho phép kéo ngang để chuyển ảnh
//         startLightboxImgPosX = newPosX;
//         startLightboxImgPosY = newPosY;
//         applyTransform(); // Áp dụng để người dùng thấy ảnh dịch chuyển tạm thời

//         startLightboxPosX = currentClientX;
//         startLightboxPosY = currentClientY;

//         // Chỉ cần deltaX để kiểm tra kéo ngang chuyển ảnh
//         if (Math.abs(deltaX) > dragThresholdLightbox || Math.abs(deltaY) > dragThresholdLightbox) {
//             hasDraggedLightbox = true;
//         }
//         if (e.type === 'touchmove') {
//             e.preventDefault(); 
//         }
//     }

//     function endDragLightbox(e) {
//         if (isDraggingLightbox) {
//             isDraggingLightbox = false;
//             lightboxImg.style.cursor = 'grab';
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 
            
//             // Khi zoom bị vô hiệu hóa (currentZoomLevel luôn là 1)
//             const lightboxWidth = lightbox.offsetWidth;
//             const currentImgPosX = getTransformValues(lightboxImg).translateX;

//             if (hasDraggedLightbox && Math.abs(currentImgPosX) > lightboxWidth * 0.2) { 
//                 if (currentImgPosX > 0) { // Kéo sang phải, chuyển về ảnh trước
//                     lightboxPrevButton.click();
//                 } else { // Kéo sang trái, chuyển về ảnh sau
//                     lightboxNextButton.click();
//                 }
//             } else {
//                 // Nếu không kéo đủ xa hoặc không kéo, trả ảnh về vị trí ban đầu
//                 lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//                 startLightboxImgPosX = 0;
//                 startLightboxImgPosY = 0;
//             }
//             hasDraggedLightbox = false;
//         }
//     }

//     lightboxImg.addEventListener('mousedown', startDragLightbox);
//     lightboxImg.addEventListener('touchstart', startDragLightbox); 

//     document.addEventListener('mousemove', dragLightbox);
//     document.addEventListener('touchmove', dragLightbox, { passive: false }); 

//     document.addEventListener('mouseup', endDragLightbox);
//     document.addEventListener('touchend', endDragLightbox);

//     // --- Hàm xử lý CUỘN CHUỘT (Wheel Zoom) chung ---
//     // Đơn giản hóa: Chỉ ngăn cuộn trang, không thực hiện zoom
//     function handleWheelZoom(e) {
//         if (!lightbox.classList.contains('active')) {
//             return; 
//         }
        
//         e.preventDefault(); 
//         e.stopPropagation(); 

//         // Không cần logic zoom phức tạp nếu maxZoomLevel = 1
//         // Nếu bạn muốn zoom, hãy mở lại logic từ phiên bản trước
//         // và đảm bảo các biến currentZoomLevel, startLightboxImgPosX, startLightboxImgPosY được cập nhật
//         // và applyTransform() được gọi.
//         // currentZoomLevel = 1; // Đảm bảo luôn là 1
//         // startLightboxImgPosX = 0;
//         // startLightboxImgPosY = 0;
//         // applyTransform();
//     }

//     // --- Gán listener cho sự kiện Wheel ---
//     lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false }); 
//     lightbox.addEventListener('wheel', handleWheelZoom, { passive: false }); 
//     document.addEventListener('wheel', handleWheelZoom, { passive: false }); 

//     // --- Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động) ---
//     // Sẽ bị vô hiệu hóa nếu maxZoomLevel = 1
//     lightboxImg.addEventListener('touchstart', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2) { 
//             isPinching = true;
//             stopAutoScroll(); 
//             initialPinchDistance = Math.hypot(
//                 e.touches[0].pageX - e.touches[1].pageX,
//                 e.touches[0].pageY - e.touches[1].pageY
//             );

//             // currentZoomLevel = 1; // Luôn giữ 1 nếu zoom bị vô hiệu hóa
//             // startLightboxImgPosX = 0;
//             // startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none'; 
//         } else if (e.touches.length === 1) {
//             startDragLightbox(e);
//         }
//     }, { passive: false }); 

//     lightboxImg.addEventListener('touchmove', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2 && isPinching) {
//             e.preventDefault(); 
//             // Không thực hiện logic zoom nếu maxZoomLevel = 1
//             // Chỉ ngăn chặn hành vi cuộn/chụm mặc định
//         } else if (e.touches.length === 1) {
//             dragLightbox(e);
//         }
//     }, { passive: false }); 

//     lightboxImg.addEventListener('touchend', (e) => {
//         if (isPinching) {
//             isPinching = false;
//             // Reset nếu có bất kỳ dịch chuyển nào do pinch-zoom nhưng không zoom thực tế
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 
//         }
//         endDragLightbox(e);
//     });

//     window.addEventListener('resize', initializeGallery);
//     initializeGallery();
// });


// document.addEventListener('DOMContentLoaded', () => {
//     const galleryTrack = document.getElementById('galleryTrack');
//     let galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container')); 
    
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('.lightbox-close');
//     const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
//     const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

//     // THÊM CÁC BIẾN MỚI
//     const lightboxCounter = document.getElementById('lightbox-counter');
//     const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');

//     const scrollSpeed = 0.5;
//     let scrollInterval;
//     let currentScroll = 0;
//     const originalGalleryItemsCount = galleryItemContainers.length; // Số lượng ảnh gốc trong gallery

//     let galleryWrapperWidth = 0;
//     let originalItemsFullWidth = 0;
//     let clonedItemsPrefixWidth = 0;

//     let lightboxCurrentIndex = 0; // Index của ảnh hiện tại trong lightbox (trong số ảnh gốc)
//     let numClones = 0;

//     // --- Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX (Được đơn giản hóa) ---
//     let isDraggingLightbox = false;
//     let startLightboxPosX = 0;
//     let startLightboxPosY = 0; 
//     let startLightboxImgPosX = 0;
//     let startLightboxImgPosY = 0; 
//     let dragThresholdLightbox = 50;
//     let hasDraggedLightbox = false;

//     // Biến cho tính năng ZOOM (Nếu bạn không muốn zoom, các biến này sẽ ít quan trọng hơn)
//     let currentZoomLevel = 1; 
//     const maxZoomLevel = 1; // Đặt maxZoomLevel về 1 để vô hiệu hóa zoom
//     const minZoomLevel = 1; 
//     const zoomSensitivity = 0.1; 

//     // Biến cho Pinch-to-zoom trên di động (cũng sẽ bị vô hiệu hóa nếu maxZoomLevel = 1)
//     let initialPinchDistance = 0;
//     let isPinching = false;

//     // ==========================================================
//     // BỔ SUNG: BIẾN VÀ HÀM CHO NÚT CUỘN LÊN ĐẦU TRANG (SCROLLTOP)
//     // ==========================================================
//     const scrolltopButton = document.querySelector('.scrolltop');

//     // Hàm kiểm tra xem có phải thiết bị di động không
//     function isMobileDevice() {
//         return window.innerWidth <= 767; // Điều chỉnh breakpoint này cho phù hợp với định nghĩa mobile của bạn
//     }

//     // Hàm ẩn nút cuộn
//     function hideScrolltopButton() {
//         if (scrolltopButton && isMobileDevice()) { // Chỉ ẩn nếu là mobile
//             scrolltopButton.classList.add('hide-on-mobile-image-view');
//         }
//     }

//     // Hàm hiện nút cuộn
//     function showScrolltopButton() {
//         if (scrolltopButton) { // Luôn hiện lại khi đóng lightbox, bất kể là mobile hay desktop
//             scrolltopButton.classList.remove('hide-on-mobile-image-view');
//             // Đảm bảo loại bỏ class active nếu nó đã bị ẩn bởi hide-on-mobile-image-view
//             // và hiện tại không có lý do gì để active (ví dụ: chưa cuộn đủ xa)
//             // Lệnh này sẽ được xử lý lại bởi window.addEventListener('scroll')
//             // nên có thể không cần thiết ở đây, nhưng để an toàn.
//             // scrolltopButton.classList.remove('active'); 
//         }
//     }
//     // ==========================================================
//     // KẾT THÚC BỔ SUNG
//     // ==========================================================


//     function initializeGallery() {
//         const galleryWrapper = document.querySelector('.gallery-wrapper'); // Thêm dòng này nếu chưa có
//         if (!galleryWrapper || !galleryTrack) {
//             console.error("Gallery wrapper or track not found!");
//             return;
//         }

//         galleryWrapperWidth = galleryWrapper.offsetWidth;

//         // Xóa clones cũ trước khi tính toán lại
//         Array.from(galleryTrack.children).forEach(child => {
//             if (child.classList.contains('cloned')) {
//                 galleryTrack.removeChild(child);
//             }
//         });

//         // Lấy lại danh sách các item gốc SAU KHI xóa clone
//         const originalItemNodes = Array.from(galleryTrack.children);
//         const currentOriginalGalleryItemsCount = originalItemNodes.length; 

//         if (currentOriginalGalleryItemsCount === 0) {
//             console.warn("No original items in galleryTrack after clearing clones.");
//             return; 
//         }

//         originalItemsFullWidth = 0;
//         originalItemNodes.forEach(containerNode => {
//             // Đảm bảo containerNode là một element hợp lệ có offsetWidth
//             if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
//                 originalItemsFullWidth += containerNode.offsetWidth + 10; // 10 là margin-right
//             } else {
//                 console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
//             }
//         });

//         if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
//             numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
//         } else {
//             numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 3; 
//             console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
//         }

//         // Prepend clones
//         for (let i = 1; i <= numClones; i++) {
//             const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
//             if (originalItemNodes[actualIndex]) {
//                 const clone = originalItemNodes[actualIndex].cloneNode(true);
//                 clone.classList.add('cloned');
//                 galleryTrack.prepend(clone);
//             }
//         }
//         // Append clones
//         for (let i = 0; i < numClones; i++) {
//             const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//             if (originalItemNodes[originalIndexForClone]) {
//                 const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
//                 clone.classList.add('cloned');
//                 galleryTrack.appendChild(clone);
//             }
//         }

//         galleryItemContainers = Array.from(galleryTrack.children); // Cập nhật lại danh sách đầy đủ

//         clonedItemsPrefixWidth = 0;
//         for (let i = 0; i < numClones; i++) {
//             if (galleryItemContainers[i]) {
//                 clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//             } else {
//                 console.warn(`Prefix clone at index ${i} is undefined.`);
//             }
//         }

//         currentScroll = clonedItemsPrefixWidth;
//         galleryTrack.style.transition = 'none'; 
//         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//         requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//                 galleryTrack.style.transition = 'transform 0.01s linear'; 
//             });
//         });

//         startAutoScroll();
//     }

//     // --- Chức năng tự động cuộn ---
//     function startAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//         scrollInterval = setInterval(() => {
//             currentScroll += scrollSpeed;
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             if (currentScroll >= (originalItemsFullWidth + clonedItemsPrefixWidth)) {
//                 currentScroll = clonedItemsPrefixWidth; 
                
//                 galleryTrack.style.transition = 'none'; 
//                 galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                
//                 requestAnimationFrame(() => {
//                     requestAnimationFrame(() => {
//                         galleryTrack.style.transition = 'transform 0.01s linear'; 
//                     });
//                 });
//             }
//         }, 1000 / 60);
//     }

//     function stopAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//     }

//     // --- Xử lý rê chuột (hover) trên carousel ---
//     galleryTrack.addEventListener('mouseenter', stopAutoScroll);
//     galleryTrack.addEventListener('mouseleave', () => {
//         startAutoScroll();
//     });

//     // --- Xử lý Lightbox ---
//     function updateLightboxImage() {
//         const newImgSrc = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').dataset.fullresSrc || galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').src;
//         const newImgAlt = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').alt;

//         // Luôn reset vị trí và zoom khi chuyển ảnh trong lightbox
//         lightboxImg.style.transition = 'none'; // Tắt transition để reset ngay lập tức
//         lightboxImg.style.transform = 'translate(0px, 0px) scale(1)'; 
//         lightboxImg.style.opacity = '0'; 

//         currentZoomLevel = 1; // Reset zoom level
//         startLightboxImgPosX = 0; // Reset vị trí dịch chuyển X
//         startLightboxImgPosY = 0; // Reset vị trí dịch chuyển Y

//         lightboxImg.onload = () => {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//             lightboxImg.onload = null;
//         };

//         lightboxImg.src = newImgSrc;
//         lightboxImg.alt = newImgAlt;

//         // Trường hợp ảnh đã được cache và không kích hoạt onload
//         if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//         }

//         updateLightboxCounter(); // Cập nhật bộ đếm
//         updateLightboxThumbnails(); // Cập nhật thumbnails
//     }

//     // THÊM HÀM CẬP NHẬT BỘ ĐẾM
//     function updateLightboxCounter() {
//         lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${originalGalleryItemsCount}`;
//     }

//     // THÊM HÀM CẬP NHẬT THUMBNAILS
//     function updateLightboxThumbnails() {
//         lightboxThumbnailsContainer.innerHTML = ''; // Xóa thumbnails cũ
//         galleryItemContainers.forEach((container, index) => {
//             // Chỉ lấy các ảnh gốc, bỏ qua ảnh cloned
//             if (index >= numClones && index < numClones + originalGalleryItemsCount) {
//                 const originalIndex = (index - numClones) % originalGalleryItemsCount; // Index trong số ảnh gốc

//                 const thumbImg = document.createElement('img');
//                 thumbImg.src = container.querySelector('.gallery-item').src;
//                 thumbImg.alt = `Thumbnail ${originalIndex + 1}`;
//                 thumbImg.classList.add('lightbox-thumbnail-item');
                
//                 // Đánh dấu thumbnail đang active
//                 if (originalIndex === lightboxCurrentIndex) {
//                     thumbImg.classList.add('active');
//                 }

//                 // Xử lý click vào thumbnail để chuyển ảnh
//                 thumbImg.addEventListener('click', () => {
//                     lightboxCurrentIndex = originalIndex;
//                     updateLightboxImage();
//                 });
//                 lightboxThumbnailsContainer.appendChild(thumbImg);
//             }
//         });
//         // Cuộn thanh thumbnails để thumbnail active luôn hiển thị
//         const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
//         if (activeThumbnail) {
//             activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
//         }
//     }


//     // Event Delegation cho click vào ảnh carousel để mở lightbox
//     galleryTrack.addEventListener('click', (e) => {
//         const clickedContainer = e.target.closest('.gallery-item-container');

//         if (clickedContainer) { 
//             stopAutoScroll();

//             let clickedIndexInFullList = -1;
//             for (let i = 0; i < galleryItemContainers.length; i++) { 
//                 if (galleryItemContainers[i] === clickedContainer) {
//                     clickedIndexInFullList = i;
//                     break;
//                 }
//             }

//             let tempLightboxIndex = (clickedIndexInFullList - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
//             if (tempLightboxIndex < 0) tempLightboxIndex += originalGalleryItemsCount; 

//             lightboxCurrentIndex = tempLightboxIndex;
//             updateLightboxImage();
//             lightbox.classList.add('active');
//             document.body.style.overflow = 'hidden'; 
            
//             // ==========================================================
//             // BỔ SUNG: ẨN NÚT CUỘN KHI LIGHTBOX MỞ
//             // ==========================================================
//             hideScrolltopButton();
//             // ==========================================================
//         }
//     });

//     // Xử lý nút đóng lightbox
//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active');
//         startAutoScroll();
//         // Reset tất cả trạng thái zoom và kéo khi đóng
//         isDraggingLightbox = false;
//         currentZoomLevel = 1;
//         startLightboxImgPosX = 0;
//         startLightboxImgPosY = 0;
//         lightboxImg.style.transition = 'none'; 
//         lightboxImg.style.transform = 'translate(0px, 0px) scale(1)'; 
//         lightboxImg.style.opacity = '1';
//         document.body.style.overflow = ''; 

//         // ==========================================================
//         // BỔ SUNG: HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
//         // ==========================================================
//         showScrolltopButton();
//         // ==========================================================
//     });

//     // Xử lý nhấp vào khoảng trống bên ngoài ảnh trong lightbox để đóng
//     lightbox.addEventListener('click', (e) => {
//         if (e.target === lightbox || e.target === lightboxClose) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = ''; 

//             // ==========================================================
//             // BỔ SUNG: HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
//             // ==========================================================
//             showScrolltopButton();
//             // ==========================================================
//         }
//     });

//     // Xử lý phím ESC để đóng lightbox
//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = ''; 

//             // ==========================================================
//             // BỔ SUNG: HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
//             // ==========================================================
//             showScrolltopButton();
//             // ==========================================================
//         }
//     });

//     // Xử lý nút điều hướng "Previous" trong lightbox
//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
//         updateLightboxImage();
//     });

//     // Xử lý nút điều hướng "Next" trong lightbox
//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
//         updateLightboxImage();
//     });

//     // --- CHỨC NĂNG KÉO (DRAG) TRONG LIGHTBOX (Zoom bị vô hiệu hóa) ---
//     function getTransformValues(element) {
//         const style = window.getComputedStyle(element);
//         const transform = style.transform || style.webkitTransform || style.mozTransform;
//         let translateX = 0, translateY = 0, scale = 1;

//         if (transform !== 'none') {
//             const matrix = new WebKitCSSMatrix(transform);
//             translateX = matrix.m41;
//             translateY = matrix.m42;
//             scale = matrix.a; 
//         }
//         return { translateX, translateY, scale };
//     }

//     function applyTransform() {
//         lightboxImg.style.transform = `translate(${startLightboxImgPosX}px, ${startLightboxImgPosY}px) scale(${currentZoomLevel})`;
//     }

//     function startDragLightbox(e) {
//         if (e.type === 'mousedown' && e.button !== 0) return; 
        
//         isDraggingLightbox = true;
//         hasDraggedLightbox = false; 

//         startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
//         startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;
        
//         const { translateX, translateY } = getTransformValues(lightboxImg); 
//         startLightboxImgPosX = translateX;
//         startLightboxImgPosY = translateY;
//         currentZoomLevel = 1; 

//         lightboxImg.style.cursor = 'grabbing';
//         lightboxImg.style.transition = 'none'; 

//         if (e.type === 'touchstart') {
//             e.preventDefault(); 
//         }
//     }

//     function dragLightbox(e) {
//         if (!isDraggingLightbox) return; 

//         const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
//         const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

//         const deltaX = currentClientX - startLightboxPosX;
//         const deltaY = currentClientY - startLightboxPosY;

//         let newPosX = startLightboxImgPosX + deltaX;
//         let newPosY = startLightboxImgPosY + deltaY;

//         startLightboxImgPosX = newPosX;
//         startLightboxImgPosY = newPosY;
//         applyTransform(); 

//         startLightboxPosX = currentClientX;
//         startLightboxPosY = currentClientY;

//         if (Math.abs(deltaX) > dragThresholdLightbox || Math.abs(deltaY) > dragThresholdLightbox) {
//             hasDraggedLightbox = true;
//         }
//         if (e.type === 'touchmove') {
//             e.preventDefault(); 
//         }
//     }

//     function endDragLightbox(e) {
//         if (isDraggingLightbox) {
//             isDraggingLightbox = false;
//             lightboxImg.style.cursor = 'grab';
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 
            
//             const lightboxWidth = lightbox.offsetWidth;
//             const currentImgPosX = getTransformValues(lightboxImg).translateX;

//             if (hasDraggedLightbox && Math.abs(currentImgPosX) > lightboxWidth * 0.2) { 
//                 if (currentImgPosX > 0) { // Kéo sang phải, chuyển về ảnh trước
//                     lightboxPrevButton.click();
//                 } else { // Kéo sang trái, chuyển về ảnh sau
//                     lightboxNextButton.click();
//                 }
//             } else {
//                 // Nếu không kéo đủ xa hoặc không kéo, trả ảnh về vị trí ban đầu
//                 lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//                 startLightboxImgPosX = 0;
//                 startLightboxImgPosY = 0;
//             }
//             hasDraggedLightbox = false;
//         }
//     }

//     lightboxImg.addEventListener('mousedown', startDragLightbox);
//     lightboxImg.addEventListener('touchstart', startDragLightbox); 

//     document.addEventListener('mousemove', dragLightbox);
//     document.addEventListener('touchmove', dragLightbox, { passive: false }); 

//     document.addEventListener('mouseup', endDragLightbox);
//     document.addEventListener('touchend', endDragLightbox);

//     // --- Hàm xử lý CUỘN CHUỘT (Wheel Zoom) chung ---
//     // Đơn giản hóa: Chỉ ngăn cuộn trang, không thực hiện zoom
//     function handleWheelZoom(e) {
//         if (!lightbox.classList.contains('active')) {
//             return; 
//         }
        
//         e.preventDefault(); 
//         e.stopPropagation(); 
//     }

//     // --- Gán listener cho sự kiện Wheel ---
//     lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false }); 
//     lightbox.addEventListener('wheel', handleWheelZoom, { passive: false }); 
//     // document.addEventListener('wheel', handleWheelZoom, { passive: false }); // Cân nhắc bỏ cái này nếu nó ảnh hưởng đến cuộn trang bình thường bên ngoài lightbox

//     // --- Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động) ---
//     lightboxImg.addEventListener('touchstart', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2) { 
//             isPinching = true;
//             stopAutoScroll(); 
//             initialPinchDistance = Math.hypot(
//                 e.touches[0].pageX - e.touches[1].pageX,
//                 e.touches[0].pageY - e.touches[1].pageY
//             );

//             lightboxImg.style.transition = 'none'; 
//         } else if (e.touches.length === 1) {
//             startDragLightbox(e);
//         }
//     }, { passive: false }); 

//     lightboxImg.addEventListener('touchmove', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2 && isPinching) {
//             e.preventDefault(); 
//         } else if (e.touches.length === 1) {
//             dragLightbox(e);
//         }
//     }, { passive: false }); 

//     lightboxImg.addEventListener('touchend', (e) => {
//         if (isPinching) {
//             isPinching = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 
//         }
//         endDragLightbox(e);
//     });

//     // ==========================================================
//     // BỔ SUNG: Xử lý sự kiện resize để ẩn/hiện nút cuộn khi xoay điện thoại
//     // ==========================================================
//     window.addEventListener('resize', () => {
//         if (lightbox.classList.contains('active')) {
//             hideScrolltopButton(); // Nếu lightbox đang mở, ẩn nút cuộn (chỉ trên mobile)
//         } else {
//             showScrolltopButton(); // Nếu lightbox đóng, hiện nút cuộn
//         }
//         initializeGallery();
//     });
//     // ==========================================================

//     initializeGallery();
// });

// ==========================================================
// HÀM scrolltotop() VÀ LOGIC CUỘN CHUNG
// ==========================================================
// function scrolltotop() {
//     window.scrollTo({
//         top: 0,
//         behavior: 'smooth'
//     });
// }

// Logic hiện/ẩn nút cuộn dựa trên vị trí scroll
// window.addEventListener('scroll', function() {
//     const scrolltopButton = document.querySelector('.scrolltop');
//     if (scrolltopButton) { 
//         const lightbox = document.getElementById('lightbox'); 
        
//         // Chỉ xử lý logic cuộn nếu lightbox KHÔNG active
//         if (!lightbox || !lightbox.classList.contains('active')) {
//             if (window.scrollY > 200) { 
//                 scrolltopButton.classList.add('active');
//             } else {
//                 scrolltopButton.classList.remove('active');
//             }
//         } else {
//             // Nếu lightbox đang active, đảm bảo nút bị ẩn bởi hideScrolltopButton()
//             // và không được thêm class 'active' bởi scroll
//             scrolltopButton.classList.remove('active');
//         }
//     }
// });
// ==========================================================


// code mới nhất đang xài

// document.addEventListener('DOMContentLoaded', () => {
//     const galleryTrack = document.getElementById('galleryTrack');
//     let galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container')); 
    
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('.lightbox-close');
//     const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
//     const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

//     const lightboxCounter = document.getElementById('lightbox-counter');
//     const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');

//     const scrollSpeed = 0.5;
//     let scrollInterval;
//     let currentScroll = 0;
//     const originalGalleryItemsCount = galleryItemContainers.length;

//     let galleryWrapperWidth = 0;
//     let originalItemsFullWidth = 0;
//     let clonedItemsPrefixWidth = 0;

//     let lightboxCurrentIndex = 0;
//     let numClones = 0;

//     // --- Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX ---
//     let isDraggingLightbox = false;
//     let startLightboxPosX = 0;
//     let startLightboxPosY = 0; 
//     let startLightboxImgPosX = 0; // Vị trí X của ảnh khi bắt đầu kéo
//     let startLightboxImgPosY = 0; // Vị trí Y của ảnh khi bắt đầu kéo
//     let dragThresholdLightbox = 50;
//     let hasDraggedLightbox = false;

//     // Biến cho tính năng ZOOM (ĐÃ BẬT LẠI ZOOM)
//     let currentZoomLevel = 1; 
//     const maxZoomLevel = 3; // Mức zoom tối đa (ví dụ: 3 lần)
//     const minZoomLevel = 1; // Mức zoom tối thiểu (không nhỏ hơn kích thước gốc)
//     const zoomSensitivity = 0.1; // Độ nhạy của zoom khi cuộn chuột

//     // Biến cho Pinch-to-zoom trên di động (ĐÃ BẬT LẠI PINCH-TO-ZOOM)
//     let initialPinchDistance = 0;
//     let isPinching = false;

//     // ==========================================================
//     // BIẾN VÀ HÀM CHO NÚT CUỘN LÊN ĐẦU TRANG (SCROLLTOP)
//     // ==========================================================
//     const scrolltopButton = document.querySelector('.scrolltop');

//     function isMobileDevice() {
//         return window.innerWidth <= 767;
//     }

//     function hideScrolltopButton() {
//         if (scrolltopButton && isMobileDevice()) {
//             scrolltopButton.classList.add('hide-on-mobile-image-view');
//         }
//     }

//     function showScrolltopButton() {
//         if (scrolltopButton) {
//             scrolltopButton.classList.remove('hide-on-mobile-image-view');
//         }
//     }
//     // ==========================================================


//     function initializeGallery() {
//         const galleryWrapper = document.querySelector('.gallery-wrapper');
//         if (!galleryWrapper || !galleryTrack) {
//             console.error("Gallery wrapper or track not found!");
//             return;
//         }

//         galleryWrapperWidth = galleryWrapper.offsetWidth;

//         Array.from(galleryTrack.children).forEach(child => {
//             if (child.classList.contains('cloned')) {
//                 galleryTrack.removeChild(child);
//             }
//         });

//         const originalItemNodes = Array.from(galleryTrack.children);
//         const currentOriginalGalleryItemsCount = originalItemNodes.length; 

//         if (currentOriginalGalleryItemsCount === 0) {
//             console.warn("No original items in galleryTrack after clearing clones.");
//             return; 
//         }

//         originalItemsFullWidth = 0;
//         originalItemNodes.forEach(containerNode => {
//             if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
//                 originalItemsFullWidth += containerNode.offsetWidth + 10;
//             } else {
//                 console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
//             }
//         });

//         if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
//             numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
//         } else {
//             numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 3; 
//             console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
//         }

//         for (let i = 1; i <= numClones; i++) {
//             const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
//             if (originalItemNodes[actualIndex]) {
//                 const clone = originalItemNodes[actualIndex].cloneNode(true);
//                 clone.classList.add('cloned');
//                 galleryTrack.prepend(clone);
//             }
//         }
//         for (let i = 0; i < numClones; i++) {
//             const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//             if (originalItemNodes[originalIndexForClone]) {
//                 const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
//                 clone.classList.add('cloned');
//                 galleryTrack.appendChild(clone);
//             }
//         }

//         galleryItemContainers = Array.from(galleryTrack.children);

//         clonedItemsPrefixWidth = 0;
//         for (let i = 0; i < numClones; i++) {
//             if (galleryItemContainers[i]) {
//                 clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//             } else {
//                 console.warn(`Prefix clone at index ${i} is undefined.`);
//             }
//         }

//         currentScroll = clonedItemsPrefixWidth;
//         galleryTrack.style.transition = 'none'; 
//         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//         requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//                 galleryTrack.style.transition = 'transform 0.01s linear'; 
//             });
//         });

//         startAutoScroll();
//     }

//     function startAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//         scrollInterval = setInterval(() => {
//             currentScroll += scrollSpeed;
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             if (currentScroll >= (originalItemsFullWidth + clonedItemsPrefixWidth)) {
//                 currentScroll = clonedItemsPrefixWidth; 
                
//                 galleryTrack.style.transition = 'none'; 
//                 galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                
//                 requestAnimationFrame(() => {
//                     requestAnimationFrame(() => {
//                         galleryTrack.style.transition = 'transform 0.01s linear'; 
//                     });
//                 });
//             }
//         }, 1000 / 60);
//     }

//     function stopAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//     }

//     galleryTrack.addEventListener('mouseenter', stopAutoScroll);
//     galleryTrack.addEventListener('mouseleave', () => {
//         startAutoScroll();
//     });

//     function updateLightboxImage() {
//         const newImgSrc = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').dataset.fullresSrc || galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').src;
//         const newImgAlt = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').alt;

//         lightboxImg.style.transition = 'none'; 
//         lightboxImg.style.transform = 'translate(0px, 0px) scale(1)'; 
//         lightboxImg.style.opacity = '0'; 

//         currentZoomLevel = 1; // Reset zoom level
//         startLightboxImgPosX = 0; // Reset vị trí dịch chuyển X
//         startLightboxImgPosY = 0; // Reset vị trí dịch chuyển Y

//         lightboxImg.onload = () => {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//             lightboxImg.onload = null;
//         };

//         lightboxImg.src = newImgSrc;
//         lightboxImg.alt = newImgAlt;

//         if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//         }

//         updateLightboxCounter();
//         updateLightboxThumbnails();
//     }

//     function updateLightboxCounter() {
//         lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${originalGalleryItemsCount}`;
//     }

//     function updateLightboxThumbnails() {
//         lightboxThumbnailsContainer.innerHTML = '';
//         galleryItemContainers.forEach((container, index) => {
//             if (index >= numClones && index < numClones + originalGalleryItemsCount) {
//                 const originalIndex = (index - numClones) % originalGalleryItemsCount;

//                 const thumbImg = document.createElement('img');
//                 thumbImg.src = container.querySelector('.gallery-item').src;
//                 thumbImg.alt = `Thumbnail ${originalIndex + 1}`;
//                 thumbImg.classList.add('lightbox-thumbnail-item');
                
//                 if (originalIndex === lightboxCurrentIndex) {
//                     thumbImg.classList.add('active');
//                 }

//                 thumbImg.addEventListener('click', () => {
//                     lightboxCurrentIndex = originalIndex;
//                     updateLightboxImage();
//                 });
//                 lightboxThumbnailsContainer.appendChild(thumbImg);
//             }
//         });
//         const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
//         if (activeThumbnail) {
//             activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
//         }
//     }


//     galleryTrack.addEventListener('click', (e) => {
//         const clickedContainer = e.target.closest('.gallery-item-container');

//         if (clickedContainer) { 
//             stopAutoScroll();

//             let clickedIndexInFullList = -1;
//             for (let i = 0; i < galleryItemContainers.length; i++) { 
//                 if (galleryItemContainers[i] === clickedContainer) {
//                     clickedIndexInFullList = i;
//                     break;
//                 }
//             }

//             let tempLightboxIndex = (clickedIndexInFullList - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
//             if (tempLightboxIndex < 0) tempLightboxIndex += originalGalleryItemsCount; 

//             lightboxCurrentIndex = tempLightboxIndex;
//             updateLightboxImage();
//             lightbox.classList.add('active');
//             document.body.style.overflow = 'hidden'; 
            
//             // ẨN NÚT CUỘN KHI LIGHTBOX MỞ
//             hideScrolltopButton();
//         }
//     });

//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active');
//         startAutoScroll();
//         isDraggingLightbox = false;
//         currentZoomLevel = 1;
//         startLightboxImgPosX = 0;
//         startLightboxImgPosY = 0;
//         lightboxImg.style.transition = 'none'; 
//         lightboxImg.style.transform = 'translate(0px, 0px) scale(1)'; 
//         lightboxImg.style.opacity = '1';
//         document.body.style.overflow = ''; 

//         // HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
//         showScrolltopButton();
//     });

//     lightbox.addEventListener('click', (e) => {
//         if (e.target === lightbox || e.target === lightboxClose) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = ''; 

//             // HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
//             showScrolltopButton();
//         }
//     });

//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1; 
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = ''; 

//             // HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
//             showScrolltopButton();
//         }
//     });

//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
//         updateLightboxImage();
//     });

//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
//         updateLightboxImage();
//     });

//     // --- CHỨC NĂNG KÉO (DRAG) TRONG LIGHTBOX ---
//     function getTransformValues(element) {
//         const style = window.getComputedStyle(element);
//         const transform = style.transform || style.webkitTransform || style.mozTransform;
//         let translateX = 0, translateY = 0, scale = 1;

//         if (transform !== 'none') {
//             const matrix = new WebKitCSSMatrix(transform);
//             translateX = matrix.m41;
//             translateY = matrix.m42;
//             scale = matrix.a; 
//         }
//         return { translateX, translateY, scale };
//     }

//     function applyTransform() {
//         lightboxImg.style.transform = `translate(${startLightboxImgPosX}px, ${startLightboxImgPosY}px) scale(${currentZoomLevel})`;
//     }

//     // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom
//     function limitImagePosition() {
//         const imgWidth = lightboxImg.offsetWidth * currentZoomLevel;
//         const imgHeight = lightboxImg.offsetHeight * currentZoomLevel;
//         const viewportWidth = lightbox.offsetWidth;
//         const viewportHeight = lightbox.offsetHeight;

//         const maxPanX = Math.max(0, (imgWidth - viewportWidth) / 2);
//         const maxPanY = Math.max(0, (imgHeight - viewportHeight) / 2);

//         if (currentZoomLevel > 1) {
//             if (startLightboxImgPosX > maxPanX) {
//                 startLightboxImgPosX = maxPanX;
//             }
//             if (startLightboxImgPosX < -maxPanX) {
//                 startLightboxImgPosX = -maxPanX;
//             }
//             if (startLightboxImgPosY > maxPanY) {
//                 startLightboxImgPosY = maxPanY;
//             }
//             if (startLightboxImgPosY < -maxPanY) {
//                 startLightboxImgPosY = -maxPanY;
//             }
//         } else {
//             // Nếu không zoom, luôn căn giữa
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//         }
//     }

//     function startDragLightbox(e) {
//         if (e.type === 'mousedown' && e.button !== 0) return; 
        
//         // Không bắt đầu kéo nếu đang pinch-to-zoom
//         if (e.touches && e.touches.length > 1) return;

//         isDraggingLightbox = true;
//         hasDraggedLightbox = false; 

//         startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
//         startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;
        
//         const { translateX, translateY } = getTransformValues(lightboxImg); 
//         startLightboxImgPosX = translateX;
//         startLightboxImgPosY = translateY;

//         lightboxImg.style.cursor = 'grabbing';
//         lightboxImg.style.transition = 'none'; 

//         if (e.type === 'touchstart') {
//             e.preventDefault(); 
//         }
//     }

//     function dragLightbox(e) {
//         if (!isDraggingLightbox || isPinching) return; // Không kéo nếu đang pinch

//         const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
//         const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

//         const deltaX = currentClientX - startLightboxPosX;
//         const deltaY = currentClientY - startLightboxPosY;

//         let newPosX = startLightboxImgPosX + deltaX;
//         let newPosY = startLightboxImgImgPosY + deltaY;

//         startLightboxImgPosX = newPosX;
//         startLightboxImgPosY = newPosY;
        
//         limitImagePosition(); // Giới hạn vị trí khi kéo
//         applyTransform(); 

//         startLightboxPosX = currentClientX;
//         startLightboxPosY = currentClientY;

//         if (Math.abs(deltaX) > dragThresholdLightbox || Math.abs(deltaY) > dragThresholdLightbox) {
//             hasDraggedLightbox = true;
//         }
//         if (e.type === 'touchmove') {
//             e.preventDefault(); 
//         }
//     }

//     function endDragLightbox(e) {
//         if (isDraggingLightbox) {
//             isDraggingLightbox = false;
//             lightboxImg.style.cursor = 'grab';
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 
            
//             if (currentZoomLevel > 1) {
//                 // Nếu đang zoom, chỉ giới hạn vị trí kéo
//                 limitImagePosition();
//                 applyTransform(); 
//             } else {
//                 // Nếu không zoom, xử lý kéo để chuyển ảnh
//                 const lightboxWidth = lightbox.offsetWidth;
//                 const currentImgPosX = getTransformValues(lightboxImg).translateX;

//                 if (hasDraggedLightbox && Math.abs(currentImgPosX) > lightboxWidth * 0.2) { 
//                     if (currentImgPosX > 0) {
//                         lightboxPrevButton.click();
//                     } else {
//                         lightboxNextButton.click();
//                     }
//                 } else {
//                     // Nếu không kéo đủ xa hoặc không kéo, trả ảnh về vị trí ban đầu
//                     lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
//                     startLightboxImgPosX = 0;
//                     startLightboxImgPosY = 0;
//                 }
//             }
//             hasDraggedLightbox = false;
//         }
//     }

//     lightboxImg.addEventListener('mousedown', startDragLightbox);
//     lightboxImg.addEventListener('touchstart', startDragLightbox); 

//     document.addEventListener('mousemove', dragLightbox);
//     document.addEventListener('touchmove', dragLightbox, { passive: false }); 

//     document.addEventListener('mouseup', endDragLightbox);
//     document.addEventListener('touchend', endDragLightbox);

//     // --- Hàm xử lý CUỘN CHUỘT (Wheel Zoom) ---
//     function handleWheelZoom(e) {
//         if (!lightbox.classList.contains('active')) {
//             return; 
//         }
        
//         e.preventDefault(); 
//         e.stopPropagation(); 

//         const delta = Math.sign(e.deltaY) * -zoomSensitivity;
//         const oldZoomLevel = currentZoomLevel;
//         currentZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

//         const bbox = lightboxImg.getBoundingClientRect();
//         const mouseX = e.clientX - bbox.left;
//         const mouseY = e.clientY - bbox.top;

//         const newScale = currentZoomLevel / oldZoomLevel;

//         startLightboxImgPosX = mouseX - ((mouseX - startLightboxImgPosX) * newScale);
//         startLightboxImgPosY = mouseY - ((mouseY - startLightboxImgPosY) * newScale);

//         limitImagePosition();
//         applyTransform();
//     }

//     lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false }); 
//     lightbox.addEventListener('wheel', handleWheelZoom, { passive: false }); 
//     // document.addEventListener('wheel', handleWheelZoom, { passive: false }); // Cân nhắc bỏ cái này nếu ảnh hưởng đến cuộn trang bình thường

//     // --- Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động) ---
//     lightboxImg.addEventListener('touchstart', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2) { 
//             isPinching = true;
//             stopAutoScroll(); 
//             initialPinchDistance = Math.hypot(
//                 e.touches[0].pageX - e.touches[1].pageX,
//                 e.touches[0].pageY - e.touches[1].pageY
//             );

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             // Điều chỉnh vị trí bắt đầu kéo để zoom vào tâm pinch
//             startLightboxImgPosX = centerX - bbox.left - (centerX - bbox.left - startLightboxImgPosX) / currentZoomLevel;
//             startLightboxImgPosY = centerY - bbox.top - (centerY - bbox.top - startLightboxImgPosY) / currentZoomLevel;

//             lightboxImg.style.transition = 'none'; 
//         } else if (e.touches.length === 1) {
//             startDragLightbox(e);
//         }
//     }, { passive: false }); 

//     lightboxImg.addEventListener('touchmove', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2 && isPinching) {
//             e.preventDefault(); 
//             const currentPinchDistance = Math.hypot(
//                 e.touches[0].pageX - e.touches[1].pageX,
//                 e.touches[0].pageY - e.touches[1].pageY
//             );

//             if (initialPinchDistance === 0) return;

//             let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
//             newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             const deltaZoom = newZoomLevel / currentZoomLevel;

//             startLightboxImgPosX = centerX - ((centerX - bbox.left - startLightboxImgPosX) * deltaZoom);
//             startLightboxImgPosY = centerY - ((centerY - bbox.top - startLightboxImgPosY) * deltaZoom);
            
//             currentZoomLevel = newZoomLevel;

//             limitImagePosition(); 
//             applyTransform();
//             initialPinchDistance = currentPinchDistance; 
//         } else if (e.touches.length === 1) {
//             dragLightbox(e);
//         }
//     }, { passive: false }); 

//     lightboxImg.addEventListener('touchend', (e) => {
//         if (isPinching) {
//             isPinching = false;
//             initialPinchDistance = 0; 
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; 
//         }
//         // Đảm bảo sau khi pinch-zoom, nếu zoom level là 1, ảnh sẽ được căn giữa
//         if (currentZoomLevel === 1) {
//             startLightboxImgPosX = 0;
//             startLightboxImgPosY = 0;
//             applyTransform();
//         }
//         endDragLightbox(e); 
//     });

//     window.addEventListener('resize', () => {
//         if (lightbox.classList.contains('active')) {
//             hideScrolltopButton();
//         } else {
//             showScrolltopButton();
//         }
//         initializeGallery();
//     });

//     initializeGallery();
// });

// // ==========================================================
// // HÀM scrolltotop() VÀ LOGIC CUỘN CHUNG (NGOÀI DOMContentLoaded)
// // ==========================================================
// function scrolltotop() {
//     window.scrollTo({
//         top: 0,
//         behavior: 'smooth'
//     });
// }

// window.addEventListener('scroll', function() {
//     const scrolltopButton = document.querySelector('.scrolltop');
//     if (scrolltopButton) { 
//         const lightbox = document.getElementById('lightbox'); 
        
//         if (!lightbox || !lightbox.classList.contains('active')) {
//             if (window.scrollY > 200) { 
//                 scrolltopButton.classList.add('active');
//             } else {
//                 scrolltopButton.classList.remove('active');
//             }
//         } else {
//             scrolltopButton.classList.remove('active');
//         }
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const galleryTrack = document.getElementById('galleryTrack');
    let galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container'));

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
    const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');

    const scrollSpeed = 0.5;
    let scrollInterval;
    let currentScroll = 0;
    const originalGalleryItemsCount = galleryItemContainers.length;

    let galleryWrapperWidth = 0;
    let originalItemsFullWidth = 0;
    let clonedItemsPrefixWidth = 0;

    let lightboxCurrentIndex = 0;
    let numClones = 0;

    // --- Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX ---
    let isDraggingLightbox = false;
    let startLightboxPosX = 0; // Vị trí bắt đầu kéo (clientX/Y)
    let startLightboxPosY = 0;
    let currentLightboxImgPosX = 0; // Vị trí X hiện tại của ảnh sau khi dịch chuyển
    let currentLightboxImgPosY = 0; // Vị trí Y hiện tại của ảnh sau khi dịch chuyển
    let dragThresholdLightbox = 50;
    let hasDraggedLightbox = false;

    // Biến cho tính năng ZOOM
    let currentZoomLevel = 1;
    const maxZoomLevel = 3; // Mức zoom tối đa (ví dụ: 3 lần)
    const minZoomLevel = 1; // Mức zoom tối thiểu (không nhỏ hơn kích thước gốc)
    const zoomSensitivity = 0.1; // Độ nhạy của zoom khi cuộn chuột

    // Biến cho Pinch-to-zoom trên di động
    let initialPinchDistance = 0;
    let isPinching = false;

    // ==========================================================
    // BIẾN VÀ HÀM CHO NÚT CUỘN LÊN ĐẦU TRANG (SCROLLTOP)
    // ==========================================================
    const scrolltopButton = document.querySelector('.scrolltop');

    function isMobileDevice() {
        return window.innerWidth <= 767;
    }

    function hideScrolltopButton() {
        if (scrolltopButton && isMobileDevice()) {
            scrolltopButton.classList.add('hide-on-mobile-image-view');
        }
    }

    function showScrolltopButton() {
        if (scrolltopButton) {
            scrolltopButton.classList.remove('hide-on-mobile-image-view');
        }
    }
    // ==========================================================


    function initializeGallery() {
        const galleryWrapper = document.querySelector('.gallery-wrapper');
        if (!galleryWrapper || !galleryTrack) {
            console.error("Gallery wrapper or track not found!");
            return;
        }

        galleryWrapperWidth = galleryWrapper.offsetWidth;

        Array.from(galleryTrack.children).forEach(child => {
            if (child.classList.contains('cloned')) {
                galleryTrack.removeChild(child);
            }
        });

        const originalItemNodes = Array.from(galleryTrack.children);
        const currentOriginalGalleryItemsCount = originalItemNodes.length;

        if (currentOriginalGalleryItemsCount === 0) {
            console.warn("No original items in galleryTrack after clearing clones.");
            return;
        }

        originalItemsFullWidth = 0;
        originalItemNodes.forEach(containerNode => {
            if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
                originalItemsFullWidth += containerNode.offsetWidth + 10;
            } else {
                console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
            }
        });

        if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
            numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
        } else {
            numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 3;
            console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
        }

        for (let i = 1; i <= numClones; i++) {
            const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
            if (originalItemNodes[actualIndex]) {
                const clone = originalItemNodes[actualIndex].cloneNode(true);
                clone.classList.add('cloned');
                galleryTrack.prepend(clone);
            }
        }
        for (let i = 0; i < numClones; i++) {
            const originalIndexForClone = i % currentOriginalGalleryItemsCount;
            if (originalItemNodes[originalIndexForClone]) {
                const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
                clone.classList.add('cloned');
                galleryTrack.appendChild(clone);
            }
        }

        galleryItemContainers = Array.from(galleryTrack.children);

        clonedItemsPrefixWidth = 0;
        for (let i = 0; i < numClones; i++) {
            if (galleryItemContainers[i]) {
                clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
            } else {
                console.warn(`Prefix clone at index ${i} is undefined.`);
            }
        }

        currentScroll = clonedItemsPrefixWidth;
        galleryTrack.style.transition = 'none';
        galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                galleryTrack.style.transition = 'transform 0.01s linear';
            });
        });

        startAutoScroll();
    }

    function startAutoScroll() {
        if (scrollInterval) clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            currentScroll += scrollSpeed;
            galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

            if (currentScroll >= (originalItemsFullWidth + clonedItemsPrefixWidth)) {
                currentScroll = clonedItemsPrefixWidth;

                galleryTrack.style.transition = 'none';
                galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        galleryTrack.style.transition = 'transform 0.01s linear';
                    });
                });
            }
        }, 1000 / 60);
    }

    function stopAutoScroll() {
        if (scrollInterval) clearInterval(scrollInterval);
    }

    galleryTrack.addEventListener('mouseenter', stopAutoScroll);
    galleryTrack.addEventListener('mouseleave', () => {
        startAutoScroll();
    });

    function updateLightboxImage() {
        const newImgSrc = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').dataset.fullresSrc || galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').src;
        const newImgAlt = galleryItemContainers[numClones + (lightboxCurrentIndex % originalGalleryItemsCount)].querySelector('.gallery-item').alt;

        // Reset transform values for the new image
        lightboxImg.style.transition = 'none';
        currentZoomLevel = 1;
        currentLightboxImgPosX = 0;
        currentLightboxImgPosY = 0;
        applyTransform(); // Apply reset transform
        lightboxImg.style.opacity = '0'; // Fade out for new image

        lightboxImg.onload = () => {
            lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
            lightboxImg.style.opacity = '1';
            lightboxImg.onload = null;
        };

        lightboxImg.src = newImgSrc;
        lightboxImg.alt = newImgAlt;

        // If image is already cached, onload might not fire, so ensure it fades in
        if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
            lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
            lightboxImg.style.opacity = '1';
        }

        updateLightboxCounter();
        updateLightboxThumbnails();
    }

    function updateLightboxCounter() {
        lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${originalGalleryItemsCount}`;
    }

    function updateLightboxThumbnails() {
        lightboxThumbnailsContainer.innerHTML = '';
        galleryItemContainers.forEach((container, index) => {
            if (index >= numClones && index < numClones + originalGalleryItemsCount) {
                const originalIndex = (index - numClones) % originalGalleryItemsCount;

                const thumbImg = document.createElement('img');
                thumbImg.src = container.querySelector('.gallery-item').src;
                thumbImg.alt = `Thumbnail ${originalIndex + 1}`;
                thumbImg.classList.add('lightbox-thumbnail-item');

                if (originalIndex === lightboxCurrentIndex) {
                    thumbImg.classList.add('active');
                }

                thumbImg.addEventListener('click', () => {
                    lightboxCurrentIndex = originalIndex;
                    updateLightboxImage();
                });
                lightboxThumbnailsContainer.appendChild(thumbImg);
            }
        });
        const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }


    galleryTrack.addEventListener('click', (e) => {
        const clickedContainer = e.target.closest('.gallery-item-container');

        if (clickedContainer) {
            stopAutoScroll();

            let clickedIndexInFullList = -1;
            for (let i = 0; i < galleryItemContainers.length; i++) {
                if (galleryItemContainers[i] === clickedContainer) {
                    clickedIndexInFullList = i;
                    break;
                }
            }

            let tempLightboxIndex = (clickedIndexInFullList - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
            if (tempLightboxIndex < 0) tempLightboxIndex += originalGalleryItemsCount;

            lightboxCurrentIndex = tempLightboxIndex;
            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            // ẨN NÚT CUỘN KHI LIGHTBOX MỞ
            hideScrolltopButton();
        }
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        startAutoScroll();
        isDraggingLightbox = false;
        currentZoomLevel = 1;
        currentLightboxImgPosX = 0;
        currentLightboxImgPosY = 0;
        lightboxImg.style.transition = 'none';
        applyTransform(); // Apply reset transform
        lightboxImg.style.opacity = '1';
        document.body.style.overflow = '';

        // HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
        showScrolltopButton();
    });

    // lightbox.addEventListener('click', (e) => {
    //     if (e.target === lightbox || e.target === lightboxClose) {
    //         lightbox.classList.remove('active');
    //         startAutoScroll();
    //         isDraggingLightbox = false;
    //         currentZoomLevel = 1;
    //         currentLightboxImgPosX = 0;
    //         currentLightboxImgPosY = 0;
    //         lightboxImg.style.transition = 'none';
    //         applyTransform(); // Apply reset transform
    //         lightboxImg.style.opacity = '1';
    //         document.body.style.overflow = '';

    //         // HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
    //         showScrolltopButton();
    //     }
    // });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            startAutoScroll();
            isDraggingLightbox = false;
            currentZoomLevel = 1;
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            lightboxImg.style.transition = 'none';
            applyTransform(); // Apply reset transform
            lightboxImg.style.opacity = '1';
            document.body.style.overflow = '';

            // HIỆN NÚT CUỘN KHI LIGHTBOX ĐÓNG
            showScrolltopButton();
        }
    });

    lightboxPrevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
        updateLightboxImage();
    });

    lightboxNextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
        updateLightboxImage();
    });

    // --- CHỨC NĂNG KÉO (DRAG) TRONG LIGHTBOX ---

    // Removed getTransformValues as it's not strictly necessary with explicit currentLightboxImgPosX/Y

    function applyTransform() {
        lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
    }

    // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom
    function limitImagePosition() {
        const imgWidth = lightboxImg.naturalWidth * currentZoomLevel;
        const imgHeight = lightboxImg.naturalHeight * currentZoomLevel;
        const viewportWidth = lightbox.offsetWidth;
        const viewportHeight = lightbox.offsetHeight;

        // Calculate current rendered width/height of the image within the lightbox
        const renderedImgWidth = lightboxImg.clientWidth * currentZoomLevel;
        const renderedImgHeight = lightboxImg.clientHeight * currentZoomLevel;


        const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
        const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

        if (currentZoomLevel > 1) {
            // Apply limits
            currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
            currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
        } else {
            // Nếu không zoom, luôn căn giữa
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
        }
    }


    function startDragLightbox(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;

        // Không bắt đầu kéo nếu đang pinch-to-zoom và có 2 ngón tay
        if (e.touches && e.touches.length > 1) return;

        isDraggingLightbox = true;
        hasDraggedLightbox = false;

        startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
        startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;

        // Store the image's current translated position at the start of the drag
        const transformStyle = window.getComputedStyle(lightboxImg).transform;
        if (transformStyle && transformStyle !== 'none') {
            const matrix = new WebKitCSSMatrix(transformStyle);
            currentLightboxImgPosX = matrix.m41;
            currentLightboxImgPosY = matrix.m42;
        } else {
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
        }

        lightboxImg.style.cursor = 'grabbing';
        lightboxImg.style.transition = 'none'; // Disable transition during drag

        if (e.type === 'touchstart') {
            e.preventDefault();
        }
    }

    function dragLightbox(e) {
        if (!isDraggingLightbox || isPinching) return; // Không kéo nếu đang pinch

        const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
        const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

        const deltaX = currentClientX - startLightboxPosX;
        const deltaY = currentClientY - startLightboxPosY;

        // Update the current position based on drag delta
        currentLightboxImgPosX += deltaX;
        currentLightboxImgPosY += deltaY;

        // Limit position only if zoomed in
        if (currentZoomLevel > 1) {
            limitImagePosition();
        } else {
            // If not zoomed, allow free drag, will be handled in endDragLightbox for prev/next
        }

        applyTransform();

        // Update start position for the next movement calculation
        startLightboxPosX = currentClientX;
        startLightboxPosY = currentClientY;

        if (Math.abs(deltaX) > dragThresholdLightbox || Math.abs(deltaY) > dragThresholdLightbox) {
            hasDraggedLightbox = true;
        }
        if (e.type === 'touchmove') {
            e.preventDefault();
        }
    }

    function endDragLightbox(e) {
        if (isDraggingLightbox) {
            isDraggingLightbox = false;
            lightboxImg.style.cursor = 'grab';
            lightboxImg.style.transition = 'transform 0.3s ease-out'; // Re-enable transition

            if (currentZoomLevel > 1) {
                // If zoomed in, just ensure image is within bounds
                limitImagePosition();
                applyTransform();
            } else {
                // If not zoomed, handle swipe to change image
                const lightboxWidth = lightbox.offsetWidth;
                // Check the net horizontal movement
                const netHorizontalMovement = currentLightboxImgPosX;

                if (hasDraggedLightbox && Math.abs(netHorizontalMovement) > lightboxWidth * 0.2) {
                    if (netHorizontalMovement > 0) {
                        lightboxPrevButton.click();
                    } else {
                        lightboxNextButton.click();
                    }
                }
                // Always reset image position if not zoomed, after checking for swipe
                currentLightboxImgPosX = 0;
                currentLightboxImgPosY = 0;
                applyTransform();
            }
            hasDraggedLightbox = false; // Reset drag flag
        }
    }


    lightboxImg.addEventListener('mousedown', startDragLightbox);
    lightboxImg.addEventListener('touchstart', startDragLightbox);

    document.addEventListener('mousemove', dragLightbox);
    document.addEventListener('touchmove', dragLightbox, { passive: false });

    document.addEventListener('mouseup', endDragLightbox);
    document.addEventListener('touchend', endDragLightbox);

    // --- Hàm xử lý CUỘN CHUỘT (Wheel Zoom) ---
    function handleWheelZoom(e) {
        if (!lightbox.classList.contains('active')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const oldZoomLevel = currentZoomLevel;
        let delta = Math.sign(e.deltaY) * -zoomSensitivity; // Negative deltaY means scrolling up (zoom in)

        currentZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

        const bbox = lightboxImg.getBoundingClientRect();
        const mouseX = e.clientX - bbox.left; // Mouse position relative to image
        const mouseY = e.clientY - bbox.top;

        const newScaleFactor = currentZoomLevel / oldZoomLevel;

        // Adjust image position to zoom towards the mouse cursor
        currentLightboxImgPosX = mouseX - ((mouseX - currentLightboxImgPosX) * newScaleFactor);
        currentLightboxImgPosY = mouseY - ((mouseY - currentLightboxImgPosY) * newScaleFactor);

        limitImagePosition(); // Apply limits after zoom
        applyTransform();
    }

    lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });
    lightbox.addEventListener('wheel', handleWheelZoom, { passive: false });

    // --- Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động) ---
    lightboxImg.addEventListener('touchstart', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.touches.length === 2) {
            isPinching = true;
            stopAutoScroll();
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            // Calculate the pinch center relative to the image
            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            // Save the current image position relative to the pinch center for smooth zoom
            // This is crucial for pinching to feel natural
            currentLightboxImgPosX = centerX - bbox.left - (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
            currentLightboxImgPosY = centerY - bbox.top - (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;


            lightboxImg.style.transition = 'none';
        } else if (e.touches.length === 1) {
            startDragLightbox(e); // Allow single-finger drag for panning
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchmove', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.touches.length === 2 && isPinching) {
            e.preventDefault();
            const currentPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            if (initialPinchDistance === 0) return; // Avoid division by zero

            let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
            newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const deltaZoom = newZoomLevel / currentZoomLevel;

            // Adjust image position based on pinch zoom and pinch center
            currentLightboxImgPosX = centerX - ((centerX - bbox.left - currentLightboxImgPosX) * deltaZoom);
            currentLightboxImgPosY = centerY - ((centerY - bbox.top - currentLightboxImgPosY) * deltaZoom);

            currentZoomLevel = newZoomLevel; // Update current zoom level

            limitImagePosition();
            applyTransform();
            initialPinchDistance = currentPinchDistance; // Update initial distance for next move
        } else if (e.touches.length === 1) {
            dragLightbox(e); // Continue single-finger drag for panning
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', (e) => {
        if (isPinching) {
            isPinching = false;
            initialPinchDistance = 0;
            lightboxImg.style.transition = 'transform 0.3s ease-out'; // Re-enable transition
        }
        // Ensure that after pinch-zoom, if the zoom level is 1, the image is centered.
        // This also handles the case where a drag ends while not zoomed.
        if (currentZoomLevel === 1) {
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            applyTransform();
        }
        endDragLightbox(e); // Call endDragLightbox to handle swipe logic if not zoomed
    });

    window.addEventListener('resize', () => {
        if (lightbox.classList.contains('active')) {
            hideScrolltopButton();
            // Re-evaluate image position and limits on resize if lightbox is open
            limitImagePosition();
            applyTransform();
        } else {
            showScrolltopButton();
        }
        initializeGallery();
    });

    initializeGallery();
});

// ==========================================================
// HÀM scrolltotop() VÀ LOGIC CUỘN CHUNG (NGOÀI DOMContentLoaded)
// ==========================================================
function scrolltotop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    const scrolltopButton = document.querySelector('.scrolltop');
    if (scrolltopButton) {
        const lightbox = document.getElementById('lightbox');

        if (!lightbox || !lightbox.classList.contains('active')) {
            if (window.scrollY > 200) {
                scrolltopButton.classList.add('active');
            } else {
                scrolltopButton.classList.remove('active');
            }
        } else {
            scrolltopButton.classList.remove('active');
        }
    }
});