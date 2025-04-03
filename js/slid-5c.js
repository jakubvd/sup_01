document.addEventListener("DOMContentLoaded", function () {
    // --- Helper: getTransition() returns appropriate transition string based on viewport width ---
    function getTransition() {
      return window.innerWidth <= 480 
        ? "transform 0.4s ease, opacity 0.4s ease" 
        : "transform 0.6s ease, opacity 0.6s ease";
    }
    
    // --- 1) PREPARE SLIDES & CLONES ---
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
    
    // Get the 3 original slides
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const slideCount = originalSlides.length; // should be 3
    const dots = document.querySelectorAll(".slider-dot"); // IDs: slider-dot-1, slider-dot-2, slider-dot-3
    
    // Create clone of the first slide only (no left clone)
    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add("clone");
    
    // Build a new array: [card1, card2, card3, cloneOfCard1]
    let slides = [...originalSlides, firstClone];
    
    // Clear the container and inject the slides in order
    sliderContainer.innerHTML = "";
    slides.forEach(slide => sliderContainer.appendChild(slide));
    
    // --- 2) BASIC STATE ---
    // Now indices: 0 = card1, 1 = card2, 2 = card3, 3 = cloneOfCard1
    // Start at index 0 so that card1 is visible.
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // For IntersectionObserver
    let totalSlides = slides.length; // 4
    let userInteracted = false; // When true, disable autoplay
    let clonesRemoved = false; // Flag to track if clones are removed
    
    // --- 3) INITIAL STYLING (POSITION + OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // no transition on load
      
      // Position: active slide at 0%, next at +100%, previous at -100%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      // Only the active slide is fully visible
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
    
    // After a short delay, enable transitions for smooth animations
    setTimeout(() => {
      slides.forEach(slide => {
        slide.style.transition = getTransition();
        slide.style.opacity = "1"; // all slides visible for future transitions
      });
      // Set dot transitions to match if needed
      dots.forEach(dot => {
        dot.style.transition = "background-color 0.6s ease";
      });
    }, 300);
    
    // --- 4) DOTS: Mark the first real slide as active
    updateDots(currentIndex); // currentIndex 0 => Card1
    
    // --- 5) MAIN FUNCTION: goToSlide(realIndex)
    // realIndex is in [0, slideCount - 1] (0: card1, 1: card2, 2: card3)
    function goToSlide(realIndex) {
      userInteracted = true;
      clearInterval(autoplayInterval);
      // Remove clones if not already removed
      if (!clonesRemoved) removeClones();
      
      // In closed-loop mode, slides array now contains only real slides.
      currentIndex = realIndex;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      updateDots(realIndex);
    }
    
    // --- 6) DOT CLICK EVENTS
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
    
    // --- 7) NEXT / PREV (for autoplay or swipe)
    function nextSlide() {
      // When clones are still present, we advance normally.
      if (!clonesRemoved) {
        currentIndex++;
        animateSlides();
      } else {
        currentIndex = (currentIndex + 1) % totalSlides;
        animateSlides();
      }
    }
    function prevSlide() {
      if (!clonesRemoved) {
        currentIndex--;
        animateSlides();
      } else {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        animateSlides();
      }
    }
    
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      updateDots(currentIndex);
    }
    
    // --- 8) TRANSITION END: For infinite loop mode (while clones exist)
    if (!clonesRemoved) {
      slides.forEach(slide => {
        slide.addEventListener("transitionend", () => {
          // If we reached the clone (index === totalSlides - 1), jump to index 0 (Card1)
          if (currentIndex === totalSlides - 1) {
            jumpWithoutAnimation(0);
          }
          // If we moved backward beyond the first slide (currentIndex < 0), jump to last real slide (index = slideCount - 1)
          else if (currentIndex < 0) {
            jumpWithoutAnimation(slideCount - 1);
          }
        });
      });
    }
    
    function jumpWithoutAnimation(newIndex) {
      slides.forEach(slide => {
        slide.style.transition = "none";
      });
      currentIndex = newIndex;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      void slides[0].offsetWidth; // force reflow
      setTimeout(() => {
        slides.forEach(slide => {
          slide.style.transition = getTransition();
        });
      }, 50);
    }
    
    // --- 9) UPDATE DOTS
    function updateDots(realIndex) {
      if (realIndex < 0) realIndex = slideCount - 1;
      if (realIndex > slideCount - 1) realIndex = 0;
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${realIndex + 1}`);
      if (activeDot) activeDot.classList.add("is-active");
    }
    
    // --- 10) AUTOPLAY
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView && !userInteracted) {
          nextSlide();
        }
      }, 7000);
    }
    
    // --- 11) INTERSECTION OBSERVER
    function observeVisibility() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            isInView = entry.isIntersecting;
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(sliderContainer);
    }
    
    // --- 12) HANDLE RESIZE
    function handleResize() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // --- Function to remove clones on user interaction ---
    function removeClones() {
      slides.forEach(slide => {
        if (slide.classList.contains("clone")) {
          sliderContainer.removeChild(slide);
        }
      });
      // Update slides array to contain only the real slides
      slides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
      totalSlides = slides.length; // Now should be 3
      clonesRemoved = true;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // --- 13) INIT
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
    
    // --- 14) VISIBILITYCHANGE & PAGESHOW
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(autoplayInterval);
      } else if (!userInteracted) {
        autoplay();
        handleResize();
      }
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) handleResize();
    });
    window.addEventListener("focus", () => handleResize());
    
    // --- 15) SWIPE GESTURES (TOUCH & MOUSE)
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentDelta = 0;
    const dragThreshold = 10; // in px
    let ignoreHorizontal = false;
    
    function touchStartHandler(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      ignoreHorizontal = false;
      slides.forEach(slide => {
        slide.style.transition = "none";
      });
    }
    
    function touchMoveHandler(e) {
      if (!isDragging) return;
      let currentX = e.touches ? e.touches[0].clientX : e.clientX;
      let currentY = e.touches ? e.touches[0].clientY : e.clientY;
      currentDelta = currentX - startX;
      let verticalDelta = currentY - startY;
      if (Math.abs(verticalDelta) > Math.abs(currentDelta) && Math.abs(verticalDelta) > dragThreshold) {
        ignoreHorizontal = true;
        return;
      }
      const percentDelta = (currentDelta / sliderContainer.offsetWidth) * 100;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100 + percentDelta}%)`;
      });
    }
    
    function touchEndHandler() {
      if (!isDragging) return;
      isDragging = false;
      slides.forEach(slide => {
        slide.style.transition = getTransition();
      });
      if (ignoreHorizontal) {
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
        });
        currentDelta = 0;
        return;
      }
      if (Math.abs(currentDelta) > dragThreshold) {
        let targetRealIndex;
        if (currentDelta < 0) {
          // Swipe left: target = (currentIndex + 1) mod slideCount
          targetRealIndex = (currentIndex + 1) % slideCount;
        } else {
          // Swipe right: target = (currentIndex - 1 + slideCount) mod slideCount
          targetRealIndex = (currentIndex - 1 + slideCount) % slideCount;
        }
        // Use dot navigation logic for consistent behavior:
        goToSlide(targetRealIndex);
      } else {
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
        });
      }
      currentDelta = 0;
      userInteracted = true;
      clearInterval(autoplayInterval);
      if (!clonesRemoved) removeClones();
    }
    
    sliderContainer.addEventListener("touchstart", touchStartHandler);
    sliderContainer.addEventListener("touchmove", touchMoveHandler);
    sliderContainer.addEventListener("touchend", touchEndHandler);
    
    sliderContainer.addEventListener("mousedown", touchStartHandler);
    sliderContainer.addEventListener("mousemove", touchMoveHandler);
    sliderContainer.addEventListener("mouseup", touchEndHandler);
    sliderContainer.addEventListener("mouseleave", touchEndHandler);
  });