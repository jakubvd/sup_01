document.addEventListener("DOMContentLoaded", function () {
    // 1) Get the slider container and original slides from Webflow
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
    
    // Original slides (assume order: card1, card2, card3)
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const dots = document.querySelectorAll(".slider-dot"); // Dots must have IDs: slider-dot-1, slider-dot-2, etc.
    
    // 2) Create clones for infinite looping:
    const firstSlideClone = originalSlides[0].cloneNode(true);
    firstSlideClone.classList.add("clone");
    const lastSlideClone = originalSlides[originalSlides.length - 1].cloneNode(true);
    lastSlideClone.classList.add("clone");
    
    // 3) Create a track element that will hold the clones and original slides in order:
    // Order: [clone of last, original slides..., clone of first]
    const track = document.createElement("div");
    track.className = "slider-track";
    track.style.display = "flex";
    track.style.transition = "transform 0.6s ease";
    track.style.width = `${(originalSlides.length + 2) * 100}%`;
    
    // Prepend clone of last
    track.appendChild(lastSlideClone);
    // Append all original slides
    originalSlides.forEach((slide) => {
      // Remove any absolute positioning so that flex can work properly
      slide.style.position = "relative";
      slide.style.flex = "0 0 100%";
      slide.style.width = "100%";
      slide.style.transition = "none"; // We'll set the track transition instead
      track.appendChild(slide);
    });
    // Append clone of first
    track.appendChild(firstSlideClone);
    
    // Clear the container and insert the track
    sliderContainer.innerHTML = "";
    sliderContainer.appendChild(track);
    
    // 4) Slider state
    // currentIndex refers to the index within the track.
    // The real slides are at indexes 1 (card1), 2 (card2), 3 (card3).
    // We'll start at 1 so that card1 is visible.
    let currentIndex = 1;
    const realSlideCount = originalSlides.length; // e.g., 3
    let autoplayInterval = null;
    let isInView = false; // for IntersectionObserver
    
    // Function to set track position based on currentIndex
    function setTrackPosition() {
      const slideWidth = sliderContainer.offsetWidth;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
    
    // Set the initial track position (show card1)
    setTrackPosition();
    
    // 5) Update dots: real slide index = currentIndex - 1
    function updateDots(index) {
      // index here is 0-based for real slides (0 for card1, etc.)
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${index + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    updateDots(currentIndex - 1);
    
    // 6) Go to a specific slide (by real slide index, adjusted for clones)
    function goToSlide(index) {
      // When calling this, index is the new track index
      currentIndex = index;
      setTrackPosition();
      // Update dots only for real slides
      if (currentIndex === 0) {
        // Clone of last, so real slide is last
        updateDots(realSlideCount - 1);
      } else if (currentIndex === realSlideCount + 1) {
        // Clone of first, so real slide is first
        updateDots(0);
      } else {
        updateDots(currentIndex - 1);
      }
    }
    
    // 7) Next / Prev functions:
    function nextSlide() {
      goToSlide(currentIndex + 1);
    }
    function prevSlide() {
      goToSlide(currentIndex - 1);
    }
    
    // 8) On transition end, check if we're on a clone and jump without animation:
    track.addEventListener("transitionend", function () {
      const slideWidth = sliderContainer.offsetWidth;
      // If we moved to clone of first (index realSlideCount+1), jump to real first (index 1)
      if (currentIndex === realSlideCount + 1) {
        track.style.transition = "none";
        currentIndex = 1;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        // Force reflow to reset transition
        void track.offsetWidth;
        track.style.transition = "transform 0.6s ease";
      }
      // If we moved to clone of last (index 0), jump to real last (index realSlideCount)
      if (currentIndex === 0) {
        track.style.transition = "none";
        currentIndex = realSlideCount;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        void track.offsetWidth;
        track.style.transition = "transform 0.6s ease";
      }
    });
    
    // 9) Dot click events
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          // When a dot is clicked, jump to the corresponding real slide (which is at track index idx+1)
          goToSlide(idx + 1);
        });
      });
    }
    
    // 10) Autoplay every 7s, if slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) {
          nextSlide();
        }
      }, 7000);
    }
    
    // 11) IntersectionObserver to detect slider visibility
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
    
    // 12) Handle window resize: re-calc track position
    function handleResize() {
      setTrackPosition();
    }
    
    // 13) Initialize slider functionality
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  });