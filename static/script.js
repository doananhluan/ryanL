
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

    // Đổi giá trị này thành DƯƠNG để slide trượt từ PHẢI sang TRÁI
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
    let hasDraggedLightbox = false; // Cờ để kiểm tra xem có di chuyển chuột/chạm đáng kể không

    // Biến cho tính năng ZOOM
    let currentZoomLevel = 1;
    const maxZoomLevel = 3; // Mức zoom tối đa (ví dụ: 3 lần)
    const minZoomLevel = 1; // Mức zoom tối thiểu (không nhỏ hơn kích thước gốc)
    const zoomSensitivity = 0.1; // Độ nhạy của zoom khi cuộn chuột

    // Biến cho Pinch-to-zoom trên di động
    let initialPinchDistance = 0;
    let isPinching = false;
    // Không cần initialPinchXInImageContent và initialPinchYInImageContent ở đây
    // vì chúng được sử dụng cục bộ trong sự kiện touchstart/touchmove và không cần lưu trạng thái toàn cục

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

        // Xóa các bản sao cũ trước khi thêm mới
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
                originalItemsFullWidth += containerNode.offsetWidth + 10; // Cộng 10px cho khoảng cách giữa các item
            } else {
                console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
            }
        });

        if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
            // Tính toán số lượng bản sao tối thiểu cần thiết để lấp đầy vùng hiển thị và cung cấp bộ đệm
            let calculatedMinimumClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;

            // Đảm bảo numClones ít nhất bằng tổng số lượng item gốc,
            // để có ít nhất một bộ clone đầy đủ ở đầu và cuối. Điều này giúp đảm bảo vòng lặp mượt mà hơn.
            numClones = Math.max(calculatedMinimumClones, currentOriginalGalleryItemsCount); // ĐIỀU CHỈNH SỐ LƯỢNG CLONE
        } else {
            // Giá trị dự phòng nếu tính toán có vấn đề
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

        // Tính toán chiều rộng của các bản sao phía trước
        clonedItemsPrefixWidth = 0;
        for (let i = 0; i < numClones; i++) {
            if (galleryItemContainers[i]) {
                clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10; // Cộng 10px cho khoảng cách
            } else {
                console.warn(`Prefix clone at index ${i} is undefined.`);
            }
        }

        // Đặt vị trí cuộn ban đầu để hiển thị các item gốc đầu tiên
        currentScroll = clonedItemsPrefixWidth;
        galleryTrack.style.transition = 'none'; // Tắt transition để nhảy vị trí ngay lập tức
        galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

        // Bật lại transition sau một chút để các chuyển động tiếp theo mượt mà
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
            currentScroll += scrollSpeed; // currentScroll sẽ TĂNG vì scrollSpeed là DƯƠNG

            galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

            // Logic reset khi trượt từ PHẢI sang TRÁI (currentScroll tăng)
            // Khi currentScroll tăng đến mức nó đã trượt hết phần tử gốc,
            // Reset về vị trí ban đầu của các phần tử gốc để tạo hiệu ứng lặp lại
            if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) { // ĐIỀU KIỆN RESET ĐÃ ĐƯỢC THAY ĐỔI
                currentScroll = clonedItemsPrefixWidth; // ĐẶT LẠI VỊ TRÍ (trở lại đầu các item gốc)
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

            // Hide scroll button when lightbox opens
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

        // Show scroll button when lightbox closes
        showScrolltopButton();
    });

    // Kích hoạt và sửa đổi lắng nghe sự kiện click trên lightbox để đóng
    lightbox.addEventListener('click', (e) => {
        // Chỉ đóng nếu click trực tiếp vào lớp phủ lightbox hoặc nút đóng,
        // VÀ KHÔNG phải là kết thúc của một thao tác kéo.
        if ((e.target === lightbox || e.target === lightboxClose) && !hasDraggedLightbox) {
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

            // Show scroll button when lightbox closes
            showScrolltopButton();
        }
    });

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

            // Show scroll button when lightbox closes
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

    function applyTransform() {
        lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
    }

    // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom
    function limitImagePosition() {
        // Use naturalWidth/Height for the true dimensions, then scale by zoom level
        const imgNaturalWidth = lightboxImg.naturalWidth;
        const imgNaturalHeight = lightboxImg.naturalHeight;

        // Calculate rendered dimensions of the image
        const renderedImgWidth = imgNaturalWidth * currentZoomLevel;
        const renderedImgHeight = imgNaturalHeight * currentZoomLevel;

        const viewportWidth = lightbox.offsetWidth;
        const viewportHeight = lightbox.offsetHeight;

        // Calculate maximum pan distance
        const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
        const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

        if (currentZoomLevel > 1) {
            // Apply limits
            currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
            currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
        } else {
            // If not zoomed, center the image
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
        }
    }


    function startDragLightbox(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;

        // Don't start drag if pinching with 2 fingers
        if (e.touches && e.touches.length > 1) return;

        isDraggingLightbox = true;
        hasDraggedLightbox = false; // Reset on drag start

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
        if (!isDraggingLightbox || isPinching) return; // Don't drag if pinching

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
            // If not zoomed, allow free drag for swipe detection in endDragLightbox
        }

        applyTransform();

        // Update start position for the next movement calculation
        startLightboxPosX = currentClientX;
        startLightboxPosY = currentClientY;

        // Set hasDraggedLightbox if movement exceeds a small threshold
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
            lightboxImg.style.transition = 'transform 0.3s ease-out'; // Re-enable transition

            if (currentZoomLevel > 1) {
                // If zoomed in, just ensure image is within bounds
                limitImagePosition();
                applyTransform();
            } else {
                // If not zoomed, handle swipe to change image
                const lightboxWidth = lightbox.offsetWidth;
                // Check the net horizontal movement
                const netHorizontalMovement = currentLightboxImgPosX; // This holds the total horizontal movement from the start of the drag

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
        // Chỉ xử lý sự kiện wheel nếu nó xảy ra trực tiếp trên ảnh lightboxImg
        if (!lightbox.classList.contains('active') || e.target !== lightboxImg) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const oldZoomLevel = currentZoomLevel;
        let delta = Math.sign(e.deltaY) * -zoomSensitivity; // Negative deltaY means scrolling up (zoom in)

        let newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

        const bbox = lightboxImg.getBoundingClientRect(); // Vị trí hiển thị hiện tại của ảnh trong viewport

        // Tính toán vị trí con trỏ chuột tương đối với góc trên bên trái của ảnh HIỆN TẠI
        const mouseXRelativeToImage = e.clientX - bbox.left;
        const mouseYRelativeToImage = e.clientY - bbox.top;

        // Tính toán vị trí con trỏ chuột tương đối với NỘI DUNG GỐC của ảnh
        // (Đây là điểm trên ảnh gốc mà con trỏ chuột đang trỏ vào, không bị ảnh hưởng bởi zoom/dịch chuyển)
        const mouseXInImageContent = (mouseXRelativeToImage - currentLightboxImgPosX) / oldZoomLevel;
        const mouseYInImageContent = (mouseYRelativeToImage - currentLightboxImgPosY) / oldZoomLevel;

        // Tính toán vị trí dịch chuyển mới (currentLightboxImgPosX/Y) để giữ điểm dưới con trỏ chuột cố định
        currentLightboxImgPosX = mouseXRelativeToImage - (mouseXInImageContent * newZoomLevel);
        currentLightboxImgPosY = mouseYRelativeToImage - (mouseYInImageContent * newZoomLevel);

        currentZoomLevel = newZoomLevel; // Cập nhật mức zoom hiện tại

        limitImagePosition(); // Áp dụng giới hạn sau khi zoom
        applyTransform();
    }

    lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });
    // Đã xóa: lightbox.addEventListener('wheel', handleWheelZoom, { passive: false }); // Đã xóa vì đã xử lý trên lightboxImg

    // --- Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động) ---
    // Loại bỏ khai báo 'let' cho initialPinchXInImageContent và initialPinchYInImageContent ở đây
    // vì chúng không phải là biến toàn cục và được tính toán lại mỗi khi pinch bắt đầu.
    // Nếu bạn muốn chúng lưu giá trị giữa các lần chạm, hãy khai báo chúng ở phạm vi cao hơn
    // nhưng hiện tại, logic không cần điều đó.

    lightboxImg.addEventListener('touchstart', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.touches.length === 2) {
            isPinching = true;
            stopAutoScroll();
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            // Vị trí tâm chụm tương đối với nội dung ảnh gốc (để giữ cố định điểm này khi zoom)
            // (Được tính toán lại mỗi khi pinch bắt đầu, không cần biến toàn cục)
            const initialPinchXInImageContent = (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
            const initialPinchYInImageContent = (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;

            // Lưu lại vị trí dịch chuyển của ảnh để có thể điều chỉnh sau khi zoom
            currentLightboxImgPosX = centerX - (initialPinchXInImageContent * currentZoomLevel);
            currentLightboxImgPosY = centerY - (initialPinchYInImageContent * currentZoomLevel);


            lightboxImg.style.transition = 'none';
        } else if (e.touches.length === 1) {
            startDragLightbox(e); // Cho phép kéo bằng một ngón tay để di chuyển ảnh
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

            if (initialPinchDistance === 0) return; // Tránh chia cho 0

            const oldZoomLevel = currentZoomLevel;
            let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
            newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const deltaZoom = newZoomLevel / oldZoomLevel; // Dùng oldZoomLevel để tính deltaZoom chính xác hơn

            // Điều chỉnh vị trí ảnh để giữ điểm chụm cố định
            currentLightboxImgPosX = centerX - ((centerX - currentLightboxImgPosX) * deltaZoom);
            currentLightboxImgPosY = centerY - ((centerY - currentLightboxImgPosY) * deltaZoom);

            currentZoomLevel = newZoomLevel; // Cập nhật mức zoom hiện tại

            limitImagePosition();
            applyTransform();
            initialPinchDistance = currentPinchDistance; // Cập nhật khoảng cách ban đầu cho lần di chuyển tiếp theo
        } else if (e.touches.length === 1) {
            dragLightbox(e); // Tiếp tục kéo bằng một ngón tay để di chuyển ảnh
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', (e) => {
        if (isPinching) {
            isPinching = false;
            initialPinchDistance = 0;
            lightboxImg.style.transition = 'transform 0.3s ease-out'; // Bật lại transition
        }
        // Đảm bảo rằng sau khi pinch-zoom, nếu mức zoom là 1, ảnh sẽ được căn giữa.
        // Điều này cũng xử lý trường hợp kéo kết thúc khi không zoom.
        if (currentZoomLevel === 1) {
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            applyTransform();
        }
        endDragLightbox(e); // Gọi endDragLightbox để xử lý logic vuốt nếu không zoom
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




// trượt từ phải sang trái
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

    // Đổi giá trị này thành DƯƠNG để slide trượt từ PHẢI sang TRÁI
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
    let hasDraggedLightbox = false; // Cờ để kiểm tra xem có di chuyển chuột/chạm đáng kể không

    // Biến cho tính năng ZOOM
    let currentZoomLevel = 1;
    const maxZoomLevel = 3; // Mức zoom tối đa (ví dụ: 3 lần)
    const minZoomLevel = 1; // Mức zoom tối thiểu (không nhỏ hơn kích thước gốc)
    const zoomSensitivity = 0.1; // Độ nhạy của zoom khi cuộn chuột

    // Biến cho Pinch-to-zoom trên di động
    let initialPinchDistance = 0;
    let isPinching = false;
    // Không cần initialPinchXInImageContent và initialPinchYInImageContent ở đây
    // vì chúng được sử dụng cục bộ trong sự kiện touchstart/touchmove và không cần lưu trạng thái toàn cục

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

        // Xóa các bản sao cũ trước khi thêm mới
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
                originalItemsFullWidth += containerNode.offsetWidth + 10; // Cộng 10px cho khoảng cách giữa các item
            } else {
                console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
            }
        });

        if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
            // Tính toán số lượng bản sao tối thiểu cần thiết để lấp đầy vùng hiển thị và cung cấp bộ đệm
            let calculatedMinimumClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;

            // Đảm bảo numClones ít nhất bằng tổng số lượng item gốc,
            // để có ít nhất một bộ clone đầy đủ ở đầu và cuối. Điều này giúp đảm bảo vòng lặp mượt mà hơn.
            numClones = Math.max(calculatedMinimumClones, currentOriginalGalleryItemsCount); // ĐIỀU CHỈNH SỐ LƯỢNG CLONE
        } else {
            // Giá trị dự phòng nếu tính toán có vấn đề
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

        // Tính toán chiều rộng của các bản sao phía trước
        clonedItemsPrefixWidth = 0;
        for (let i = 0; i < numClones; i++) {
            if (galleryItemContainers[i]) {
                clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10; // Cộng 10px cho khoảng cách
            } else {
                console.warn(`Prefix clone at index ${i} is undefined.`);
            }
        }

        // Đặt vị trí cuộn ban đầu để hiển thị các item gốc đầu tiên
        currentScroll = clonedItemsPrefixWidth;
        galleryTrack.style.transition = 'none'; // Tắt transition để nhảy vị trí ngay lập tức
        galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

        // Bật lại transition sau một chút để các chuyển động tiếp theo mượt mà
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
            currentScroll += scrollSpeed; // currentScroll sẽ TĂNG vì scrollSpeed là DƯƠNG

            galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

            // Logic reset khi trượt từ PHẢI sang TRÁI (currentScroll tăng)
            // Khi currentScroll tăng đến mức nó đã trượt hết phần tử gốc,
            // Reset về vị trí ban đầu của các phần tử gốc để tạo hiệu ứng lặp lại
            if (currentScroll >= (clonedItemsPrefixWidth + originalItemsFullWidth)) { // ĐIỀU KIỆN RESET ĐÃ ĐƯỢC THAY ĐỔI
                currentScroll = clonedItemsPrefixWidth; // ĐẶT LẠI VỊ TRÍ (trở lại đầu các item gốc)
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

            // Hide scroll button when lightbox opens
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

        // Show scroll button when lightbox closes
        showScrolltopButton();
    });

    // Kích hoạt và sửa đổi lắng nghe sự kiện click trên lightbox để đóng
    lightbox.addEventListener('click', (e) => {
        // Chỉ đóng nếu click trực tiếp vào lớp phủ lightbox hoặc nút đóng,
        // VÀ KHÔNG phải là kết thúc của một thao tác kéo.
        if ((e.target === lightbox || e.target === lightboxClose) && !hasDraggedLightbox) {
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

            // Show scroll button when lightbox closes
            showScrolltopButton();
        }
    });

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

            // Show scroll button when lightbox closes
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

    function applyTransform() {
        lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
    }

    // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom
    function limitImagePosition() {
        // Use naturalWidth/Height for the true dimensions, then scale by zoom level
        const imgNaturalWidth = lightboxImg.naturalWidth;
        const imgNaturalHeight = lightboxImg.naturalHeight;

        // Calculate rendered dimensions of the image
        const renderedImgWidth = imgNaturalWidth * currentZoomLevel;
        const renderedImgHeight = imgNaturalHeight * currentZoomLevel;

        const viewportWidth = lightbox.offsetWidth;
        const viewportHeight = lightbox.offsetHeight;

        // Calculate maximum pan distance
        const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
        const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

        if (currentZoomLevel > 1) {
            // Apply limits
            currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
            currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
        } else {
            // If not zoomed, center the image
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
        }
    }


    function startDragLightbox(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;

        // Don't start drag if pinching with 2 fingers
        if (e.touches && e.touches.length > 1) return;

        isDraggingLightbox = true;
        hasDraggedLightbox = false; // Reset on drag start

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
        if (!isDraggingLightbox || isPinching) return; // Don't drag if pinching

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
            // If not zoomed, allow free drag for swipe detection in endDragLightbox
        }

        applyTransform();

        // Update start position for the next movement calculation
        startLightboxPosX = currentClientX;
        startLightboxPosY = currentClientY;

        // Set hasDraggedLightbox if movement exceeds a small threshold
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
            lightboxImg.style.transition = 'transform 0.3s ease-out'; // Re-enable transition

            if (currentZoomLevel > 1) {
                // If zoomed in, just ensure image is within bounds
                limitImagePosition();
                applyTransform();
            } else {
                // If not zoomed, handle swipe to change image
                const lightboxWidth = lightbox.offsetWidth;
                // Check the net horizontal movement
                const netHorizontalMovement = currentLightboxImgPosX; // This holds the total horizontal movement from the start of the drag

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
        // Chỉ xử lý sự kiện wheel nếu nó xảy ra trực tiếp trên ảnh lightboxImg
        if (!lightbox.classList.contains('active') || e.target !== lightboxImg) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const oldZoomLevel = currentZoomLevel;
        let delta = Math.sign(e.deltaY) * -zoomSensitivity; // Negative deltaY means scrolling up (zoom in)

        let newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

        const bbox = lightboxImg.getBoundingClientRect(); // Vị trí hiển thị hiện tại của ảnh trong viewport

        // Tính toán vị trí con trỏ chuột tương đối với góc trên bên trái của ảnh HIỆN TẠI
        const mouseXRelativeToImage = e.clientX - bbox.left;
        const mouseYRelativeToImage = e.clientY - bbox.top;

        // Tính toán vị trí con trỏ chuột tương đối với NỘI DUNG GỐC của ảnh
        // (Đây là điểm trên ảnh gốc mà con trỏ chuột đang trỏ vào, không bị ảnh hưởng bởi zoom/dịch chuyển)
        const mouseXInImageContent = (mouseXRelativeToImage - currentLightboxImgPosX) / oldZoomLevel;
        const mouseYInImageContent = (mouseYRelativeToImage - currentLightboxImgPosY) / oldZoomLevel;

        // Tính toán vị trí dịch chuyển mới (currentLightboxImgPosX/Y) để giữ điểm dưới con trỏ chuột cố định
        currentLightboxImgPosX = mouseXRelativeToImage - (mouseXInImageContent * newZoomLevel);
        currentLightboxImgPosY = mouseYRelativeToImage - (mouseYInImageContent * newZoomLevel);

        currentZoomLevel = newZoomLevel; // Cập nhật mức zoom hiện tại

        limitImagePosition(); // Áp dụng giới hạn sau khi zoom
        applyTransform();
    }

    lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });
    // Đã xóa: lightbox.addEventListener('wheel', handleWheelZoom, { passive: false }); // Đã xóa vì đã xử lý trên lightboxImg

    // --- Xử lý PINCH-TO-ZOOM (Chụm/Mở trên di động) ---
    // Loại bỏ khai báo 'let' cho initialPinchXInImageContent và initialPinchYInImageContent ở đây
    // vì chúng không phải là biến toàn cục và được tính toán lại mỗi khi pinch bắt đầu.
    // Nếu bạn muốn chúng lưu giá trị giữa các lần chạm, hãy khai báo chúng ở phạm vi cao hơn
    // nhưng hiện tại, logic không cần điều đó.

    lightboxImg.addEventListener('touchstart', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.touches.length === 2) {
            isPinching = true;
            stopAutoScroll();
            initialPinchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            // Vị trí tâm chụm tương đối với nội dung ảnh gốc (để giữ cố định điểm này khi zoom)
            // (Được tính toán lại mỗi khi pinch bắt đầu, không cần biến toàn cục)
            const initialPinchXInImageContent = (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
            const initialPinchYInImageContent = (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;

            // Lưu lại vị trí dịch chuyển của ảnh để có thể điều chỉnh sau khi zoom
            currentLightboxImgPosX = centerX - (initialPinchXInImageContent * currentZoomLevel);
            currentLightboxImgPosY = centerY - (initialPinchYInImageContent * currentZoomLevel);


            lightboxImg.style.transition = 'none';
        } else if (e.touches.length === 1) {
            startDragLightbox(e); // Cho phép kéo bằng một ngón tay để di chuyển ảnh
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

            if (initialPinchDistance === 0) return; // Tránh chia cho 0

            const oldZoomLevel = currentZoomLevel;
            let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
            newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

            const bbox = lightboxImg.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const deltaZoom = newZoomLevel / oldZoomLevel; // Dùng oldZoomLevel để tính deltaZoom chính xác hơn

            // Điều chỉnh vị trí ảnh để giữ điểm chụm cố định
            currentLightboxImgPosX = centerX - ((centerX - currentLightboxImgPosX) * deltaZoom);
            currentLightboxImgPosY = centerY - ((centerY - currentLightboxImgPosY) * deltaZoom);

            currentZoomLevel = newZoomLevel; // Cập nhật mức zoom hiện tại

            limitImagePosition();
            applyTransform();
            initialPinchDistance = currentPinchDistance; // Cập nhật khoảng cách ban đầu cho lần di chuyển tiếp theo
        } else if (e.touches.length === 1) {
            dragLightbox(e); // Tiếp tục kéo bằng một ngón tay để di chuyển ảnh
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', (e) => {
        if (isPinching) {
            isPinching = false;
            initialPinchDistance = 0;
            lightboxImg.style.transition = 'transform 0.3s ease-out'; // Bật lại transition
        }
        // Đảm bảo rằng sau khi pinch-zoom, nếu mức zoom là 1, ảnh sẽ được căn giữa.
        // Điều này cũng xử lý trường hợp kéo kết thúc khi không zoom.
        if (currentZoomLevel === 1) {
            currentLightboxImgPosX = 0;
            currentLightboxImgPosY = 0;
            applyTransform();
        }
        endDragLightbox(e); // Gọi endDragLightbox để xử lý logic vuốt nếu không zoom
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


// trượt từ trái sang phải 
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

//     // Đổi giá trị này thành âm để slide trượt từ TRÁI sang PHẢI (ngược lại với hướng hiện tại)
//     const scrollSpeed = -0.5; // ĐÂY LÀ ĐIỂM THAY ĐỔI CHÍNH
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
//     let startLightboxPosX = 0; // Vị trí bắt đầu kéo (clientX/Y)
//     let startLightboxPosY = 0;
//     let currentLightboxImgPosX = 0; // Vị trí X hiện tại của ảnh sau khi dịch chuyển
//     let currentLightboxImgPosY = 0; // Vị trí Y hiện tại của ảnh sau khi dịch chuyển
//     let dragThresholdLightbox = 50;
//     let hasDraggedLightbox = false; // Cờ để kiểm tra xem có di chuyển chuột/chạm đáng kể không

//     // Biến cho tính năng ZOOM
//     let currentZoomLevel = 1;
//     const maxZoomLevel = 3; // Mức zoom tối đa (ví dụ: 3 lần)
//     const minZoomLevel = 1; // Mức zoom tối thiểu (không nhỏ hơn kích thước gốc)
//     const zoomSensitivity = 0.1; // Độ nhạy của zoom khi cuộn chuột

//     // Biến cho Pinch-to-zoom trên di động
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

//         // Xóa các bản sao cũ trước khi thêm mới
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
//                 originalItemsFullWidth += containerNode.offsetWidth + 10; // Cộng 10px cho khoảng cách giữa các item
//             } else {
//                 console.warn("Invalid containerNode or offsetWidth is undefined", containerNode);
//             }
//         });

//         if (currentOriginalGalleryItemsCount > 0 && originalItemsFullWidth > 0) {
//             // Tính toán số lượng bản sao tối thiểu cần thiết để lấp đầy vùng hiển thị và cung cấp bộ đệm
//             let calculatedMinimumClones = Math.ceil(galleryWrapperWidth / (originalItemsFullWidth / currentOriginalGalleryItemsCount)) + 2;

//             // Đảm bảo numClones ít nhất bằng tổng số lượng item gốc,
//             // để có ít nhất một bộ clone đầy đủ ở đầu và cuối. Điều này giúp đảm bảo vòng lặp mượt mà hơn.
//             numClones = Math.max(calculatedMinimumClones, currentOriginalGalleryItemsCount); // ĐIỀU CHỈNH SỐ LƯỢNG CLONE
//         } else {
//             // Giá trị dự phòng nếu tính toán có vấn đề
//             numClones = currentOriginalGalleryItemsCount > 0 ? currentOriginalGalleryItemsCount : 5;
//             console.warn("Problem calculating numClones due to zero widths or counts. Using fallback:", numClones);
//         }

//         // Thêm các bản sao vào phía trước (prepend)
//         for (let i = 1; i <= numClones; i++) {
//             const actualIndex = (currentOriginalGalleryItemsCount - i % currentOriginalGalleryItemsCount + currentOriginalGalleryItemsCount) % currentOriginalGalleryItemsCount;
//             if (originalItemNodes[actualIndex]) {
//                 const clone = originalItemNodes[actualIndex].cloneNode(true);
//                 clone.classList.add('cloned');
//                 galleryTrack.prepend(clone);
//             }
//         }
//         // Thêm các bản sao vào phía sau (append)
//         for (let i = 0; i < numClones; i++) {
//             const originalIndexForClone = i % currentOriginalGalleryItemsCount;
//             if (originalItemNodes[originalIndexForClone]) {
//                 const clone = originalItemNodes[originalIndexForClone].cloneNode(true);
//                 clone.classList.add('cloned');
//                 galleryTrack.appendChild(clone);
//             }
//         }

//         galleryItemContainers = Array.from(galleryTrack.children);

//         // Tính toán chiều rộng của các bản sao phía trước
//         clonedItemsPrefixWidth = 0;
//         for (let i = 0; i < numClones; i++) {
//             if (galleryItemContainers[i]) {
//                 clonedItemsPrefixWidth += galleryItemContainers[i].offsetWidth + 10; // Cộng 10px cho khoảng cách
//             } else {
//                 console.warn(`Prefix clone at index ${i} is undefined.`);
//             }
//         }

//         // Đặt vị trí cuộn ban đầu để hiển thị các item gốc đầu tiên
//         currentScroll = clonedItemsPrefixWidth;
//         galleryTrack.style.transition = 'none'; // Tắt transition để nhảy vị trí ngay lập tức
//         galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//         // Bật lại transition sau một chút để các chuyển động tiếp theo mượt mà
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
//             currentScroll += scrollSpeed; // currentScroll sẽ giảm vì scrollSpeed là âm

//             galleryTrack.style.transform = `translateX(${-currentScroll}px)`;

//             // Logic reset khi trượt từ TRÁI sang PHẢI (currentScroll giảm)
//             // Khi currentScroll giảm đến mức nó đã trượt hết phần tử gốc và các clone phía trước
//             // Reset về vị trí ban đầu của các phần tử gốc để tạo hiệu ứng lặp lại
//             if (currentScroll <= (clonedItemsPrefixWidth - originalItemsFullWidth)) { // ĐIỀU KIỆN RESET ĐÃ ĐƯỢC THAY ĐỔI
//                 currentScroll = clonedItemsPrefixWidth; // ĐẶT LẠI VỊ TRÍ
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

//         // Reset transform values for the new image
//         lightboxImg.style.transition = 'none';
//         currentZoomLevel = 1;
//         currentLightboxImgPosX = 0;
//         currentLightboxImgPosY = 0;
//         applyTransform(); // Apply reset transform
//         lightboxImg.style.opacity = '0'; // Fade out for new image

//         lightboxImg.onload = () => {
//             lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out';
//             lightboxImg.style.opacity = '1';
//             lightboxImg.onload = null;
//         };

//         lightboxImg.src = newImgSrc;
//         lightboxImg.alt = newImgAlt;

//         // If image is already cached, onload might not fire, so ensure it fades in
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

//             // Hide scroll button when lightbox opens
//             hideScrolltopButton();
//         }
//     });

//     lightboxClose.addEventListener('click', () => {
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

//         // Show scroll button when lightbox closes
//         showScrolltopButton();
//     });

//     // Kích hoạt và sửa đổi lắng nghe sự kiện click trên lightbox để đóng
//     lightbox.addEventListener('click', (e) => {
//         // Chỉ đóng nếu click trực tiếp vào lớp phủ lightbox hoặc nút đóng,
//         // VÀ KHÔNG phải là kết thúc của một thao tác kéo.
//         if ((e.target === lightbox || e.target === lightboxClose) && !hasDraggedLightbox) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1;
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             applyTransform(); // Apply reset transform
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = '';

//             // Show scroll button when lightbox closes
//             showScrolltopButton();
//         }
//     });

//     document.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//             lightbox.classList.remove('active');
//             startAutoScroll();
//             isDraggingLightbox = false;
//             currentZoomLevel = 1;
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             lightboxImg.style.transition = 'none';
//             applyTransform(); // Apply reset transform
//             lightboxImg.style.opacity = '1';
//             document.body.style.overflow = '';

//             // Show scroll button when lightbox closes
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

//     function applyTransform() {
//         lightboxImg.style.transform = `translate(${currentLightboxImgPosX}px, ${currentLightboxImgPosY}px) scale(${currentZoomLevel})`;
//     }

//     // Hàm giới hạn vị trí ảnh khi kéo hoặc zoom
//     function limitImagePosition() {
//         // Use naturalWidth/Height for the true dimensions, then scale by zoom level
//         const imgNaturalWidth = lightboxImg.naturalWidth;
//         const imgNaturalHeight = lightboxImg.naturalHeight;

//         // Calculate rendered dimensions of the image
//         const renderedImgWidth = imgNaturalWidth * currentZoomLevel;
//         const renderedImgHeight = imgNaturalHeight * currentZoomLevel;

//         const viewportWidth = lightbox.offsetWidth;
//         const viewportHeight = lightbox.offsetHeight;

//         // Calculate maximum pan distance
//         const maxPanX = Math.max(0, (renderedImgWidth - viewportWidth) / 2);
//         const maxPanY = Math.max(0, (renderedImgHeight - viewportHeight) / 2);

//         if (currentZoomLevel > 1) {
//             // Apply limits
//             currentLightboxImgPosX = Math.max(-maxPanX, Math.min(maxPanX, currentLightboxImgPosX));
//             currentLightboxImgPosY = Math.max(-maxPanY, Math.min(maxPanY, currentLightboxImgPosY));
//         } else {
//             // If not zoomed, center the image
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//         }
//     }


//     function startDragLightbox(e) {
//         if (e.type === 'mousedown' && e.button !== 0) return;

//         // Don't start drag if pinching with 2 fingers
//         if (e.touches && e.touches.length > 1) return;

//         isDraggingLightbox = true;
//         hasDraggedLightbox = false; // Reset on drag start

//         startLightboxPosX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
//         startLightboxPosY = (e.type === 'mousedown') ? e.clientY : e.touches[0].clientY;

//         // Store the image's current translated position at the start of the drag
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
//         lightboxImg.style.transition = 'none'; // Disable transition during drag

//         if (e.type === 'touchstart') {
//             e.preventDefault();
//         }
//     }

//     function dragLightbox(e) {
//         if (!isDraggingLightbox || isPinching) return; // Don't drag if pinching

//         const currentClientX = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
//         const currentClientY = (e.type === 'mousemove') ? e.clientY : e.touches[0].clientY;

//         const deltaX = currentClientX - startLightboxPosX;
//         const deltaY = currentClientY - startLightboxPosY;

//         // Update the current position based on drag delta
//         currentLightboxImgPosX += deltaX;
//         currentLightboxImgPosY += deltaY;

//         // Limit position only if zoomed in
//         if (currentZoomLevel > 1) {
//             limitImagePosition();
//         } else {
//             // If not zoomed, allow free drag for swipe detection in endDragLightbox
//         }

//         applyTransform();

//         // Update start position for the next movement calculation
//         startLightboxPosX = currentClientX;
//         startLightboxPosY = currentClientY;

//         // Set hasDraggedLightbox if movement exceeds a small threshold
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
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; // Re-enable transition

//             if (currentZoomLevel > 1) {
//                 // If zoomed in, just ensure image is within bounds
//                 limitImagePosition();
//                 applyTransform();
//             } else {
//                 // If not zoomed, handle swipe to change image
//                 const lightboxWidth = lightbox.offsetWidth;
//                 // Check the net horizontal movement
//                 const netHorizontalMovement = currentLightboxImgPosX; // This holds the total horizontal movement from the start of the drag

//                 if (hasDraggedLightbox && Math.abs(netHorizontalMovement) > lightboxWidth * 0.2) {
//                     if (netHorizontalMovement > 0) {
//                         lightboxPrevButton.click();
//                     } else {
//                         lightboxNextButton.click();
//                     }
//                 }
//                 // Always reset image position if not zoomed, after checking for swipe
//                 currentLightboxImgPosX = 0;
//                 currentLightboxImgPosY = 0;
//                 applyTransform();
//             }
//             hasDraggedLightbox = false; // Reset drag flag
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

//         const oldZoomLevel = currentZoomLevel;
//         let delta = Math.sign(e.deltaY) * -zoomSensitivity; // Negative deltaY means scrolling up (zoom in)

//         currentZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, currentZoomLevel + delta));

//         const bbox = lightboxImg.getBoundingClientRect();
//         const mouseX = e.clientX - bbox.left; // Mouse position relative to image
//         const mouseY = e.clientY - bbox.top;

//         const newScaleFactor = currentZoomLevel / oldZoomLevel;

//         // Adjust image position to zoom towards the mouse cursor
//         currentLightboxImgPosX = mouseX - ((mouseX - currentLightboxImgPosX) * newScaleFactor);
//         currentLightboxImgPosY = mouseY - ((mouseY - currentLightboxImgPosY) * newScaleFactor);

//         limitImagePosition(); // Apply limits after zoom
//         applyTransform();
//     }

//     lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });
//     lightbox.addEventListener('wheel', handleWheelZoom, { passive: false });

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

//             // Calculate the pinch center relative to the image
//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             // Save the current image position relative to the pinch center for smooth zoom
//             currentLightboxImgPosX = centerX - bbox.left - (centerX - bbox.left - currentLightboxImgPosX) / currentZoomLevel;
//             currentLightboxImgPosY = centerY - bbox.top - (centerY - bbox.top - currentLightboxImgPosY) / currentZoomLevel;

//             lightboxImg.style.transition = 'none';
//         } else if (e.touches.length === 1) {
//             startDragLightbox(e); // Allow single-finger drag for panning
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

//             if (initialPinchDistance === 0) return; // Avoid division by zero

//             let newZoomLevel = currentZoomLevel * (currentPinchDistance / initialPinchDistance);
//             newZoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, newZoomLevel));

//             const bbox = lightboxImg.getBoundingClientRect();
//             const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//             const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//             const deltaZoom = newZoomLevel / currentZoomLevel;

//             // Adjust image position based on pinch zoom and pinch center
//             currentLightboxImgPosX = centerX - ((centerX - bbox.left - currentLightboxImgPosX) * deltaZoom);
//             currentLightboxImgPosY = centerY - ((centerY - bbox.top - currentLightboxImgPosY) * deltaZoom);

//             currentZoomLevel = newZoomLevel; // Update current zoom level

//             limitImagePosition();
//             applyTransform();
//             initialPinchDistance = currentPinchDistance; // Update initial distance for next move
//         } else if (e.touches.length === 1) {
//             dragLightbox(e); // Continue single-finger drag for panning
//         }
//     }, { passive: false });

//     lightboxImg.addEventListener('touchend', (e) => {
//         if (isPinching) {
//             isPinching = false;
//             initialPinchDistance = 0;
//             lightboxImg.style.transition = 'transform 0.3s ease-out'; // Re-enable transition
//         }
//         // Ensure that after pinch-zoom, if the zoom level is 1, the image is centered.
//         // This also handles the case where a drag ends while not zoomed.
//         if (currentZoomLevel === 1) {
//             currentLightboxImgPosX = 0;
//             currentLightboxImgPosY = 0;
//             applyTransform();
//         }
//         endDragLightbox(e); // Call endDragLightbox to handle swipe logic if not zoomed
//     });

//     window.addEventListener('resize', () => {
//         if (lightbox.classList.contains('active')) {
//             hideScrolltopButton();
//             // Re-evaluate image position and limits on resize if lightbox is open
//             limitImagePosition();
//             applyTransform();
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



