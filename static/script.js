//      document.addEventListener('DOMContentLoaded', () => {
//     // Các biến và phần tử DOM liên quan đến Lightbox (chung cho tất cả các gallery)
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('#lightbox .lightbox-close');
//     const lightboxPrevButton = document.querySelector('#lightbox .prev-lightbox');
//     const lightboxNextButton = document.querySelector('#lightbox .next-lightbox');
//     const lightboxCounter = document.getElementById('lightbox-counter');
//     const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');
//     const lightboxContent = document.querySelector('.lightbox-content'); // Lấy phần tử lightbox-content

//     // Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX (chung)
//     let isDraggingLightbox = false;
//     let startLightboxPosX = 0;
//     let startLightboxPosY = 0;
//     let currentLightboxImgPosX = 0;
//     let currentLightboxImgPosY = 0;
//     let hasDraggedLightbox = false;

//     // Biến cho tính năng ZOOM (chung)
//     let currentZoomLevel = 1;
//     const maxZoomLevel = 3;
//     const minZoomLevel = 1;
//     const zoomSensitivity = 0.1;

//     // Biến cho Pinch-to-zoom trên di động (chung)
//     let initialPinchDistance = 0;
//     let isPinching = false;

//     // Mảng chứa TẤT CẢ các item ảnh gốc từ TẤT CẢ các gallery
//     let allGalleryItems = [];

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

//     // Hàm áp dụng transform cho ảnh trong lightbox
//     function applyTransform() {
//         lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
//     }

//     // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom trong lightbox
//     function limitImagePosition() {
//         const imgNaturalWidth = lightboxImg.naturalWidth;
//         const imgNaturalHeight = lightboxImg.naturalHeight;

//         // Lấy kích thước hiển thị của lightbox content (parent của ảnh)
//         const lightboxContent = lightboxImg.closest('.lightbox-content');
//         if (!lightboxContent) return; // Đảm bảo phần tử tồn tại

//         const viewportWidth = lightboxContent.offsetWidth;
//         const viewportHeight = lightboxContent.offsetHeight;

//         // Calculate rendered dimensions of the image
//         const renderedImgWidth = imgNaturalWidth * currentZoomLevel;
//         const renderedImgHeight = imgNaturalHeight * currentZoomLevel;

//         // Calculate maximum pan distance
//         const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
//         const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

//         if (currentZoomLevel > 1) {
//             currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
//             currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
//         } else {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//         }
//     }

//     // Hàm cập nhật ảnh trong lightbox
//     function updateLightboxImage(index) {
//         lightboxCurrentIndex = index; // Cập nhật chỉ số hiện tại của lightbox
//         const newImgSrc = allGalleryItems[lightboxCurrentIndex].dataset.fullresSrc || allGalleryItems[lightboxCurrentIndex].src;
//         const newImgAlt = allGalleryItems[lightboxCurrentIndex].alt;

//         lightboxImg.style.transition = 'none';
//         currentZoomLevel = 1;
//         currentLightboxImgPosX = 0;
//         currentLightboxImgPosY = 0;
//         applyTransform();
//         lightboxImg.style.opacity = '0';

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
//         lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${allGalleryItems.length}`;
//     }

//     function updateLightboxThumbnails() {
//         lightboxThumbnailsContainer.innerHTML = '';
//         allGalleryItems.forEach((item, index) => {
//             const thumbImg = document.createElement('img');
//             thumbImg.src = item.src;
//             thumbImg.alt = `Thumbnail ${index + 1}`;
//             thumbImg.classList.add('lightbox-thumbnail-item');

//             if (index === lightboxCurrentIndex) {
//                 thumbImg.classList.add('active');
//             }

//             thumbImg.addEventListener('click', (e) => {
//                 e.stopPropagation(); // NGĂN CHẶN SỰ KIỆN CLICK LAN TRUYỀN LÊN LIGHTBOX
//                 updateLightboxImage(index);
//             });
//             lightboxThumbnailsContainer.appendChild(thumbImg);
//         });
//         const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
//         if (activeThumbnail) {
//             activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
//         }
//     }

//     // Xử lý sự kiện kéo (drag) trong lightbox
//     function startDragLightbox(e) {
//         if (e.type === 'mousedown' && e.button !== 0) return;
//         if (e.touches && e.touches.length > 1) return;

//         isDraggingLightbox = true;
//         hasDraggedLightbox = false;

//         startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
//         startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;

//         const transformStyle = window.getComputedStyle(lightboxImg).transform;
//         if (transformStyle && transformStyle !== 'none') {
//             const matrix = new WebKitCSSMatrix(transformStyle);
//             currentLightboxImgPosX = matrix.m41;
//             currentLightboxImgPosY = matrix.m42;
//         } else {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//         }

//         lightboxImg.style.cursor = 'grabbing';
//         lightboxImg.style.transition = 'none';

//         if (e.type === 'touchstart') {
//             e.preventDefault();
//         }
//     }

//     function dragLightbox(e) {
//         if (!isDraggingLightbox || isPinching) return;

//         const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
//         const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

//         const deltaX = currentClientX - startLightboxPosX;
//         const deltaY = currentClientY - startLightboxPosY;

//         currentLightboxImgPosX += deltaX;
//         currentLightboxImgPosY += deltaY;

//         if (currentZoomLevel > 1) {
//             limitImagePosition();
//         }

//         applyTransform();

//         startLightboxPosX = currentClientX;
//         startLightboxPosY = currentClientY;

//         if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
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
//                 limitImagePosition();
//                 applyTransform();
//             } else {
//                 // Lấy kích thước của lightbox (toàn màn hình) để tính toán vuốt
//                 const lightboxWidth = lightbox.offsetWidth;
//                 const netHorizontalMovement = currentLightboxImgPosX;

//                 if (hasDraggedLightbox && Math.abs(netHorizontalMovement) > lightboxWidth * 0.2) {
//                     if (netHorizontalMovement > 0) {
//                         lightboxPrevButton.click();
//                     } else {
//                         lightboxNextButton.click();
//                     }
//                 }
//                 currentLightboxImgPosX = 0;
//                 currentLightboxImgPosY = 0;
//                 applyTransform();
//             }
//             hasDraggedLightbox = false;
//         }
//     }

//     // Xử lý CUỘN CHUỘT (Wheel Zoom)
//     function handleWheelZoom(e) {
//         if (!lightbox.classList.contains('active') || e.target !== lightboxImg) {
//             return;
//         }

//         e.preventDefault();
//         e.stopPropagation();

//         const oldZoomLevel = currentZoomLevel;
//         let delta = Math.sign(e.deltaY) * -zoomSensitivity;

//         let newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

//         const bbox = lightboxImg.getBoundingClientRect();
//         const mouseXRelativeToImage = e.clientX - bbox.left;
//         const mouseYRelativeToImage = e.clientY - bbox.top;

//         const mouseXInImageContent = (mouseXRelativeToImage - currentLightboxImgPosX) / oldZoomLevel;
//         const mouseYInImageContent = (mouseYRelativeToImage - currentLightboxImgPosY) / oldZoomLevel;

//         currentLightboxImgPosX = mouseXRelativeToImage - (mouseXInImageContent * newZoomLevel);
//         currentLightboxImgPosY = mouseYRelativeToImage - (mouseYInImageContent * newZoomLevel);

//         currentZoomLevel = newZoomLevel;

//         limitImagePosition();
//         applyTransform();
//     }

//     // Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động)
//     lightboxImg.addEventListener('touchstart', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2) {
//             isPinching = true;
//             initialPinchDistance = Math.hypot(
//                 e.touches[0].pageX - e.touches[1].pageX,
//                 e.touches[0].pageY - e.touches[1].pageY
//             );

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             const initialPinchXInImageContent = (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
//             const initialPinchYInImageContent = (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;

//             currentLightboxImgPosX = centerX - (initialPinchXInImageContent * currentZoomLevel);
//             currentLightboxImgPosY = centerY - (initialPinchYInImageContent * currentZoomLevel);

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

//             const oldZoomLevel = currentZoomLevel;
//             let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
//             newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             const deltaZoom = newZoomLevel / oldZoomLevel;

//             currentLightboxImgPosX = centerX - ((centerX - currentLightboxImgPosX) * deltaZoom);
//             currentLightboxImgPosY = centerY - ((centerY - currentLightboxImgPosY) * deltaZoom);

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
//         if (currentZoomLevel === 1) {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             applyTransform();
//         }
//         endDragLightbox(e);
//     });

//     // Các sự kiện chung cho lightbox
//     lightboxImg.addEventListener('mousedown', startDragLightbox);
//     lightboxImg.addEventListener('touchstart', startDragLightbox);
//     document.addEventListener('mousemove', dragLightbox);
//     document.addEventListener('touchmove', dragLightbox, { passive: false });
//     document.addEventListener('mouseup', endDragLightbox);
//     document.addEventListener('touchend', endDragLightbox);
//     lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });

//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active');
//         isDraggingLightbox = false;
//         currentZoomLevel = 1;
//         currentLightboxImgPosX = 0;
//         currentLightboxImgPosY = 0;
//         lightboxImg.style.transition = 'none';
//         applyTransform();
//         lightboxImg.style.opacity = '1';
//         document.body.style.overflow = '';
//         showScrolltopButton();
//     });

//     // Ngăn chặn click vào lightbox-counter làm đóng lightbox
//     if (lightboxCounter) {
//         lightboxCounter.addEventListener('click', (e) => {
//             e.stopPropagation(); // Ngăn sự kiện click lan truyền lên phần tử lightbox
//         });
//     }

//     // Ngăn chặn click vào lightbox-thumbnails làm đóng lightbox
//     if (lightboxThumbnailsContainer) {
//         lightboxThumbnailsContainer.addEventListener('click', (e) => {
//             e.stopPropagation(); // Ngăn sự kiện click lan truyền lên phần tử lightbox
//         });
//     }

//     lightbox.addEventListener('click', (e) => {
//         // Kiểm tra xem click có xảy ra trên bất kỳ phần tử con nào của lightboxContent không.
//         // Nếu không, tức là click vào vùng trống (bao gồm cả vùng khung xanh).
//         // hasDraggedLightbox để tránh đóng ngay sau khi kéo.
//         if (!hasDraggedLightbox && !lightboxContent.contains(e.target)) { // ĐÃ CẬP NHẬT ĐIỀU KIỆN
//             lightbox.classList.remove('active');
//             isDraggingLightbox = false;
//             currentZoomLevel = 1;
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             applyTransform();
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = '';
//             showScrolltopButton();
//         }
//     });

//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             isDraggingLightbox = false;
//             currentZoomLevel = 1;
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             applyTransform();
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = '';
//             showScrolltopButton();
//         }
//     });

//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         updateLightboxImage((lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : allGalleryItems.length - 1);
//     });

//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         updateLightboxImage((lightboxCurrentIndex < allGalleryItems.length - 1) ? lightboxCurrentIndex + 1 : 0);
//     });

//     // ==========================================================
//     // HÀM TÁI SỬ DỤNG CHO MỖI GALLERY
//     // ==========================================================
//     function setupAutoScrollingGallery(galleryId, scrollSpeed) {
//         const galleryTrack = document.getElementById(galleryId);
//         if (!galleryTrack) {
//             console.error(`Gallery track with ID ${galleryId} not found!`);
//             return;
//         }

//         let galleryItemContainers = Array.from(galleryTrack.querySelectorAll('.gallery-item-container'));
//         let animationFrameId; // Dùng cho requestAnimationFrame
//         let currentScroll = 0;
//         const originalGalleryItemsCount = galleryItemContainers.length;

//         let galleryWrapperWidth = 0;
//         let originalItemsFullWidth = 0;
//         let clonedItemsPrefixWidth = 0;
//         let numClones = 0;

//         function initializeGallery() {
//             const galleryWrapper = galleryTrack.closest('.gallery-wrapper');
//             if (!galleryWrapper) {
//                 console.error("Gallery wrapper not found for track:", galleryId);
//                 return;
//             }

//             galleryWrapperWidth = galleryWrapper.offsetWidth;

//             // Xóa các bản sao cũ trước khi thêm mới
//             Array.from(galleryTrack.children).forEach(child => {
//                 if (child.classList.contains('cloned')) {
//                     galleryTrack.removeChild(child);
//                 }
//             });

//             const originalItemNodes = Array.from(galleryTrack.children);
//             const currentOriginalGalleryItemsCount = originalItemNodes.length;

//             if (currentOriginalGalleryItemsCount === 0) {
//                 console.warn(`No original items in galleryTrack ${galleryId} after clearing clones.`);
//                 return;
//             }

//             originalItemsFullWidth = 0;
//             originalItemNodes.forEach(containerNode => {
//                 if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
//                     originalItemsFullWidth += containerNode.offsetWidth + 10;
//                 } else {
//                     console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
//                 }
//             });

//             if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
//                 let calculatedMinimumClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
//                 numClones = Math.max(calculatedMinimumClones, currentOriginalGalleryItemsCount);
//             } else {
//                 numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 5;
//                 console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
//             }

//             // Thêm các bản sao vào phía trước (prepend)
//             for (let i = 1; i <= numClones; i++) {
//                 const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
//                 if (originalItemNodes[actualIndex]) {
//                     const clone = originalItemNodes[actualIndex].cloneNode(true);
//                     clone.classList.add('cloned');
//                     galleryTrack.prepend(clone);
//                 }
//             }
//             // Thêm các bản sao vào phía sau (append)
//             for (let i = 0; i < numClones; i++) {
//                 const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//                 if (originalItemNodes[originalIndexForClone]) {
//                     const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
//                     clone.classList.add('cloned');
//                     galleryTrack.appendChild(clone);
//                 }
//             }

//             galleryItemContainers = Array.from(galleryTrack.children);

//             clonedItemsPrefixWidth = 0;
//             for (let i = 0; i < numClones; i++) {
//                 if (galleryItemContainers[i]) {
//                     clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//                 } else {
//                     console.warn(`Prefix clone at index ${i} is undefined.`);
//                 }
//             }

//             currentScroll = clonedItemsPrefixWidth;
//             galleryTrack.style.transition = 'none';
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             requestAnimationFrame(() => {
//                 requestAnimationFrame(() => {
//                     galleryTrack.style.transition = 'transform 0.05s linear'; // ĐÃ ĐIỀU CHỈNH
//                 });
//             });

//             startAutoScroll();
//         }

//         function startAutoScroll() {
//             if (animationFrameId) cancelAnimationFrame(animationFrameId); // Hủy frame cũ nếu có

//             function animateScroll() {
//                 currentScroll += scrollSpeed;

//                 galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//                 // Logic reset dựa trên hướng cuộn
//                 if (scrollSpeed > 0) { // Trượt từ phải sang trái (currentScroll tăng)
//                     if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) {
//                         currentScroll = clonedItemsPrefixWidth;
//                         galleryTrack.style.transition = 'none';
//                         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
//                         requestAnimationFrame(() => {
//                             requestAnimationFrame(() => {
//                                 galleryTrack.style.transition = 'transform 0.05s linear'; // ĐÃ ĐIỀU CHỈNH
//                             });
//                         });
//                     }
//                 } else { // Trượt từ trái sang phải (currentScroll giảm)
//                     if (currentScroll <= (clonedItemsPrefixWidth - originalItemsFullWidth)) {
//                         currentScroll = clonedItemsPrefixWidth;
//                         galleryTrack.style.transition = 'none';
//                         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
//                         requestAnimationFrame(() => {
//                             requestAnimationFrame(() => {
//                                 galleryTrack.style.transition = 'transform 0.05s linear'; // ĐÃ ĐIỀU CHỈNH
//                             });
//                         });
//                     }
//                 }
//                 animationFrameId = requestAnimationFrame(animateScroll); // Tiếp tục vòng lặp
//             }
//             animationFrameId = requestAnimationFrame(animateScroll); // Bắt đầu vòng lặp
//         }

//         function stopAutoScroll() {
//             if (animationFrameId) cancelAnimationFrame(animationFrameId);
//         }

//         galleryTrack.addEventListener('mouseenter', stopAutoScroll);
//         galleryTrack.addEventListener('mouseleave', () => {
//             startAutoScroll();
//         });

//         // Xử lý click vào lớp phủ ảnh trong gallery để mở lightbox
//         galleryTrack.addEventListener('click', (e) => {
//             const clickedOverlay = e.target.closest('.gallery-item-overlay');

//             if (clickedOverlay) {
//                 const clickedImage = clickedOverlay.previousElementSibling; // Lấy thẻ img liền kề trước đó
//                 if (clickedImage && clickedImage.classList.contains('gallery-item')) {
//                     // Lấy originalIndex từ data attribute
//                     const originalIndex = parseInt(clickedImage.dataset.originalIndex);

//                     if (!isNaN(originalIndex)) {
//                         updateLightboxImage(originalIndex);
//                         lightbox.classList.add('active');
//                         document.body.style.overflow = 'hidden';
//                         hideScrolltopButton();
//                     } else {
//                         console.warn("data-original-index not found or invalid on clicked image:", clickedImage);
//                     }
//                 }
//             }
//         });

//         // Khởi tạo gallery khi hàm được gọi
//         initializeGallery();

//         // Xử lý resize cho từng gallery
//         window.addEventListener('resize', () => {
//             if (!lightbox.classList.contains('active')) {
//                 initializeGallery();
//             }
//         });
//     } // Kết thúc setupAutoScrollingGallery

//     // Thu thập tất cả các item ảnh từ TẤT CẢ các gallery để dùng cho lightbox
//     // Cần làm điều này SAU KHI DOMContentLoaded hoàn tất và tất cả các gallery đã được thêm vào DOM
//     document.querySelectorAll('.gallery-item').forEach(item => {
//         allGalleryItems.push(item);
//     });

//     // Gọi hàm setupAutoScrollingGallery cho mỗi gallery của bạn
//     // Gallery 1: Trượt từ phải sang trái (scrollSpeed dương)
//     setupAutoScrollingGallery('galleryTrack1', 0.5);

//     // Gallery 2: Trượt từ trái sang phải (scrollSpeed âm)
//     setupAutoScrollingGallery('galleryTrack2', -0.5);

//     // Xử lý resize cho lightbox (chung)
//     window.addEventListener('resize', () => {
//         if (lightbox.classList.contains('active')) {
//             hideScrolltopButton();
//             limitImagePosition();
//             applyTransform();
//         } else {
//             showScrolltopButton();
//         }
//     });

//     // Gắn sự kiện click cho nút scrolltop (đã bỏ onclick trong HTML)
//     if (scrolltopButton) {
//         scrolltopButton.addEventListener('click', scrolltotop);
//     }

// }); 
// Kết thúc DOMContentLoaded

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

//update_0625

// document.addEventListener('DOMContentLoaded', () => {
//     // Các biến và phần tử DOM liên quan đến Lightbox (chung cho tất cả các gallery)
//     const lightbox = document.getElementById('lightbox');
//     const lightboxImg = document.getElementById('lightbox-img');
//     const lightboxClose = document.querySelector('#lightbox .lightbox-close');
//     const lightboxPrevButton = document.querySelector('#lightbox .prev-lightbox');
//     const lightboxNextButton = document.querySelector('#lightbox .next-lightbox');
//     const lightboxCounter = document.getElementById('lightbox-counter');
//     const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');
//     const lightboxContent = document.querySelector('.lightbox-content');

//     // Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX (chung)
//     let isDraggingLightbox = false;
//     let startLightboxPosX = 0;
//     let startLightboxPosY = 0;
//     let currentLightboxImgPosX = 0;
//     let currentLightboxImgPosY = 0;
//     let hasDraggedLightbox = false;

//     // Biến cho tính năng ZOOM (chung)
//     let currentZoomLevel = 1;
//     const maxZoomLevel = 3;
//     const minZoomLevel = 1;
//     const zoomSensitivity = 0.1;

//     // Biến cho Pinch-to-zoom trên di động (chung)
//     let initialPinchDistance = 0;
//     let isPinching = false;

//     // Mảng chứa TẤT CẢ các item ảnh gốc từ TẤT CẢ các gallery
//     let allGalleryItems = [];

//     // ==========================================================
//     // THÊM HÀM PRELOAD IMAGES
//     // ==========================================================
//     function preloadGalleryImages(callback) {
//         const allImages = document.querySelectorAll('.gallery-item');
//         let loadedCount = 0;
//         let totalImages = allImages.length;

//         if (totalImages === 0) {
//             callback();
//             return;
//         }

//         function checkAllLoaded() {
//             loadedCount++;
//             if (loadedCount >= totalImages) {
//                 // Đợi thêm một chút để đảm bảo DOM được render đầy đủ
//                 setTimeout(() => {
//                     callback();
//                 }, 100);
//             }
//         }

//         allImages.forEach(img => {
//             if (img.complete && img.naturalHeight !== 0) {
//                 checkAllLoaded();
//             } else {
//                 img.addEventListener('load', checkAllLoaded);
//                 img.addEventListener('error', checkAllLoaded);
                
//                 // Fallback nếu ảnh không load được sau 5 giây
//                 setTimeout(checkAllLoaded, 5000);
//             }
//         });
//     }

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

//     // Hàm áp dụng transform cho ảnh trong lightbox
//     function applyTransform() {
//         lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
//     }

//     // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom trong lightbox
//     function limitImagePosition() {
//         const imgNaturalWidth = lightboxImg.naturalWidth;
//         const imgNaturalHeight = lightboxImg.naturalHeight;

//         const lightboxContent = lightboxImg.closest('.lightbox-content');
//         if (!lightboxContent) return;

//         const viewportWidth = lightboxContent.offsetWidth;
//         const viewportHeight = lightboxContent.offsetHeight;

//         const renderedImgWidth = imgNaturalWidth * currentZoomLevel;
//         const renderedImgHeight = imgNaturalHeight * currentZoomLevel;

//         const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
//         const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

//         if (currentZoomLevel > 1) {
//             currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
//             currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
//         } else {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//         }
//     }

//     // Hàm cập nhật ảnh trong lightbox
//     function updateLightboxImage(index) {
//         lightboxCurrentIndex = index;
//         const newImgSrc = allGalleryItems[lightboxCurrentIndex].dataset.fullresSrc || allGalleryItems[lightboxCurrentIndex].src;
//         const newImgAlt = allGalleryItems[lightboxCurrentIndex].alt;

//         lightboxImg.style.transition = 'none';
//         currentZoomLevel = 1;
//         currentLightboxImgPosX = 0;
//         currentLightboxImgPosY = 0;
//         applyTransform();
//         lightboxImg.style.opacity = '0';

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
//         lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${allGalleryItems.length}`;
//     }

//     function updateLightboxThumbnails() {
//         lightboxThumbnailsContainer.innerHTML = '';
//         allGalleryItems.forEach((item, index) => {
//             const thumbImg = document.createElement('img');
//             thumbImg.src = item.src;
//             thumbImg.alt = `Thumbnail ${index + 1}`;
//             thumbImg.classList.add('lightbox-thumbnail-item');

//             if (index === lightboxCurrentIndex) {
//                 thumbImg.classList.add('active');
//             }

//             thumbImg.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 updateLightboxImage(index);
//             });
//             lightboxThumbnailsContainer.appendChild(thumbImg);
//         });
//         const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
//         if (activeThumbnail) {
//             activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
//         }
//     }

//     // [Giữ nguyên tất cả các hàm xử lý drag, zoom, pinch... từ code cũ]
//     function startDragLightbox(e) {
//         if (e.type === 'mousedown' && e.button !== 0) return;
//         if (e.touches && e.touches.length > 1) return;

//         isDraggingLightbox = true;
//         hasDraggedLightbox = false;

//         startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
//         startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;

//         const transformStyle = window.getComputedStyle(lightboxImg).transform;
//         if (transformStyle && transformStyle !== 'none') {
//             const matrix = new WebKitCSSMatrix(transformStyle);
//             currentLightboxImgPosX = matrix.m41;
//             currentLightboxImgPosY = matrix.m42;
//         } else {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//         }

//         lightboxImg.style.cursor = 'grabbing';
//         lightboxImg.style.transition = 'none';

//         if (e.type === 'touchstart') {
//             e.preventDefault();
//         }
//     }

//     function dragLightbox(e) {
//         if (!isDraggingLightbox || isPinching) return;

//         const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
//         const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

//         const deltaX = currentClientX - startLightboxPosX;
//         const deltaY = currentClientY - startLightboxPosY;

//         currentLightboxImgPosX += deltaX;
//         currentLightboxImgPosY += deltaY;

//         if (currentZoomLevel > 1) {
//             limitImagePosition();
//         }

//         applyTransform();

//         startLightboxPosX = currentClientX;
//         startLightboxPosY = currentClientY;

//         if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
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
//                 limitImagePosition();
//                 applyTransform();
//             } else {
//                 const lightboxWidth = lightbox.offsetWidth;
//                 const netHorizontalMovement = currentLightboxImgPosX;

//                 if (hasDraggedLightbox && Math.abs(netHorizontalMovement) > lightboxWidth * 0.2) {
//                     if (netHorizontalMovement > 0) {
//                         lightboxPrevButton.click();
//                     } else {
//                         lightboxNextButton.click();
//                     }
//                 }
//                 currentLightboxImgPosX = 0;
//                 currentLightboxImgPosY = 0;
//                 applyTransform();
//             }
//             hasDraggedLightbox = false;
//         }
//     }

//     function handleWheelZoom(e) {
//         if (!lightbox.classList.contains('active') || e.target !== lightboxImg) {
//             return;
//         }

//         e.preventDefault();
//         e.stopPropagation();

//         const oldZoomLevel = currentZoomLevel;
//         let delta = Math.sign(e.deltaY) * -zoomSensitivity;

//         let newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

//         const bbox = lightboxImg.getBoundingClientRect();
//         const mouseXRelativeToImage = e.clientX - bbox.left;
//         const mouseYRelativeToImage = e.clientY - bbox.top;

//         const mouseXInImageContent = (mouseXRelativeToImage - currentLightboxImgPosX) / oldZoomLevel;
//         const mouseYInImageContent = (mouseYRelativeToImage - currentLightboxImgPosY) / oldZoomLevel;

//         currentLightboxImgPosX = mouseXRelativeToImage - (mouseXInImageContent * newZoomLevel);
//         currentLightboxImgPosY = mouseYRelativeToImage - (mouseYInImageContent * newZoomLevel);

//         currentZoomLevel = newZoomLevel;

//         limitImagePosition();
//         applyTransform();
//     }

//     // [Giữ nguyên tất cả các event listener cho lightbox...]
//     lightboxImg.addEventListener('touchstart', (e) => {
//         if (!lightbox.classList.contains('active')) return;

//         if (e.touches.length === 2) {
//             isPinching = true;
//             initialPinchDistance = Math.hypot(
//                 e.touches[0].pageX - e.touches[1].pageX,
//                 e.touches[0].pageY - e.touches[1].pageY
//             );

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             const initialPinchXInImageContent = (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
//             const initialPinchYInImageContent = (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;

//             currentLightboxImgPosX = centerX - (initialPinchXInImageContent * currentZoomLevel);
//             currentLightboxImgPosY = centerY - (initialPinchYInImageContent * currentZoomLevel);

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

//             const oldZoomLevel = currentZoomLevel;
//             let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
//             newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             const deltaZoom = newZoomLevel / oldZoomLevel;

//             currentLightboxImgPosX = centerX - ((centerX - currentLightboxImgPosX) * deltaZoom);
//             currentLightboxImgPosY = centerY - ((centerY - currentLightboxImgPosY) * deltaZoom);

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
//         if (currentZoomLevel === 1) {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             applyTransform();
//         }
//         endDragLightbox(e);
//     });

//     lightboxImg.addEventListener('mousedown', startDragLightbox);
//     lightboxImg.addEventListener('touchstart', startDragLightbox);
//     document.addEventListener('mousemove', dragLightbox);
//     document.addEventListener('touchmove', dragLightbox, { passive: false });
//     document.addEventListener('mouseup', endDragLightbox);
//     document.addEventListener('touchend', endDragLightbox);
//     lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });

//     lightboxClose.addEventListener('click', () => {
//         lightbox.classList.remove('active');
//         isDraggingLightbox = false;
//         currentZoomLevel = 1;
//         currentLightboxImgPosX = 0;
//         currentLightboxImgPosY = 0;
//         lightboxImg.style.transition = 'none';
//         applyTransform();
//         lightboxImg.style.opacity = '1';
//         document.body.style.overflow = '';
//         showScrolltopButton();
//     });

//     if (lightboxCounter) {
//         lightboxCounter.addEventListener('click', (e) => {
//             e.stopPropagation();
//         });
//     }

//     if (lightboxThumbnailsContainer) {
//         lightboxThumbnailsContainer.addEventListener('click', (e) => {
//             e.stopPropagation();
//         });
//     }

//     lightbox.addEventListener('click', (e) => {
//         if (!hasDraggedLightbox && !lightboxContent.contains(e.target)) {
//             lightbox.classList.remove('active');
//             isDraggingLightbox = false;
//             currentZoomLevel = 1;
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             applyTransform();
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = '';
//             showScrolltopButton();
//         }
//     });

//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             isDraggingLightbox = false;
//             currentZoomLevel = 1;
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             applyTransform();
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = '';
//             showScrolltopButton();
//         }
//     });

//     lightboxPrevButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         updateLightboxImage((lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : allGalleryItems.length - 1);
//     });

//     lightboxNextButton.addEventListener('click', (e) => {
//         e.stopPropagation();
//         updateLightboxImage((lightboxCurrentIndex < allGalleryItems.length - 1) ? lightboxCurrentIndex + 1 : 0);
//     });

//     // ==========================================================
//     // CẢI TIẾN HÀM setupAutoScrollingGallery
//     // ==========================================================
//     function setupAutoScrollingGallery(galleryId, scrollSpeed) {
//         const galleryTrack = document.getElementById(galleryId);
//         if (!galleryTrack) {
//             console.error(`Gallery track with ID ${galleryId} not found!`);
//             return;
//         }

//         let galleryItemContainers = Array.from(galleryTrack.querySelectorAll('.gallery-item-container'));
//         let animationFrameId;
//         let currentScroll = 0;
//         const originalGalleryItemsCount = galleryItemContainers.length;

//         let galleryWrapperWidth = 0;
//         let originalItemsFullWidth = 0;
//         let clonedItemsPrefixWidth = 0;
//         let numClones = 0;
//         let isInitialized = false; // Thêm flag để kiểm tra

//         function initializeGallery() {
//             const galleryWrapper = galleryTrack.closest('.gallery-wrapper');
//             if (!galleryWrapper) {
//                 console.error("Gallery wrapper not found for track:", galleryId);
//                 return;
//             }

//             // Đảm bảo các ảnh đã có kích thước thực tế
//             const images = galleryTrack.querySelectorAll('.gallery-item');
//             let hasValidDimensions = true;
            
//             images.forEach(img => {
//                 if (img.offsetWidth === 0 || img.offsetHeight === 0) {
//                     hasValidDimensions = false;
//                 }
//             });

//             if (!hasValidDimensions) {
//                 console.warn(`Images in ${galleryId} don't have valid dimensions yet. Retrying...`);
//                 setTimeout(() => initializeGallery(), 100);
//                 return;
//             }

//             galleryWrapperWidth = galleryWrapper.offsetWidth;

//             // Xóa các bản sao cũ
//             Array.from(galleryTrack.children).forEach(child => {
//                 if (child.classList.contains('cloned')) {
//                     galleryTrack.removeChild(child);
//                 }
//             });

//             const originalItemNodes = Array.from(galleryTrack.children);
//             const currentOriginalGalleryItemsCount = originalItemNodes.length;

//             if (currentOriginalGalleryItemsCount === 0) {
//                 console.warn(`No original items in galleryTrack ${galleryId} after clearing clones.`);
//                 return;
//             }

//             originalItemsFullWidth = 0;
//             originalItemNodes.forEach(containerNode => {
//                 if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
//                     originalItemsFullWidth += containerNode.offsetWidth + 10;
//                 }
//             });

//             if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
//                 let calculatedMinimumClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
//                 numClones = Math.max(calculatedMinimumClones, currentOriginalGalleryItemsCount);
//             } else {
//                 numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 5;
//             }

//             // Thêm clones
//             for (let i = 1; i <= numClones; i++) {
//                 const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
//                 if (originalItemNodes[actualIndex]) {
//                     const clone = originalItemNodes[actualIndex].cloneNode(true);
//                     clone.classList.add('cloned');
//                     galleryTrack.prepend(clone);
//                 }
//             }

//             for (let i = 0; i < numClones; i++) {
//                 const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//                 if (originalItemNodes[originalIndexForClone]) {
//                     const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
//                     clone.classList.add('cloned');
//                     galleryTrack.appendChild(clone);
//                 }
//             }

//             galleryItemContainers = Array.from(galleryTrack.children);

//             clonedItemsPrefixWidth = 0;
//             for (let i = 0; i < numClones; i++) {
//                 if (galleryItemContainers[i]) {
//                     clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10;
//                 }
//             }

//             currentScroll = clonedItemsPrefixWidth;
//             galleryTrack.style.transition = 'none';
//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             // Thêm delay để đảm bảo transform được áp dụng
//             requestAnimationFrame(() => {
//                 requestAnimationFrame(() => {
//                     galleryTrack.style.transition = 'transform 0.05s linear';
//                     isInitialized = true; // Đánh dấu đã khởi tạo xong
//                     startAutoScroll();
//                 });
//             });
//         }

//         function startAutoScroll() {
//             if (!isInitialized) return; // Chỉ bắt đầu khi đã khởi tạo xong
//             if (animationFrameId) cancelAnimationFrame(animationFrameId);

//             function animateScroll() {
//                 currentScroll += scrollSpeed;
//                 galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//                 if (scrollSpeed > 0) {
//                     if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) {
//                         currentScroll = clonedItemsPrefixWidth;
//                         galleryTrack.style.transition = 'none';
//                         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
//                         requestAnimationFrame(() => {
//                             requestAnimationFrame(() => {
//                                 galleryTrack.style.transition = 'transform 0.05s linear';
//                             });
//                         });
//                     }
//                 } else {
//                     if (currentScroll <= (clonedItemsPrefixWidth - originalItemsFullWidth)) {
//                         currentScroll = clonedItemsPrefixWidth;
//                         galleryTrack.style.transition = 'none';
//                         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
//                         requestAnimationFrame(() => {
//                             requestAnimationFrame(() => {
//                                 galleryTrack.style.transition = 'transform 0.05s linear';
//                             });
//                         });
//                     }
//                 }
//                 animationFrameId = requestAnimationFrame(animateScroll);
//             }
//             animationFrameId = requestAnimationFrame(animateScroll);
//         }

//         function stopAutoScroll() {
//             if (animationFrameId) cancelAnimationFrame(animationFrameId);
//         }

//         galleryTrack.addEventListener('mouseenter', stopAutoScroll);
//         galleryTrack.addEventListener('mouseleave', startAutoScroll);

//         galleryTrack.addEventListener('click', (e) => {
//             const clickedOverlay = e.target.closest('.gallery-item-overlay');

//             if (clickedOverlay) {
//                 const clickedImage = clickedOverlay.previousElementSibling;
//                 if (clickedImage && clickedImage.classList.contains('gallery-item')) {
//                     const originalIndex = parseInt(clickedImage.dataset.originalIndex);

//                     if (!isNaN(originalIndex)) {
//                         updateLightboxImage(originalIndex);
//                         lightbox.classList.add('active');
//                         document.body.style.overflow = 'hidden';
//                         hideScrolltopButton();
//                     }
//                 }
//             }
//         });

//         // Khởi tạo gallery
//         initializeGallery();

//         window.addEventListener('resize', () => {
//             if (!lightbox.classList.contains('active')) {
//                 isInitialized = false; // Reset flag khi resize
//                 initializeGallery();
//             }
//         });
//     }

//     // ==========================================================
//     // KHỞI TẠO SAU KHI PRELOAD XONG
//     // ==========================================================
//     function initializeAllGalleries() {
//         // Thu thập tất cả gallery items
//         document.querySelectorAll('.gallery-item').forEach(item => {
//             allGalleryItems.push(item);
//         });

//         // Khởi tạo các gallery
//         setupAutoScrollingGallery('galleryTrack1', 0.5);
//         setupAutoScrollingGallery('galleryTrack2', -0.5);

//         console.log('All galleries initialized successfully!');
//     }

//     // ==========================================================
//     // MAIN INITIALIZATION - CHẠY SAU KHI PRELOAD XONG
//     // ==========================================================
//     preloadGalleryImages(initializeAllGalleries);

//     // Resize handler cho lightbox
//     window.addEventListener('resize', () => {
//         if (lightbox.classList.contains('active')) {
//             hideScrolltopButton();
//             limitImagePosition();
//             applyTransform();
//         } else {
//             showScrolltopButton();
//         }
//     });

//     // Scrolltop button handler
//     if (scrolltopButton) {
//         scrolltopButton.addEventListener('click', scrolltotop);
//     }

// });

// // ==========================================================
// // EXTERNAL FUNCTIONS
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
    // Các biến và phần tử DOM liên quan đến Lightbox (chung cho tất cả các gallery)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('#lightbox .lightbox-close');
    const lightboxPrevButton = document.querySelector('#lightbox .prev-lightbox');
    const lightboxNextButton = document.querySelector('#lightbox .next-lightbox');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxThumbnailsContainer = document.querySelector('.lightbox-thumbnails');
    const lightboxContent = document.querySelector('.lightbox-content'); // Lấy phần tử lightbox-content

    // Biến cho chức năng KÉO & ZOOM TRONG LIGHTBOX (chung)
    let isDraggingLightbox = false;
    let startLightboxPosX = 0;
    let startLightboxPosY = 0;
    let currentLightboxImgPosX = 0;
    let currentLightboxImgPosY = 0;
    let hasDraggedLightbox = false;

    // Biến cho tính năng ZOOM (chung)
    let currentZoomLevel = 1;
    const maxZoomLevel = 3;
    const minZoomLevel = 1;
    const zoomSensitivity = 0.1;

    // Biến cho Pinch-to-zoom trên di động (chung)
    let initialPinchDistance = 0;
    let isPinching = false;

    // Mảng chứa TẤT CẢ các item ảnh gốc từ TẤT CẢ các gallery
    let allGalleryItems = [];
    // Biến theo dõi chỉ số ảnh hiện tại trong lightbox
    let lightboxCurrentIndex = 0; // Đảm bảo biến này được khai báo ở phạm vi này

    // ==========================================================
    // THÊM HÀM PRELOAD IMAGES (giữ nguyên từ bản trước nếu bạn có)
    // ==========================================================
    // (Nếu bạn đã thêm hàm preloadGalleryImages từ bản trước, hãy giữ nguyên nó ở đây)
    // Ví dụ:
    /*
    function preloadGalleryImages(callback) {
        const allImages = document.querySelectorAll('.gallery-item');
        let loadedCount = 0;
        let totalImages = allImages.length;

        if (totalImages === 0) {
            callback();
            return;
        }

        function checkAllLoaded() {
            loadedCount++;
            if (loadedCount >= totalImages) {
                setTimeout(() => {
                    callback();
                }, 100);
            }
        }

        allImages.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                checkAllLoaded();
            } else {
                img.addEventListener('load', checkAllLoaded);
                img.addEventListener('error', checkAllLoaded);
                setTimeout(checkAllLoaded, 5000); // Fallback
            }
        });
    }
    */


    // ==========================================================
    // BIẾN VÀ HÀM CHO NÚT CUỘN LÊN ĐẦU TRANG (SCROLLTOP) - ĐÃ CẬP NHẬT
    // ==========================================================
    const scrolltopButton = document.querySelector('.scrolltop');

    // Hàm ẩn nút scrolltop hoàn toàn
    function hideScrolltopButton() {
        if (scrolltopButton) {
            scrolltopButton.classList.add('hide-scrolltop-always'); // Thêm class để ẩn luôn
            scrolltopButton.classList.remove('active'); // Đảm bảo nút không hiển thị
        }
    }

    // Hàm hiển thị nút scrolltop (sau khi lightbox đóng)
    function showScrolltopButton() {
        if (scrolltopButton) {
            scrolltopButton.classList.remove('hide-scrolltop-always'); // Xóa class ẩn luôn
            // Kích hoạt lại sự kiện 'scroll' để kiểm tra xem có nên hiển thị nút dựa trên vị trí cuộn
            // Dùng requestAnimationFrame để đảm bảo DOM đã cập nhật trước khi tính toán cuộn
            requestAnimationFrame(() => {
                const event = new Event('scroll');
                window.dispatchEvent(event);
            });
        }
    }
    // ==========================================================

    // Hàm áp dụng transform cho ảnh trong lightbox
    function applyTransform() {
        lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
    }

    // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom trong lightbox
    function limitImagePosition() {
        if (!lightboxImg.naturalWidth || !lightboxImg.naturalHeight) {
            console.warn("Image natural dimensions not available yet.");
            return;
        }

        const imgNaturalWidth = lightboxImg.naturalWidth;
        const imgNaturalHeight = lightboxImg.naturalHeight;

        // Lấy kích thước hiển thị của lightbox content (parent của ảnh)
        const lightboxContent = lightboxImg.closest('.lightbox-content');
        if (!lightboxContent) return; // Đảm bảo phần tử tồn tại

        const viewportWidth = lightboxContent.offsetWidth;
        const viewportHeight = lightboxContent.offsetHeight;

        // Calculate rendered dimensions of the image
        const renderedImgWidth = imgNaturalWidth * currentZoomLevel;
        const renderedImgHeight = imgNaturalHeight * currentZoomLevel;

        // Calculate maximum pan distance
        const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
        const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

        if (currentZoomLevel > 1) {
            currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
            currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
        } else {
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
        }
    }

    // Hàm cập nhật ảnh trong lightbox
    function updateLightboxImage(index) {
        // Kiểm tra chỉ số hợp lệ
        if (index < 0 || index >= allGalleryItems.length) {
            console.error(`Invalid index: ${index}. allGalleryItems has ${allGalleryItems.length} items.`);
            return;
        }

        lightboxCurrentIndex = index; // Cập nhật chỉ số hiện tại của lightbox
        const newImgSrc = allGalleryItems[lightboxCurrentIndex].dataset.fullresSrc || allGalleryItems[lightboxCurrentIndex].src;
        const newImgAlt = allGalleryItems[lightboxCurrentIndex].alt;

        lightboxImg.style.transition = 'none';
        currentZoomLevel = 1;
        currentLightboxImgPosX = 0;
        currentLightboxImgPosY = 0;
        applyTransform();
        lightboxImg.style.opacity = '0';

        lightboxImg.onload = () => {
            lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
            lightboxImg.style.opacity = '1';
            lightboxImg.onload = null;
        };

        lightboxImg.src = newImgSrc;
        lightboxImg.alt = newImgAlt;

        // Xử lý trường hợp ảnh đã được tải từ cache (onload có thể không chạy)
        if (lightboxImg.complete && lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
             lightboxImg.style.opacity = '1';
        }

        updateLightboxCounter();
        updateLightboxThumbnails();
    }

    function updateLightboxCounter() {
        lightboxCounter.textContent = `${lightboxCurrentIndex + 1}/${allGalleryItems.length}`;
    }

    function updateLightboxThumbnails() {
        lightboxThumbnailsContainer.innerHTML = '';
        allGalleryItems.forEach((item, index) => {
            const thumbImg = document.createElement('img');
            thumbImg.src = item.src;
            thumbImg.alt = `Thumbnail ${index + 1}`;
            thumbImg.classList.add('lightbox-thumbnail-item');

            if (index === lightboxCurrentIndex) {
                thumbImg.classList.add('active');
            }

            thumbImg.addEventListener('click', (e) => {
                e.stopPropagation(); // NGĂN CHẶN SỰ KIỆN CLICK LAN TRUYỀN LÊN LIGHTBOX
                updateLightboxImage(index);
            });
            lightboxThumbnailsContainer.appendChild(thumbImg);
        });
        const activeThumbnail = lightboxThumbnailsContainer.querySelector('.lightbox-thumbnail-item.active');
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Xử lý sự kiện kéo (drag) trong lightbox
    function startDragLightbox(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;
        if (e.touches && e.touches.length > 1) return;

        isDraggingLightbox = true;
        hasDraggedLightbox = false;

        startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
        startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;

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
        lightboxImg.style.transition = 'none';

        if (e.type === 'touchstart') {
            e.preventDefault();
        }
    }

    function dragLightbox(e) {
        if (!isDraggingLightbox || isPinching) return;

        const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
        const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

        const deltaX = currentClientX - startLightboxPosX;
        const deltaY = currentClientY - startLightboxPosY;

        currentLightboxImgPosX += deltaX;
        currentLightboxImgPosY += deltaY;

        if (currentZoomLevel > 1) {
            limitImagePosition();
        } else {
            // Nếu không zoom, chỉ cho phép kéo ảnh ở mức độ nhất định để cảm nhận vuốt
            const dragThreshold = 50;
            currentLightboxImgPosX = Math.max(-dragThreshold, Math.min(dragThreshold, currentLightboxImgPosX));
            currentLightboxImgPosY = Math.max(-dragThreshold, Math.min(dragThreshold, currentLightboxImgPosY));
        }

        applyTransform();

        startLightboxPosX = currentClientX;
        startLightboxPosY = currentClientY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
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
            lightboxImg.style.transition = 'transform 0.3s ease-out';

            if (currentZoomLevel > 1) {
                limitImagePosition();
                applyTransform();
            } else {
                // Lấy kích thước của lightbox (toàn màn hình) để tính toán vuốt
                const lightboxWidth = lightbox.offsetWidth;
                const netHorizontalMovement = currentLightboxImgPosX;

                if (hasDraggedLightbox && Math.abs(netHorizontalMovement) > lightboxWidth * 0.2) {
                    if (netHorizontalMovement > 0) {
                        lightboxPrevButton.click();
                    } else {
                        lightboxNextButton.click();
                    }
                }
                currentLightboxImgPosX = 0;
                currentLightboxImgPosY = 0;
                applyTransform();
            }
            hasDraggedLightbox = false;
        }
    }

    // Xử lý CUỘN CHUỘT (Wheel Zoom)
    function handleWheelZoom(e) {
        if (!lightbox.classList.contains('active') || e.target !== lightboxImg) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const oldZoomLevel = currentZoomLevel;
        let delta = Math.sign(e.deltaY) * -zoomSensitivity;

        let newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

        const bbox = lightboxImg.getBoundingClientRect();
        const mouseXRelativeToImage = e.clientX - bbox.left;
        const mouseYRelativeToImage = e.clientY - bbox.top;

        const mouseXInImageContent = (mouseXRelativeToImage - currentLightboxImgPosX) / oldZoomLevel;
        const mouseYInImageContent = (mouseYRelativeToImage - currentLightboxImgPosY) / oldZoomLevel;

        currentLightboxImgPosX = mouseXRelativeToImage - (mouseXInImageContent * newZoomLevel);
        currentLightboxImgPosY = mouseYRelativeToImage - (mouseYInImageContent * newZoomLevel);

        currentZoomLevel = newZoomLevel;

        limitImagePosition();
        applyTransform();
    }

    // Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động)
    lightboxImg.addEventListener('touchstart', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.touches.length === 2) {
            isPinching = true;
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const initialPinchXInImageContent = (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
            const initialPinchYInImageContent = (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;

            currentLightboxImgPosX = centerX - (initialPinchXInImageContent * currentZoomLevel);
            currentLightboxImgPosY = centerY - (initialPinchYInImageContent * currentZoomLevel);

            lightboxImg.style.transition = 'none';
        } else if (e.touches.length === 1) {
            startDragLightbox(e);
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

            if (initialPinchDistance === 0) return;

            const oldZoomLevel = currentZoomLevel;
            let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
            newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const deltaZoom = newZoomLevel / oldZoomLevel;

            currentLightboxImgPosX = centerX - ((centerX - currentLightboxImgPosX) * deltaZoom);
            currentLightboxImgPosY = centerY - ((centerY - currentLightboxImgPosY) * deltaZoom);

            currentZoomLevel = newZoomLevel;

            limitImagePosition();
            applyTransform();
            initialPinchDistance = currentPinchDistance;
        } else if (e.touches.length === 1) {
            dragLightbox(e);
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', (e) => {
        if (isPinching) {
            isPinching = false;
            initialPinchDistance = 0;
            lightboxImg.style.transition = 'transform 0.3s ease-out';
        }
        if (currentZoomLevel === 1) {
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            applyTransform();
        }
        endDragLightbox(e);
    });

    // Các sự kiện chung cho lightbox
    lightboxImg.addEventListener('mousedown', startDragLightbox);
    lightboxImg.addEventListener('touchstart', startDragLightbox);
    document.addEventListener('mousemove', dragLightbox);
    document.addEventListener('touchmove', dragLightbox, { passive: false });
    document.addEventListener('mouseup', endDragLightbox);
    document.addEventListener('touchend', endDragLightbox);
    lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });

    // --- CẬP NHẬT: Xử lý đóng lightbox ---
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        isDraggingLightbox = false;
        currentZoomLevel = 1;
        currentLightboxImgPosX = 0;
        currentLightboxImgPosY = 0;
        lightboxImg.style.transition = 'none';
        applyTransform();
        lightboxImg.style.opacity = '1';
        document.body.style.overflow = '';
        showScrolltopButton(); // Hiển thị lại nút scrolltop khi đóng lightbox
    });

    // Ngăn chặn click vào lightbox-counter làm đóng lightbox
    if (lightboxCounter) {
        lightboxCounter.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan truyền lên phần tử lightbox
        });
    }

    // Ngăn chặn click vào lightbox-thumbnails làm đóng lightbox
    if (lightboxThumbnailsContainer) {
        lightboxThumbnailsContainer.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan truyền lên phần tử lightbox
        });
    }

    lightbox.addEventListener('click', (e) => {
        // Kiểm tra xem click có xảy ra trên vùng trống của lightbox (không phải trên lightboxImg hoặc lightboxContent)
        // và không phải sau khi kéo (hasDraggedLightbox)
        if (!hasDraggedLightbox && !lightboxContent.contains(e.target) && e.target === lightbox) {
            lightbox.classList.remove('active');
            isDraggingLightbox = false;
            currentZoomLevel = 1;
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            lightboxImg.style.transition = 'none';
            applyTransform();
            lightboxImg.style.opacity = '1';
            document.body.style.overflow = '';
            showScrolltopButton(); // Hiển thị lại nút scrolltop khi đóng lightbox
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            isDraggingLightbox = false;
            currentZoomLevel = 1;
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            lightboxImg.style.transition = 'none';
            applyTransform();
            lightboxImg.style.opacity = '1';
            document.body.style.overflow = '';
            showScrolltopButton(); // Hiển thị lại nút scrolltop khi đóng lightbox
        }
    });

    lightboxPrevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightboxImage((lightboxCurrentIndex > 0) ? lightboxCurrentIndex - 1 : allGalleryItems.length - 1);
    });

    lightboxNextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightboxImage((lightboxCurrentIndex < allGalleryItems.length - 1) ? lightboxCurrentIndex + 1 : 0);
    });

    // ==========================================================
    // HÀM TÁI SỬ DỤNG CHO MỖI GALLERY
    // ==========================================================
    function setupAutoScrollingGallery(galleryId, scrollSpeed) {
        const galleryTrack = document.getElementById(galleryId);
        if (!galleryTrack) {
            console.error(`Gallery track with ID ${galleryId} not found!`);
            return;
        }

        let galleryItemContainers = Array.from(galleryTrack.querySelectorAll('.gallery-item-container'));
        let animationFrameId; // Dùng cho requestAnimationFrame
        let currentScroll = 0;
        // const originalGalleryItemsCount = galleryItemContainers.length; // Sẽ tính lại sau

        let galleryWrapperWidth = 0;
        let originalItemsFullWidth = 0;
        let clonedItemsPrefixWidth = 0;
        let numClones = 0;
        let isGalleryInitialized = false; // Flag riêng cho từng gallery

        function initializeGallery() {
            const galleryWrapper = galleryTrack.closest('.gallery-wrapper');
            if (!galleryWrapper) {
                console.error("Gallery wrapper not found for track:", galleryId);
                return;
            }

            // Lấy các node gốc (không phải clone)
            const originalItemNodes = Array.from(galleryTrack.children).filter(child => !child.classList.contains('cloned'));
            const currentOriginalGalleryItemsCount = originalItemNodes.length;

            if (currentOriginalGalleryItemsCount === 0) {
                console.warn(`No original items in galleryTrack ${galleryId}. Initialization skipped.`);
                return;
            }

            // Kiểm tra xem tất cả ảnh gốc đã có kích thước thực tế chưa
            let hasValidDimensions = true;
            originalItemNodes.forEach(containerNode => {
                const img = containerNode.querySelector('.gallery-item');
                if (!img || img.offsetWidth === 0 || img.offsetHeight === 0) {
                    hasValidDimensions = false;
                }
            });

            if (!hasValidDimensions) {
                console.warn(`Images in ${galleryId} don't have valid dimensions yet. Retrying...`);
                setTimeout(() => initializeGallery(), 100); // Thử lại sau 100ms
                return;
            }

            galleryWrapperWidth = galleryWrapper.offsetWidth;

            // Xóa các bản sao cũ trước khi thêm mới
            Array.from(galleryTrack.children).forEach(child => {
                if (child.classList.contains('cloned')) {
                    galleryTrack.removeChild(child);
                }
            });

            originalItemsFullWidth = 0;
            originalItemNodes.forEach(containerNode => {
                // Đảm bảo containerNode tồn tại và có offsetWidth
                if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
                    originalItemsFullWidth += containerNode.offsetWidth + 10; // 10 là margin/gap giữa các item
                }
            });

            if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
                let calculatedMinimumClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;
                numClones = Math.max(calculatedMinimumClones, currentOriginalGalleryItemsCount);
            } else {
                numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 5;
                console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
            }

            // Thêm các bản sao vào phía trước (prepend)
            for (let i = 1; i <= numClones; i++) {
                const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
                if (originalItemNodes[actualIndex]) {
                    const clone = originalItemNodes[actualIndex].cloneNode(true);
                    clone.classList.add('cloned');
                    galleryTrack.prepend(clone);
                }
            }
            // Thêm các bản sao vào phía sau (append)
            for (let i = 0; i < numClones; i++) {
                const originalIndexForClone = i % currentOriginalGalleryItemsCount;
                if (originalItemNodes[originalIndexForClone]) {
                    const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
                    clone.classList.add('cloned');
                    galleryTrack.appendChild(clone);
                }
            }

            galleryItemContainers = Array.from(galleryTrack.children); // Cập nhật lại list containers

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
                    galleryTrack.style.transition = 'transform 0.05s linear';
                    isGalleryInitialized = true; // Đánh dấu gallery đã được khởi tạo xong
                    startAutoScroll();
                });
            });
        }

        function startAutoScroll() {
            if (!isGalleryInitialized) return; // Chỉ bắt đầu khi đã khởi tạo xong
            if (animationFrameId) cancelAnimationFrame(animationFrameId); // Hủy frame cũ nếu có

            function animateScroll() {
                currentScroll += scrollSpeed;

                galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

                // Logic reset dựa trên hướng cuộn
                if (scrollSpeed > 0) { // Trượt từ phải sang trái (currentScroll tăng)
                    if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) {
                        currentScroll = clonedItemsPrefixWidth;
                        galleryTrack.style.transition = 'none';
                        galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                galleryTrack.style.transition = 'transform 0.05s linear';
                            });
                        });
                    }
                } else { // Trượt từ trái sang phải (currentScroll giảm)
                    if (currentScroll <= (clonedItemsPrefixWidth - originalItemsFullWidth)) {
                        currentScroll = clonedItemsPrefixWidth;
                        galleryTrack.style.transition = 'none';
                        galleryTrack.style.transform = `translateX(${-currentScroll}px)`;
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                galleryTrack.style.transition = 'transform 0.05s linear';
                            });
                        });
                    }
                }
                animationFrameId = requestAnimationFrame(animateScroll); // Tiếp tục vòng lặp
            }
            animationFrameId = requestAnimationFrame(animateScroll); // Bắt đầu vòng lặp
        }

        function stopAutoScroll() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }

        galleryTrack.addEventListener('mouseenter', stopAutoScroll);
        galleryTrack.addEventListener('mouseleave', () => {
            startAutoScroll();
        });

        // Xử lý click vào lớp phủ ảnh trong gallery để mở lightbox
        galleryTrack.addEventListener('click', (e) => {
            const clickedOverlay = e.target.closest('.gallery-item-overlay');

            if (clickedOverlay) {
                const clickedImage = clickedOverlay.previousElementSibling; // Lấy thẻ img liền kề trước đó
                if (clickedImage && clickedImage.classList.contains('gallery-item')) {
                    // Lấy originalIndex từ data attribute
                    const originalIndex = parseInt(clickedImage.dataset.originalIndex);

                    if (!isNaN(originalIndex)) {
                        updateLightboxImage(originalIndex);
                        lightbox.classList.add('active');
                        document.body.style.overflow = 'hidden';
                        hideScrolltopButton(); // Ẩn nút scrolltop khi mở lightbox
                    } else {
                        console.warn("data-original-index not found or invalid on clicked image:", clickedImage);
                    }
                }
            }
        });

        // Khởi tạo gallery khi hàm được gọi
        initializeGallery();

        // Xử lý resize cho từng gallery
        window.addEventListener('resize', () => {
            if (!lightbox.classList.contains('active')) {
                isGalleryInitialized = false; // Reset flag khi resize
                initializeGallery();
            }
        });
    } // Kết thúc setupAutoScrollingGallery

    // ==========================================================
    // KHỞI TẠO TẤT CẢ GALLERY VÀ THU THẬP ẢNH GỐC
    // ==========================================================
    function initializeAllGalleriesAndLightboxItems() {
        // Thu thập tất cả các item ảnh gốc từ TẤT CẢ các gallery
        // và gán data-original-index cho chúng
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            allGalleryItems.push(item);
            item.dataset.originalIndex = index; // Gán index gốc
        });

        // Gọi hàm setupAutoScrollingGallery cho mỗi gallery của bạn
        setupAutoScrollingGallery('galleryTrack1', 0.5); // Gallery 1: Trượt từ phải sang trái
        setupAutoScrollingGallery('galleryTrack2', -0.5); // Gallery 2: Trượt từ trái sang phải

        console.log('All galleries and lightbox items initialized successfully!');
    }


    // ==========================================================
    // MAIN INITIALIZATION - CHẠY SAU KHI DOMContentLoaded VÀ PRELOAD XONG
    // ==========================================================
    // Tùy chọn: Nếu bạn có hàm preloadImages, hãy gọi nó trước.
    // Nếu không, gọi trực tiếp initializeAllGalleriesAndLightboxItems()
    // preloadGalleryImages(initializeAllGalleriesAndLightboxItems); // Nếu dùng preload
    initializeAllGalleriesAndLightboxItems(); // Nếu không dùng preload hoặc preload đã xử lý riêng

    // Xử lý resize cho lightbox (chung)
    window.addEventListener('resize', () => {
        if (lightbox.classList.contains('active')) {
            hideScrolltopButton(); // Đảm bảo nút ẩn nếu lightbox đang mở khi resize
            limitImagePosition();
            applyTransform();
        } else {
            showScrolltopButton(); // Hiển thị nếu lightbox đóng khi resize
        }
    });

    // Gắn sự kiện click cho nút scrolltop
    if (scrolltopButton) {
        scrolltopButton.addEventListener('click', scrolltotop);
    }

}); // Kết thúc DOMContentLoaded

// ==========================================================
// HÀM scrolltotop() VÀ LOGIC CUỘN CHUNG (NGOÀI DOMContentLoaded)
// ==========================================================
function scrolltotop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// CẬP NHẬT: Logic hiển thị/ẩn nút scrolltop khi cuộn trang
window.addEventListener('scroll', function() {
    const scrolltopButton = document.querySelector('.scrolltop');
    if (scrolltopButton) {
        const lightbox = document.getElementById('lightbox');

        // Chỉ xử lý hiển thị/ẩn nút scrolltop nếu lightbox KHÔNG active
        if (!lightbox || !lightbox.classList.contains('active')) {
            // Nút chỉ hiển thị khi cuộn xuống hơn 200px VÀ không có class 'hide-scrolltop-always'
            if (window.scrollY > 200 && !scrolltopButton.classList.contains('hide-scrolltop-always')) {
                scrolltopButton.classList.add('active');
            } else {
                scrolltopButton.classList.remove('active');
            }
        } else {
            // Nếu lightbox đang active, đảm bảo nút scrolltop luôn bị ẩn
            scrolltopButton.classList.remove('active');
            // Thêm lại class 'hide-scrolltop-always' nếu nó bị mất (để đảm bảo ẩn hoàn toàn)
            if (!scrolltopButton.classList.contains('hide-scrolltop-always')) {
                scrolltopButton.classList.add('hide-scrolltop-always');
            }
        }
    }
});