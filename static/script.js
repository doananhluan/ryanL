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

    // Hàm áp dụng transform cho ảnh trong lightbox
    function applyTransform() {
        lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
    }

    // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom trong lightbox
    function limitImagePosition() {
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

        if (lightboxImg.src === newImgSrc && lightboxImg.style.opacity === '0') {
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
        showScrolltopButton();
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
        // Kiểm tra xem click có xảy ra trên bất kỳ phần tử con nào của lightboxContent không.
        // Nếu không, tức là click vào vùng trống (bao gồm cả vùng khung xanh).
        // hasDraggedLightbox để tránh đóng ngay sau khi kéo.
        if (!hasDraggedLightbox && !lightboxContent.contains(e.target)) { // ĐÃ CẬP NHẬT ĐIỀU KIỆN
            lightbox.classList.remove('active');
            isDraggingLightbox = false;
            currentZoomLevel = 1;
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            lightboxImg.style.transition = 'none';
            applyTransform();
            lightboxImg.style.opacity = '1';
            document.body.style.overflow = '';
            showScrolltopButton();
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
            showScrolltopButton();
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
        const originalGalleryItemsCount = galleryItemContainers.length;

        let galleryWrapperWidth = 0;
        let originalItemsFullWidth = 0;
        let clonedItemsPrefixWidth = 0;
        let numClones = 0;

        function initializeGallery() {
            const galleryWrapper = galleryTrack.closest('.gallery-wrapper');
            if (!galleryWrapper) {
                console.error("Gallery wrapper not found for track:", galleryId);
                return;
            }

            galleryWrapperWidth = galleryWrapper.offsetWidth;

            // Xóa các bản sao cũ trước khi thêm mới
            Array.from(galleryTrack.children).forEach(child => {
                if (child.classList.contains('cloned')) {
                    galleryTrack.removeChild(child);
                }
            });

            const originalItemNodes = Array.from(galleryTrack.children);
            const currentOriginalGalleryItemsCount = originalItemNodes.length;

            if (currentOriginalGalleryItemsCount === 0) {
                console.warn(`No original items in galleryTrack ${galleryId} after clearing clones.`);
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
                    galleryTrack.style.transition = 'transform 0.05s linear'; // ĐÃ ĐIỀU CHỈNH
                });
            });

            startAutoScroll();
        }

        function startAutoScroll() {
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
                                galleryTrack.style.transition = 'transform 0.05s linear'; // ĐÃ ĐIỀU CHỈNH
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
                                galleryTrack.style.transition = 'transform 0.05s linear'; // ĐÃ ĐIỀU CHỈNH
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
                        hideScrolltopButton();
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
                initializeGallery();
            }
        });
    } // Kết thúc setupAutoScrollingGallery

    // Thu thập tất cả các item ảnh từ TẤT CẢ các gallery để dùng cho lightbox
    // Cần làm điều này SAU KHI DOMContentLoaded hoàn tất và tất cả các gallery đã được thêm vào DOM
    document.querySelectorAll('.gallery-item').forEach(item => {
        allGalleryItems.push(item);
    });

    // Gọi hàm setupAutoScrollingGallery cho mỗi gallery của bạn
    // Gallery 1: Trượt từ phải sang trái (scrollSpeed dương)
    setupAutoScrollingGallery('galleryTrack1', 0.5);

    // Gallery 2: Trượt từ trái sang phải (scrollSpeed âm)
    setupAutoScrollingGallery('galleryTrack2', -0.5);

    // Xử lý resize cho lightbox (chung)
    window.addEventListener('resize', () => {
        if (lightbox.classList.contains('active')) {
            hideScrolltopButton();
            limitImagePosition();
            applyTransform();
        } else {
            showScrolltopButton();
        }
    });

    // Gắn sự kiện click cho nút scrolltop (đã bỏ onclick trong HTML)
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


// document.addEventListener('DOMContentLoaded', () => {
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
//     const scrolltopButton = document.querySelector('.scrolltop'); // Chọn nút một lần

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

//             // Đảm bảo các thumbnails đầu tiên luôn hiển thị đầy đủ
//             if (lightboxCurrentIndex < 3) { // Ngưỡng 3 hình ảnh đầu tiên
//                 lightboxThumbnailsContainer.scrollLeft = 0; // Đặt vị trí cuộn về 0
//             }
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

//     lightbox.addEventListener('click', (e) => {
//         // Chỉ đóng nếu click trực tiếp vào lớp phủ lightbox (không phải nội dung bên trong)
//         if (e.target === lightbox && !hasDraggedLightbox) {
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
//     // Hàm chờ tất cả hình ảnh trong một danh sách tải xong
//     function waitForImagesToLoad(images) {
//         return Promise.all(images.map(img => {
//             return new Promise(resolve => {
//                 if (img.complete) { // Nếu ảnh đã tải xong (từ cache hoặc đã hoàn tất)
//                     resolve();
//                 } else {
//                     img.onload = resolve;
//                     img.onerror = resolve; // Xử lý cả trường hợp lỗi để không bị kẹt
//                 }
//             });
//         }));
//     }

//     function setupAutoScrollingGallery(galleryId, scrollSpeed) {
//         const galleryTrack = document.getElementById(galleryId);
//         if (!galleryTrack) {
//             console.error(`Gallery track with ID ${galleryId} not found!`);
//             return;
//         }

//         let galleryItemContainers = Array.from(galleryTrack.querySelectorAll('.gallery-item-container'));
//         let animationFrameId; // Dùng cho requestAnimationFrame
//         let currentScroll = 0;
//         const originalGalleryItems = Array.from(galleryTrack.querySelectorAll('.gallery-item')); // Lấy các thẻ img gốc
//         const originalGalleryItemsCount = originalGalleryItems.length; // Sử dụng số lượng ảnh gốc

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

//             // const originalItemNodes = Array.from(galleryTrack.children); // Không dùng cái này nữa
//             // Sử dụng các item gốc đã được lọc ban đầu
//             const currentOriginalGalleryItemsCount = originalGalleryItems.length;

//             if (currentOriginalGalleryItemsCount === 0) {
//                 console.warn(`No original items in galleryTrack ${galleryId} after clearing clones.`);
//                 return;
//             }

//             originalItemsFullWidth = 0;
//             originalGalleryItems.forEach(item => { // Lặp qua ảnh gốc
//                 const containerNode = item.closest('.gallery-item-container');
//                 if (containerNode && typeof containerNode.offsetWidth !== 'undefined') {
//                     originalItemsFullWidth += containerNode.offsetWidth + 10; // Cộng 10px cho khoảng cách giữa các item
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
//                 if (originalGalleryItems[actualIndex]) { // Dùng originalGalleryItems
//                     const clone = originalGalleryItems[actualIndex].closest('.gallery-item-container').cloneNode(true);
//                     clone.classList.add('cloned');
//                     galleryTrack.prepend(clone);
//                 }
//             }
//             // Thêm các bản sao vào phía sau (append)
//             for (let i = 0; i < numClones; i++) {
//                 const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//                 if (originalGalleryItems[originalIndexForClone]) { // Dùng originalGalleryItems
//                     const clone = originalGalleryItems[originalIndexForClone].closest('.gallery-item-container').cloneNode(true);
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
//                     galleryTrack.style.transition = 'transform 0.05s linear';
//                 });
//             });

//             startAutoScroll();
//         }

//         function startAutoScroll() {
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
//         galleryTrack.addEventListener('mouseleave', () => {
//             startAutoScroll();
//         });

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
//                     } else {
//                         console.warn("data-original-index not found or invalid on clicked image:", clickedImage);
//                     }
//                 }
//             }
//         });

//         // Khởi tạo gallery SAU KHI TẤT CẢ HÌNH ẢNH GỐC ĐÃ TẢI XONG VÀ ĐỢI MỘT CHÚT CHO LAYOUT ỔN ĐỊNH
//         waitForImagesToLoad(originalGalleryItems).then(() => {
//             setTimeout(() => { // THÊM setTimeout 0ms Ở ĐÂY
//                 initializeGallery();
//             }, 0);
//         }).catch(error => {
//             console.error("Error loading gallery images:", error);
//         });


//         window.addEventListener('resize', () => {
//             if (!lightbox.classList.contains('active')) {
//                 // Khi resize, cần khởi tạo lại gallery sau khi ảnh đã tải
//                 waitForImagesToLoad(originalGalleryItems).then(() => {
//                     setTimeout(() => { // THÊM setTimeout 0ms Ở ĐÂY
//                         initializeGallery();
//                     }, 0);
//                 }).catch(error => {
//                     console.error("Error loading gallery images on resize:", error);
//                 });
//             }
//         });
//     } // Kết thúc setupAutoScrollingGallery

//     // Thu thập tất cả các item ảnh gốc từ TẤT CẢ các gallery để dùng cho lightbox
//     // Đảm bảo chỉ thu thập các ảnh gốc (không phải clone)
//     document.querySelectorAll('.gallery-track .gallery-item').forEach(item => {
//         // Chỉ thêm vào allGalleryItems nếu nó không phải là bản sao
//         // Giả định rằng 'cloned' class chỉ được thêm bởi JS, không có trong HTML gốc
//         if (!item.closest('.cloned')) {
//             allGalleryItems.push(item);
//         }
//     });

//     // Gọi hàm setupAutoScrollingGallery cho mỗi gallery của bạn
//     setupAutoScrollingGallery('galleryTrack1', 0.5);
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

//     // Gắn sự kiện click cho nút scrolltop
//     const scrolltopButtonElement = document.querySelector('.scrolltop');
//     if (scrolltopButtonElement) {
//         scrolltopButtonElement.addEventListener('click', () => {
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         });
//     }

//     // Logic hiển thị/ẩn nút scrolltop
//     window.addEventListener('scroll', function() {
//         if (scrolltopButtonElement) {
//             const lightbox = document.getElementById('lightbox');

//             if (!lightbox || !lightbox.classList.contains('active')) {
//                 if (window.scrollY > 200) {
//                     scrolltopButtonElement.classList.add('active');
//                 } else {
//                     scrolltopButtonElement.classList.remove('active');
//                 }
//             } else {
//                 scrolltopButtonElement.classList.remove('active');
//             }
//         }
//     });
// });
