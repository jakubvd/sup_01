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
    
    // Build a new array: [cloneLast, slide1, slide2, slide3, cloneFirst]
    const slides = [lastClone, ...originalSlides, firstClone];
    
    // Clear the container & re-inject these slides in the correct order
    sliderContainer.innerHTML = "";
    slides.forEach((slide) => sliderContainer.appendChild(slide));
    
    // --- 2) BASIC STATE ---
    // We have 5 total slides now. Indices: 0=cloneLast, 1=card1, 2=card2, 3=card3, 4=cloneFirst
    // Start at index 1 so real Card1 is visible
    let currentIndex = 1;
    let autoplayInterval = null;
    let isInView = false; // IntersectionObserver
    const totalSlides = slides.length; // Should be 5 now
    
    // --- 3) INITIAL STYLING (POSITION + OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // disable transitions on load
    
      // Position: (i - currentIndex)*100% so that the "active" slide (i === currentIndex) is at 0%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
    
      // Only the currentIndex slide is visible initially
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
    
    // After a short delay, re-enable transitions for smooth animations
    setTimeout(() => {
      slides.forEach((slide) => {
        slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        slide.style.opacity = "1"; // All slides visible for future transitions
      });
    }, 300);
    
    // --- 4) DOTS: Mark the first real slide as active
    updateDots(currentIndex - 1); // currentIndex=1 corresponds to real card 1
    
    // --- 5) MAIN FUNCTION: goToSlide(indexInRealSlides)
    // Updated to simulate forward movement regardless of target dot
    // realIndex is in [0, slideCount-1] for the real slides (card1, card2, card3)
    function goToSlide(realIndex) {
      // Calculate current real slide index
      const currentRealIndex = currentIndex - 1;
      // If the target is before the current real slide, add slideCount to force forward movement
      if (realIndex < currentRealIndex) {
        currentIndex = realIndex + 1 + slideCount;
      } else {
        currentIndex = realIndex + 1;
      }
    
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
    
    // --- 7) NEXT / PREV
    function nextSlide() {
      currentIndex++;
      animateSlides();
    }
    function prevSlide() {
      currentIndex--;
      animateSlides();
    }
    
    // Helper to animate slides & update dot
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    
      // Update dots for real slides; real index = currentIndex - 1
      let realIndex = currentIndex - 1;
      updateDots(realIndex);
    }
    
    // --- 8) TRANSITION END => CHECK FOR CLONE, JUMP WITHOUT ANIMATION
    slides.forEach((slide) => {
      slide.addEventListener("transitionend", () => {
        // If we move to the last clone (index 4), jump to index 1 (real card1)
        if (currentIndex === totalSlides - 1) {
          jumpWithoutAnimation(1);
        }
        // If we move to the first clone (index 0), jump to index (slideCount - 2) (real card3)
        else if (currentIndex === 0) {
          jumpWithoutAnimation(slideCount - 2);
        }
      });
    });
    
    function jumpWithoutAnimation(newIndex) {
      slides.forEach((slide, i) => {
        slide.style.transition = "none";
      });
      currentIndex = newIndex;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      // Force reflow to reset transitions
      void slides[0].offsetWidth;
      setTimeout(() => {
        slides.forEach((slide) => {
          slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        });
      }, 50);
    }
    
    // --- 9) UPDATE DOTS: Update dot based on real slide index (clamped to [0, slideCount-1])
    function updateDots(realIndex) {
      if (realIndex < 0) realIndex = slideCount - 1; // Card3 => index 2
      if (realIndex > slideCount - 1) realIndex = 0; // Card1 => index 0
    
      dots.forEach((dot) => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${realIndex + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    
    // --- 10) AUTOPLAY
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) {
          nextSlide();
        }
      }, 2000);
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
    
    // --- 12) HANDLE RESIZE: Re-apply transforms on resize
    function handleResize() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // --- 13) INIT
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  });