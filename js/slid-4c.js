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
    const slideCount = originalSlides.length; // e.g., 3
    const dots = document.querySelectorAll(".slider-dot"); // IDs: slider-dot-1, slider-dot-2, slider-dot-3
  
    // Create clone of the first slide only
    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add("clone");
  
    // Build a new array: [card1, card2, card3, cloneFirst]
    let slides = [...originalSlides, firstClone];
  
    // Clear the container & re-inject these slides in order
    sliderContainer.innerHTML = "";
    slides.forEach((slide) => sliderContainer.appendChild(slide));
  
    // --- 2) BASIC STATE ---
    // With our new setup:
    // Indices: 0=card1, 1=card2, 2=card3, 3=cloneFirst
    // Start at index 0 so real Card1 is visible.
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // IntersectionObserver
    let totalSlides = slides.length; // Should be 4 now
    let userInteracted = false; // When true, disable autoplay
  
    // --- 3) INITIAL STYLING (POSITION + OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // disable transitions on load
  
      // Position so that the active slide (i === currentIndex) is at 0%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
  
      // Only the current slide is fully visible initially
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
  
    // After a short delay, re-enable transitions for smooth animations
    setTimeout(() => {
      slides.forEach((slide) => {
        slide.style.transition = getTransition();
        slide.style.opacity = "1"; // All slides visible for future transitions
      });
      // Also, set dot transitions if needed
      dots.forEach((dot) => {
        dot.style.transition = "background-color 0.6s ease";
      });
    }, 300);
  
    // --- 4) DOTS: Mark the first real slide as active
    updateDots(currentIndex); // currentIndex 0 => Card1
  
    // --- 5) MAIN FUNCTION: goToSlide(indexInRealSlides)
    // realIndex is in [0..slideCount-1] (0: card1, 1: card2, 2: card3)
    function goToSlide(realIndex) {
      // Mark user interaction and disable autoplay
      userInteracted = true;
      clearInterval(autoplayInterval);
  
      // Set currentIndex to target (realIndex)
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
      currentIndex++;
      animateSlides();
    }
    function prevSlide() {
      currentIndex--;
      animateSlides();
    }
  
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      updateDots(currentIndex);
    }
  
    // --- 8) TRANSITION END: CHECK FOR CLONES, JUMP WITHOUT ANIMATION
    slides.forEach((slide) => {
      slide.addEventListener("transitionend", () => {
        // If we moved to the clone (index === totalSlides - 1), jump to index 0 (Card1)
        if (currentIndex === totalSlides - 1) {
          jumpWithoutAnimation(0);
        }
        // If we moved backward beyond the first real slide (currentIndex < 0), jump to last real slide (index = slideCount - 1)
        else if (currentIndex < 0) {
          jumpWithoutAnimation(slideCount - 1);
        }
      });
    });
  
    function jumpWithoutAnimation(newIndex) {
      slides.forEach((slide) => {
        slide.style.transition = "none";
      });
      currentIndex = newIndex;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      void slides[0].offsetWidth; // Force reflow
      setTimeout(() => {
        slides.forEach((slide) => {
          slide.style.transition = getTransition();
        });
      }, 50);
    }
  
    // --- 9) UPDATE DOTS
    function updateDots(realIndex) {
      if (realIndex < 0) realIndex = slideCount - 1;
      if (realIndex > slideCount - 1) realIndex = 0;
      dots.forEach((dot) => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${realIndex + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
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
          entries.forEach((entry) => {
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
      if (event.persisted) {
        handleResize();
      }
    });
    window.addEventListener("focus", () => {
      handleResize();
    });
  
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
      slides.forEach((slide) => {
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
        if (currentDelta < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      } else {
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
        });
      }
      currentDelta = 0;
      userInteracted = true;
      clearInterval(autoplayInterval);
    }
  
    sliderContainer.addEventListener("touchstart", touchStartHandler);
    sliderContainer.addEventListener("touchmove", touchMoveHandler);
    sliderContainer.addEventListener("touchend", touchEndHandler);
  
    sliderContainer.addEventListener("mousedown", touchStartHandler);
    sliderContainer.addEventListener("mousemove", touchMoveHandler);
    sliderContainer.addEventListener("mouseup", touchEndHandler);
    sliderContainer.addEventListener("mouseleave", touchEndHandler);
  });