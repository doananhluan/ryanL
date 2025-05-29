// document.addEventListener('DOMContentLoaded', () => {
//     const carouselTrack = document.querySelector('.carousel-track');
//     const carouselImages = document.querySelectorAll('.carousel-image');
//     const prevButton = document.querySelector('.carousel-button.prev');
//     const nextButton = document.querySelector('.carousel-button.next');
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('.lightbox-close');

//     let currentIndex = 0;
//     const imageWidth = carouselImages[0] ? carouselImages[0].clientWidth : 0; // Chiều rộng của một ảnh

//     // Cập nhật vị trí trượt
//     function updateCarousel() {
//         carouselTrack.style.transform = `translateX(${-currentIndex * imageWidth}px)`;
//     }

//     // Xử lý nút Previous
//     prevButton.addEventListener('click', () => {
//         currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselImages.length - 1;
//         updateCarousel();
//     });

//     // Xử lý nút Next
//     nextButton.addEventListener('click', () => {
//         currentIndex = (currentIndex < carouselImages.length - 1) ? currentIndex + 1 : 0;
//         updateCarousel();
//     });

//     // Xử lý khi nhấp vào ảnh trong carousel
//     carouselImages.forEach(image => {
//         image.addEventListener('click', () => {
//             lightboxImg.src = image.src; // Đặt ảnh vào lightbox
//             lightbox.classList.add('active'); // Hiển thị lightbox
//         });
//     });

//     // Xử lý đóng lightbox khi nhấp vào nút X
//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active');
//     });

//     // Xử lý đóng lightbox khi nhấp vào khoảng trống bên ngoài ảnh
//     lightbox.addEventListener('click', (e) => {
//         if (e.target.classList.contains('lightbox-overlay')) { // Chỉ đóng khi nhấp vào chính overlay, không phải ảnh
//             lightbox.classList.remove('active');
//         }
//     });

//     // Xử lý đóng lightbox khi nhấn phím ESC
//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//         }
//     });

//     // Cập nhật lại chiều rộng ảnh nếu trình duyệt thay đổi kích thước
//     window.addEventListener('resize', () => {
//         if (carouselImages[0]) { // Đảm bảo có ít nhất một ảnh
//             const newImageWidth = carouselImages[0].clientWidth;
//             // Nếu chiều rộng thay đổi, cập nhật lại transform
//             if (newImageWidth !== imageWidth) {
//                 // Bạn có thể cần cập nhật lại imageWidth ở đây nếu muốn chính xác hơn
//                 // Ví dụ: imageWidth = newImageWidth;
//                 updateCarousel();
//             }
//         }
//     });

//     // Khởi tạo carousel ở vị trí đầu tiên
//     updateCarousel();
// });


// document.addEventListener('DOMContentLoaded', () => {
//     const galleryTrack = document.getElementById('galleryTrack');
//     let galleryItems = Array.from(document.querySelectorAll('.gallery-item')); 
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img'); // Ảnh trong lightbox
//     const lightboxClose = document.querySelector('.lightbox-close');
//     const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
//     const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

//     const scrollSpeed = 0.5; 
//     let scrollInterval;
//     let currentScroll = 0; // Vị trí scroll của carousel chính
//     const originalGalleryItemsCount = galleryItems.length; 

//     let galleryWrapperWidth = 0;
//     let originalItemsFullWidth = 0; 
//     let clonedItemsPrefixWidth = 0; 

//     let lightboxCurrentIndex = 0; // Index của ảnh hiện tại trong lightbox
//     let numClones = 0;

//     // --- Biến cho chức năng KÉO TRONG LIGHTBOX ---
//     let isDraggingLightbox = false;
//     let startLightboxPosX = 0;
//     let startLightboxImgPosX = 0; // Vị trí X của ảnh trong lightbox khi bắt đầu kéo
//     let dragThresholdLightbox = 10; // Ngưỡng kéo tối thiểu
//     let hasDraggedLightbox = false; // Cờ để phân biệt kéo và click (trong lightbox)

//     // --- Khởi tạo và Nhân bản ảnh (Cloning) (giữ nguyên) ---
//     function initializeGallery() {
//         galleryWrapperWidth = document.querySelector('.gallery-wrapper').offsetWidth;

//         originalItemsFullWidth = 0;
//         galleryItems.forEach(item => {
//             originalItemsFullWidth += item.offsetWidth + 10; 
//         });

//         numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / originalGalleryItemsCount)) + 2; 

//         Array.from(galleryTrack.children).forEach(child => {
//             if (child.classList.contains('cloned')) {
//                 galleryTrack.removeChild(child);
//             }
//         });

//         for (let i = originalGalleryItemsCount - 1; i >= originalGalleryItemsCount - numClones; i--) {
//             const actualIndex = (i < 0) ? (originalGalleryItemsCount + i) : i; 
//             const clone = galleryItems[actualIndex].cloneNode(true);
//             clone.classList.add('cloned');
//             galleryTrack.prepend(clone);
//         }

//         for (let i = 0; i < numClones; i++) {
//             const clone = galleryItems[i].cloneNode(true);
//             clone.classList.add('cloned');
//             galleryTrack.appendChild(clone);
//         }

//         galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

//         clonedItemsPrefixWidth = 0;
//         for (let i = 0; i < numClones; i++) {
//             clonedItemsPrefixWidth += galleryItems[i].offsetWidth + 10;
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

//     // --- Chức năng tự động cuộn (giữ nguyên) ---
//     function startAutoScroll() {
//         if (scrollInterval) clearInterval(scrollInterval);
//         scrollInterval = setInterval(() => {
//             currentScroll += scrollSpeed;
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) {
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

//     // --- Xử lý rê chuột (hover) (giữ nguyên, nhưng không có logic kéo ở đây nữa) ---
//     galleryTrack.addEventListener('mouseenter', stopAutoScroll);
//     galleryTrack.addEventListener('mouseleave', () => {
//         // Không cần kiểm tra isDragging ở đây nữa
//         startAutoScroll();
//     });

//     // --- Xử lý Lightbox ---
//     function updateLightboxImage() {
//         lightboxImg.src = galleryItems[lightboxCurrentIndex % originalGalleryItemsCount].src;
//     }

//     // Event Delegation cho click vào ảnh carousel để mở lightbox (đã sửa)
   
//     galleryTrack.addEventListener('click', (e) => {
//         if (e.target.classList.contains('gallery-item')) {
//             stopAutoScroll(); 

//             const clickedItem = e.target;
//             let clickedIndex = -1;
//             for (let i = 0; i < galleryItems.length; i++) {
//                 if (galleryItems[i] === clickedItem) {
//                     clickedIndex = i;
//                     break;
//                 }
//             }
            
//             let originalIndex = (clickedIndex - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
//             if (originalIndex < 0) originalIndex += originalGalleryItemsCount; 

//             lightboxCurrentIndex = originalIndex; 
//             updateLightboxImage();
//             lightbox.classList.add('active'); 
//         }
//     });

//     // Xử lý nút đóng lightbox (giữ nguyên)
//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active'); 
//         startAutoScroll(); 
//     });

//     // Xử lý nhấp vào khoảng trống bên ngoài ảnh trong lightbox (giữ nguyên)
//     lightbox.addEventListener('click', (e) => {
//         // Chỉ đóng nếu click vào nền mờ hoặc nút đóng
//         if (e.target === lightbox || e.target === lightboxClose) { 
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             // Đảm bảo dừng mọi thao tác kéo đang diễn ra trong lightbox khi thoát
//             isDraggingLightbox = false;
//             lightboxImg.style.transition = ''; // Bật lại transition nếu có
//             lightboxImg.style.transform = 'translate(0,0)'; // Reset vị trí ảnh trong lightbox
//         }
//     });

//     // Xử lý phím ESC để đóng lightbox (giữ nguyên)
//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             // Đảm bảo dừng mọi thao tác kéo đang diễn ra trong lightbox khi thoát
//             isDraggingLightbox = false;
//             lightboxImg.style.transition = ''; // Bật lại transition nếu có
//             lightboxImg.style.transform = 'translate(0,0)'; // Reset vị trí ảnh trong lightbox
//         }
//     });

//     // Xử lý nút điều hướng trong lightbox (giữ nguyên)
//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
//         updateLightboxImage();
//         // Reset vị trí kéo ảnh khi chuyển ảnh trong lightbox
//         lightboxImg.style.transition = 'none';
//         lightboxImg.style.transform = 'translate(0,0)';
//         requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//                 lightboxImg.style.transition = ''; // hoặc 'transform 0.2s ease-out'
//             });
//         });
//     });

//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
//         updateLightboxImage();
//         // Reset vị trí kéo ảnh khi chuyển ảnh trong lightbox
//         lightboxImg.style.transition = 'none';
//         lightboxImg.style.transform = 'translate(0,0)';
//         requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//                 lightboxImg.style.transition = ''; // hoặc 'transform 0.2s ease-out'
//             });
//         });
//     });

//     // --- BẮT ĐẦU CHỨC NĂNG KÉO TRONG LIGHTBOX ---
//     lightboxImg.addEventListener('mousedown', (e) => {
//         if (e.button !== 0) return; // Chỉ xử lý click chuột trái
//         isDraggingLightbox = true;
//         startLightboxPosX = e.clientX;
//         // Lấy vị trí transform X hiện tại của ảnh trong lightbox
//         const transformMatrix = new WebKitCSSMatrix(window.getComputedStyle(lightboxImg).transform);
//         startLightboxImgPosX = transformMatrix.m41; // m41 là giá trị translateX
//         hasDraggedLightbox = false; // Reset cờ kéo
//         lightboxImg.style.cursor = 'grabbing';
//         lightboxImg.style.transition = 'none'; // Tắt transition khi kéo
//         e.preventDefault(); // Ngăn kéo ảnh làm chọn văn bản
//     });

//     // Lắng nghe mousemove và mouseup trên document để đảm bảo bắt được sự kiện
//     // ngay cả khi chuột ra ngoài ảnh trong lightbox khi đang kéo
//     document.addEventListener('mousemove', (e) => {
//         if (!isDraggingLightbox) return;

//         const deltaX = e.clientX - startLightboxPosX;
//         let newImgPosX = startLightboxImgPosX + deltaX;

//         // Giới hạn kéo: Ngăn ảnh kéo ra ngoài khung nhìn của lightbox quá xa
//         // Đây là phần phức tạp nhất, bạn cần tính toán dựa trên kích thước ảnh và lightbox
//         // Nếu ảnh nhỏ hơn lightbox, không cho kéo.
//         // Nếu ảnh lớn hơn, chỉ cho kéo trong giới hạn nhất định.
//         // Hiện tại, chúng ta sẽ cho phép kéo tự do và sau đó tự động căn chỉnh.

//         lightboxImg.style.transform = `translateX(${newImgPosX}px)`;

//         if (Math.abs(deltaX) > dragThresholdLightbox) {
//             hasDraggedLightbox = true;
//         }
//     });

//     document.addEventListener('mouseup', () => {
//         if (isDraggingLightbox) {
//             isDraggingLightbox = false;
//             lightboxImg.style.cursor = 'grab';
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; // Bật lại transition

//             // --- Logic chuyển ảnh khi kéo và nhả chuột ---
//             // Nếu có kéo đủ xa, chuyển ảnh
//             const lightboxWidth = lightbox.offsetWidth;
//             const currentImgPosX = new WebKitCSSMatrix(window.getComputedStyle(lightboxImg).transform).m41;

//             if (hasDraggedLightbox) {
//                 // Kéo sang phải đủ xa (để về ảnh trước)
//                 if (currentImgPosX > lightboxWidth * 0.2) { // Kéo quá 20% chiều rộng lightbox
//                     lightboxPrevButton.click(); // Giả lập click nút prev
//                 } 
//                 // Kéo sang trái đủ xa (để về ảnh sau)
//                 else if (currentImgPosX < -lightboxWidth * 0.2) { // Kéo quá 20% chiều rộng lightbox
//                     lightboxNextButton.click(); // Giả lập click nút next
//                 } else {
//                     // Nếu kéo không đủ xa để chuyển ảnh, trả ảnh về vị trí ban đầu
//                     lightboxImg.style.transform = 'translateX(0)';
//                 }
//             } else {
//                 // Nếu đây là click (không kéo), không làm gì thêm ở đây
//             }
//             hasDraggedLightbox = false; // Reset cờ kéo

//             // Reset vị trí ảnh trong lightbox về giữa sau khi chuyển ảnh hoặc nếu không đủ kéo
//             // (Hàm updateLightboxImage() và click nút prev/next đã xử lý phần này)
//             // Nếu bạn muốn ảnh tự động căn giữa nếu không đủ kéo, thì đoạn else trên đã làm
//         }
//     });

//     // --- Khởi chạy ---
//     window.addEventListener('load', initializeGallery);
// });

document.addEventListener('DOMContentLoaded', () => {
    const galleryTrack = document.getElementById('galleryTrack');
    // KHAI BÁO QUAN TRỌNG: galleryItemContainers sẽ chứa các DIV bọc ảnh
    let galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container')); 
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrevButton = document.querySelector('.lightbox-nav-button.prev-lightbox');
    const lightboxNextButton = document.querySelector('.lightbox-nav-button.next-lightbox');

    const scrollSpeed = 0.5; // Tốc độ cuộn của carousel
    let scrollInterval; // Biến lưu trữ interval của cuộn tự động
    let currentScroll = 0; // Vị trí cuộn hiện tại của carousel chính
    const originalGalleryItemsCount = galleryItemContainers.length; // Số lượng container ảnh gốc

    let galleryWrapperWidth = 0; // Chiều rộng của khung hiển thị carousel
    let originalItemsFullWidth = 0; // Tổng chiều rộng của tất cả các ảnh gốc
    let clonedItemsPrefixWidth = 0; // Chiều rộng của các ảnh clone ở đầu track

    let lightboxCurrentIndex = 0; // Index của ảnh hiện tại trong lightbox
    let numClones = 0; // Số lượng ảnh được nhân bản ở mỗi bên

    // --- Biến cho chức năng KÉO TRONG LIGHTBOX ---
    let isDraggingLightbox = false; // Cờ cho biết đang kéo ảnh trong lightbox
    let startLightboxPosX = 0; // Vị trí X của chuột khi bắt đầu kéo trong lightbox
    let startLightboxImgPosX = 0; // Vị trí transform X của ảnh trong lightbox khi bắt đầu kéo
    let dragThresholdLightbox = 10; // Ngưỡng kéo tối thiểu để kích hoạt chuyển ảnh (pixels)
    let hasDraggedLightbox = false; // Cờ cho biết đã thực hiện hành động kéo trong lightbox

    // --- Khởi tạo và Nhân bản ảnh (Cloning) ---
    function initializeGallery() {
        galleryWrapperWidth = document.querySelector('.gallery-wrapper').offsetWidth;

        originalItemsFullWidth = 0;
        // Tính toán tổng chiều rộng của các container ảnh gốc
        galleryItemContainers.forEach(container => {
            originalItemsFullWidth += container.offsetWidth + 10; // +10 cho margin-right
        });

        // Tính toán số lượng ảnh clone cần thiết để lấp đầy khung nhìn
        numClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / originalGalleryItemsCount)) + 2; 

        // Xóa các clone cũ nếu có, để tránh nhân bản lặp lại
        Array.from(galleryTrack.children).forEach(child => {
            if (child.classList.contains('cloned')) {
                galleryTrack.removeChild(child);
            }
        });

        // Clone các ảnh cuối cùng của danh sách gốc và thêm vào ĐẦU track
        for (let i = originalGalleryItemsCount - 1; i >= originalGalleryItemsCount - numClones; i--) {
            const actualIndex = (i < 0) ? (originalGalleryItemsCount + i) : i; 
            const clone = galleryItemContainers[actualIndex].cloneNode(true); // Clone toàn bộ container
            clone.classList.add('cloned');
            galleryTrack.prepend(clone);
        }

        // Clone các ảnh đầu tiên của danh sách gốc và thêm vào CUỐI track
        for (let i = 0; i < numClones; i++) {
            const clone = galleryItemContainers[i].cloneNode(true); // Clone toàn bộ container
            clone.classList.add('cloned');
            galleryTrack.appendChild(clone);
        }

        // Cập nhật lại danh sách galleryItemContainers sau khi clone đã được thêm vào DOM
        galleryItemContainers = Array.from(document.querySelectorAll('.gallery-item-container'));

        // Tính toán chiều rộng của các ảnh clone ở đầu track
        clonedItemsPrefixWidth = 0;
        for (let i = 0; i < numClones; i++) {
            clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
        }

        // Đặt vị trí scroll ban đầu để bắt đầu từ ảnh gốc đầu tiên
        currentScroll = clonedItemsPrefixWidth;
        
        // Tắt transition ngay lập tức để đặt vị trí ban đầu không bị giật
        galleryTrack.style.transition = 'none'; 
        galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

        // Sau khi đặt vị trí ban đầu, bật lại transition cho các cuộn mượt mà
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                galleryTrack.style.transition = 'transform 0.01s linear'; 
            });
        });

        startAutoScroll(); // Bắt đầu cuộn tự động
    }

    // --- Chức năng tự động cuộn ---
    function startAutoScroll() {
        if (scrollInterval) clearInterval(scrollInterval); // Xóa interval cũ nếu có
        scrollInterval = setInterval(() => {
            currentScroll += scrollSpeed; // Tăng vị trí cuộn
            galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

            // Nếu cuộn đến cuối danh sách ảnh gốc + clone ở cuối, reset về vị trí đầu ảnh gốc
            if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) {
                currentScroll = clonedItemsPrefixWidth; 
                
                // Tắt transition để reset vị trí tức thì, tránh bị giật
                galleryTrack.style.transition = 'none'; 
                galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                
                // Bật lại transition sau một khoảng thời gian ngắn
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        galleryTrack.style.transition = 'transform 0.01s linear'; 
                    });
                });
            }
        }, 1000 / 60); // Cập nhật khoảng 60 lần/giây để có chuyển động mượt
    }

    function stopAutoScroll() {
        if (scrollInterval) clearInterval(scrollInterval); // Dừng cuộn tự động
    }

    // --- Xử lý rê chuột (hover) trên carousel ---
    galleryTrack.addEventListener('mouseenter', stopAutoScroll); // Dừng khi chuột vào
    galleryTrack.addEventListener('mouseleave', () => {
        startAutoScroll(); // Bắt đầu lại khi chuột rời đi
    });

    // --- Xử lý Lightbox ---
    function updateLightboxImage() {
        // Lấy đường dẫn và alt của ảnh từ thẻ img bên trong container tương ứng
        const newImgSrc = galleryItemContainers[lightboxCurrentIndex % originalGalleryItemsCount].querySelector('.gallery-item').src;
        const newImgAlt = galleryItemContainers[lightboxCurrentIndex % originalGalleryItemsCount].querySelector('.gallery-item').alt;

        // Reset transform và opacity của ảnh trong lightbox trước khi tải ảnh mới
        lightboxImg.style.transition = 'none'; // Tắt transition để tránh giật khi reset
        lightboxImg.style.transform = 'translateX(0)'; // Đặt lại vị trí X về 0
        lightboxImg.style.opacity = '0'; // Ẩn ảnh hiện tại để có hiệu ứng mượt khi tải ảnh mới

        // Gắn listener cho sự kiện tải ảnh hoàn tất
        lightboxImg.onload = () => {
            lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out'; // Bật lại transition
            lightboxImg.style.opacity = '1'; // Hiển thị ảnh mới
            lightboxImg.onload = null; // Gỡ bỏ listener để tránh lỗi lặp lại
        };

        // Cập nhật src và alt cho ảnh trong lightbox
        lightboxImg.src = newImgSrc;
        lightboxImg.alt = newImgAlt;

        // Nếu ảnh mới trùng với ảnh cũ (ví dụ: chuyển từ ảnh cuối về ảnh đầu), chỉ hiển thị lại
        if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
            lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
            lightboxImg.style.opacity = '1';
        }
    }

    // Event Delegation cho click vào ảnh carousel để mở lightbox
    galleryTrack.addEventListener('click', (e) => {
        // Sử dụng .closest() để tìm phần tử cha gần nhất có class 'gallery-item-container'
        // Điều này đảm bảo click vào ảnh, overlay, hoặc icon đều hoạt động
        const clickedContainer = e.target.closest('.gallery-item-container');
        
        if (clickedContainer) { // Nếu tìm thấy một container hợp lệ
            stopAutoScroll(); // Dừng cuộn tự động của carousel

            let clickedIndex = -1;
            // Duyệt qua danh sách các container để tìm chỉ mục của container được click
            for (let i = 0; i < galleryItemContainers.length; i++) { 
                if (galleryItemContainers[i] === clickedContainer) {
                    clickedIndex = i;
                    break;
                }
            }
            
            // Tính toán chỉ mục của ảnh gốc (loại bỏ ảnh clone)
            let originalIndex = (clickedIndex - numClones + originalGalleryItemsCount) % originalGalleryItemsCount;
            if (originalIndex < 0) originalIndex += originalGalleryItemsCount; 

            lightboxCurrentIndex = originalIndex; // Đặt chỉ mục ảnh hiện tại cho lightbox
            updateLightboxImage(); // Cập nhật ảnh trong lightbox
            lightbox.classList.add('active'); // Hiển thị lightbox
        }
    });

    // Xử lý nút đóng lightbox
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active'); // Ẩn lightbox
        startAutoScroll(); // Khởi động lại cuộn tự động
        // Reset trạng thái kéo và vị trí ảnh trong lightbox khi đóng
        isDraggingLightbox = false;
        lightboxImg.style.transition = 'none'; 
        lightboxImg.style.transform = 'translateX(0)'; 
        lightboxImg.style.opacity = '1'; // Đảm bảo ảnh hiển thị đầy đủ khi mở lại
    });

    // Xử lý nhấp vào khoảng trống bên ngoài ảnh trong lightbox để đóng
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxClose) { // Nếu click vào nền mờ hoặc nút đóng
            lightbox.classList.remove('active');
            startAutoScroll();
            isDraggingLightbox = false;
            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = 'translateX(0)';
            lightboxImg.style.opacity = '1';
        }
    });

    // Xử lý phím ESC để đóng lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            startAutoScroll();
            isDraggingLightbox = false;
            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = 'translateX(0)';
            lightboxImg.style.opacity = '1';
        }
    });

    // Xử lý nút điều hướng "Previous" trong lightbox
    lightboxPrevButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (ví dụ: đóng lightbox)
        lightboxCurrentIndex = (lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : originalGalleryItemsCount - 1;
        updateLightboxImage(); // Cập nhật ảnh mới
    });

    // Xử lý nút điều hướng "Next" trong lightbox
    lightboxNextButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
        lightboxCurrentIndex = (lightboxCurrentIndex < originalGalleryItemsCount - 1) ? lightboxCurrentIndex + 1 : 0;
        updateLightboxImage(); // Cập nhật ảnh mới
    });

    // --- CHỨC NĂNG KÉO (DRAG) TRONG LIGHTBOX ---
    lightboxImg.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Chỉ xử lý click chuột trái
        isDraggingLightbox = true;
        startLightboxPosX = e.clientX; // Lưu vị trí X ban đầu của chuột
        // Lấy vị trí transform X hiện tại của ảnh trong lightbox
        const transformMatrix = new WebKitCSSMatrix(window.getComputedStyle(lightboxImg).transform);
        startLightboxImgPosX = transformMatrix.m41; 
        hasDraggedLightbox = false; // Reset cờ kéo
        lightboxImg.style.cursor = 'grabbing'; // Thay đổi con trỏ chuột
        lightboxImg.style.transition = 'none'; // Tắt transition khi kéo để đảm bảo mượt mà
        e.preventDefault(); // Ngăn kéo ảnh làm chọn văn bản
    });

    // Lắng nghe mousemove trên document để bắt sự kiện ngay cả khi chuột ra ngoài ảnh
    document.addEventListener('mousemove', (e) => {
        if (!isDraggingLightbox) return; // Chỉ xử lý nếu đang kéo

        const deltaX = e.clientX - startLightboxPosX; // Độ lệch X của chuột
        let newImgPosX = startLightboxImgPosX + deltaX; // Vị trí X mới của ảnh

        lightboxImg.style.transform = `translateX(${newImgPosX}px)`; // Áp dụng transform

        // Đặt cờ hasDraggedLightbox nếu chuột di chuyển đủ xa
        if (Math.abs(deltaX) > dragThresholdLightbox) {
            hasDraggedLightbox = true;
        }
    });

    // Lắng nghe mouseup trên document để kết thúc kéo
    document.addEventListener('mouseup', () => {
        if (isDraggingLightbox) {
            isDraggingLightbox = false; // Kết thúc kéo
            lightboxImg.style.cursor = 'grab'; // Trả lại con trỏ chuột
            
            // Bật lại transition sau khi kéo để có hiệu ứng trượt về vị trí mới
            lightboxImg.style.transition = 'transform 0.3s ease-out'; 

            const lightboxWidth = lightbox.offsetWidth; // Chiều rộng của lightbox
            // Lấy vị trí transform X cuối cùng của ảnh
            const currentImgPosX = new WebKitCSSMatrix(window.getComputedStyle(lightboxImg).transform).m41;

            if (hasDraggedLightbox) { // Nếu thực sự đã kéo (không phải click)
                // Kéo sang phải đủ xa để chuyển về ảnh trước đó
                if (currentImgPosX > lightboxWidth * 0.2) { 
                    lightboxPrevButton.click(); // Giả lập click nút Prev
                } 
                // Kéo sang trái đủ xa để chuyển về ảnh tiếp theo
                else if (currentImgPosX < -lightboxWidth * 0.2) { 
                    lightboxNextButton.click(); // Giả lập click nút Next
                } else {
                    // Nếu kéo không đủ xa để chuyển ảnh, trả ảnh về vị trí ban đầu (0,0)
                    lightboxImg.style.transform = 'translateX(0)';
                }
            } else {
                // Nếu đây chỉ là một click (không kéo), đảm bảo ảnh trở về vị trí 0
                lightboxImg.style.transform = 'translateX(0)'; 
            }
            hasDraggedLightbox = false; // Reset cờ kéo
        }
    });

    // --- Khởi chạy khi trang tải xong ---
    window.addEventListener('load', initializeGallery);
});