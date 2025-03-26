document.addEventListener("DOMContentLoaded", function () {
    // --- 1) PREPARE SLIDES & CLONES ---
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
  
    // Get the 3 original slides
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const slideCount = originalSlides.length; // e.g., 3
    const dots = document.querySelectorAll(".slider-dot"); // IDs: slider-dot-1, slider-dot-2, slider-dot-3
  
    // Create clones
    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add("clone");
    const lastClone = originalSlides[slideCount - 1].cloneNode(true);
    lastClone.classList.add("clone");
  
    // Build a new array: [cloneLast, card1, card2, card3, cloneFirst]
    const slides = [lastClone, ...originalSlides, firstClone];
  
    // Clear the container & re-inject these slides in the correct order
    sliderContainer.innerHTML = "";
    slides.forEach((slide) => sliderContainer.appendChild(slide));
  
    // --- 2) BASIC STATE ---
    // Indices: 0=cloneLast, 1=card1, 2=card2, 3=card3, 4=cloneFirst
    // Start at index 1 so real Card1 is visible
    let currentIndex = 1;
    let autoplayInterval = null;
    let isInView = false; // IntersectionObserver
    const totalSlides = slides.length; // 5
    let userInteracted = false; // If true, disable autoplay
  
    // --- 3) INITIAL STYLING (POSITION + OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // disable transitions on load
  
      // Position so that the active slide (i === currentIndex) is at 0%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
  
      // Only the currentIndex slide is fully visible
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
  
    // After a short delay, re-enable transitions
    setTimeout(() => {
      slides.forEach((slide) => {
        slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        slide.style.opacity = "1"; // All slides visible for future transitions
      });
    }, 300);
  
    // --- 4) DOTS: Mark the first real slide as active
    updateDots(currentIndex - 1);
  
    // --- 5) MAIN FUNCTION: goToSlide(indexInRealSlides)
    function goToSlide(realIndex) {
      // Mark user interaction => disable autoplay
      userInteracted = true;
      clearInterval(autoplayInterval);
  
      // Move directly to realIndex + 1
      currentIndex = realIndex + 1;
  
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
  
    /**
     * Special fix for backward swipe/click from Card1 to Card3:
     * If we're on index=1 (Card1) and user goes prev,
     * skip index=0 (the clone) and go directly to index=3 (Card3).
     */
    function prevSlide() {
      if (currentIndex === 1) {
        // Instead of going from 1 -> 0 -> 3, jump directly to 3
        currentIndex = 3;
        animateSlides();
      } else {
        currentIndex--;
        animateSlides();
      }
    }
  
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      let realIndex = currentIndex - 1;
      updateDots(realIndex);
    }
  
    // --- 8) TRANSITION END => CHECK FOR CLONES, JUMP WITHOUT ANIMATION
    slides.forEach((slide) => {
      slide.addEventListener("transitionend", () => {
        // If we moved to last clone (index=4), jump to 1 (real card1)
        if (currentIndex === totalSlides - 1) {
          jumpWithoutAnimation(1);
        }
        // If we moved to first clone (index=0), jump to 3 (real card3)
        else if (currentIndex === 0) {
          jumpWithoutAnimation(slideCount - 2); // 3
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
      // Force reflow
      void slides[0].offsetWidth;
      setTimeout(() => {
        slides.forEach((slide) => {
          // Re-enable transitions
          slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
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
    let currentDelta = 0;
    const dragThreshold = 10; // in px
  
    function touchStartHandler(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      // Remove transitions for immediate drag
      slides.forEach(slide => {
        slide.style.transition = "none";
      });
    }
  
    function touchMoveHandler(e) {
      if (!isDragging) return;
      let currentX = e.touches ? e.touches[0].clientX : e.clientX;
      currentDelta = currentX - startX;
      const percentDelta = (currentDelta / sliderContainer.offsetWidth) * 100;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100 + percentDelta}%)`;
      });
    }
  
    function touchEndHandler() {
      if (!isDragging) return;
      isDragging = false;
      // Re-enable transitions
      slides.forEach(slide => {
        slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
      });
      if (Math.abs(currentDelta) > dragThreshold) {
        if (currentDelta < 0) {
          nextSlide();
        } else {
          // Check special case: if we are on Card1 (index=1), skip the clone
          if (currentIndex === 1) {
            currentIndex = 3; 
            animateSlides();
          } else {
            prevSlide();
          }
        }
      } else {
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
        });
      }
      currentDelta = 0;
      // Mark user interaction
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