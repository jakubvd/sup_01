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
  
    // Create clone of the first slide only (we don't create a clone of the last slide)
    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add("clone");
  
    // Build new slides array: [card1, card2, card3, cloneOfCard1]
    let slides = [...originalSlides, firstClone];
  
    // Clear the container and inject slides in order
    sliderContainer.innerHTML = "";
    slides.forEach(slide => sliderContainer.appendChild(slide));
  
    // --- 2) BASIC STATE ---
    // With this setup, indices:
    // 0 = Card1, 1 = Card2, 2 = Card3, 3 = CloneOfCard1
    // Start at index 0 so that Card1 is visible.
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // IntersectionObserver
    let totalSlides = slides.length; // 4
    let userInteracted = false; // When true, disable autoplay
    let clonesRemoved = false; // Flag to track if clones have been removed
  
    // --- 3) INITIAL STYLING (POSITION + OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // Disable transitions on load
      // Position: active slide at 0%, next at +100%, previous at -100%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      // Only the current slide is fully visible initially
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
  
    // After a short delay, re-enable transitions for smooth animations
    setTimeout(() => {
      slides.forEach(slide => {
        slide.style.transition = getTransition();
        slide.style.opacity = "1"; // Ensure all slides are visible for future transitions
      });
      // Also, set dot transitions if needed
      dots.forEach(dot => {
        dot.style.transition = "background-color 0.6s ease";
      });
    }, 300);
  
    // --- 4) DOTS: Mark the first real slide as active
    updateDots(currentIndex); // currentIndex 0 => Card1
  
    // --- 5) MAIN FUNCTION: goToSlide(realIndex)
    // realIndex is in [0, slideCount-1] (0: Card1, 1: Card2, 2: Card3)
    function goToSlide(realIndex) {
      userInteracted = true;
      clearInterval(autoplayInterval);
      // Remove clones if not already removed, so we work with closed loop
      if (!clonesRemoved) removeClones();
      // In closed loop, currentIndex is simply the real slide index.
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
  
    // --- 8) TRANSITION END: (Only when clones exist; infinite loop mode)
    if (!clonesRemoved) {
      slides.forEach(slide => {
        slide.addEventListener("transitionend", () => {
          // If we reached the clone (index === totalSlides - 1), jump immediately to index 0 (Card1)
          if (currentIndex === totalSlides - 1) {
            jumpWithoutAnimation(0);
          }
          // If we moved backward beyond the first real slide (currentIndex < 0), jump to last real slide (index = slideCount - 1)
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
      void slides[0].offsetWidth; // Force reflow
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
  
    // --- Function to remove clones on user interaction and update indices ---
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
        // Use same logic as dot navigation: if swiping left from last card, go to first; if swiping right from first, go to last.
        if (currentDelta < 0) {
          // If we're on the last real slide (index 2) and swiping left, target should be 0.
          if (!clonesRemoved && currentIndex === 2) {
            targetRealIndex = 0;
          } else if (clonesRemoved && currentIndex === 2) {
            targetRealIndex = 0;
          } else {
            targetRealIndex = (currentIndex + 1) % slideCount;
          }
        } else {
          // If we're on the first real slide (index 0) and swiping right, target should be the last (index 2).
          if (!clonesRemoved && currentIndex === 0) {
            targetRealIndex = slideCount - 1;
          } else if (clonesRemoved && currentIndex === 0) {
            targetRealIndex = slideCount - 1;
          } else {
            targetRealIndex = (currentIndex - 1 + slideCount) % slideCount;
          }
        }
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