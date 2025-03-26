document.addEventListener("DOMContentLoaded", function () {
    // 1) Get slider container and original slides
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const dots = document.querySelectorAll(".slider-dot"); // Must have IDs: slider-dot-1, slider-dot-2, etc.
    
    const originalCount = originalSlides.length; // Should be 3
    
    // 2) Create clones of the original group
    // Clone the entire group for left and right sides.
    const leftClones = originalSlides.map(slide => slide.cloneNode(true));
    const rightClones = originalSlides.map(slide => slide.cloneNode(true));
    
    // 3) Create a track element to hold all slides in order:
    // Order: [Left clone group] + [Original group] + [Right clone group]
    const track = document.createElement("div");
    track.className = "slider-track";
    track.style.display = "flex";
    track.style.transition = "transform 0.6s ease";
    // Total slides count = originalCount * 3 (for 3 slides, total 9)
    track.style.width = `${(originalCount * 3) * 100}%`;
    
    // Append left clones
    leftClones.forEach(clone => {
      // Ensure each slide takes full container width in flex
      clone.style.flex = "0 0 100%";
      clone.style.width = "100%";
      track.appendChild(clone);
    });
    // Append original slides
    originalSlides.forEach(slide => {
      // Remove any absolute positioning (use flex layout)
      slide.style.position = "relative";
      slide.style.flex = "0 0 100%";
      slide.style.width = "100%";
      slide.style.transition = "none"; // We'll use track's transition
      track.appendChild(slide);
    });
    // Append right clones
    rightClones.forEach(clone => {
      clone.style.flex = "0 0 100%";
      clone.style.width = "100%";
      track.appendChild(clone);
    });
    
    // Clear original container and append the track
    sliderContainer.innerHTML = "";
    sliderContainer.appendChild(track);
    
    // 4) Slider state
    // The track now has 9 slides. The original group is at indices [originalCount, originalCount*2 - 1] i.e. [3, 5].
    let currentIndex = originalCount; // Start at index 3 => original Card 1 visible
    const totalSlides = track.children.length; // 9 in our case
    let autoplayInterval = null;
    let isInView = false;
    
    // 5) Function to set track position based on currentIndex
    function setTrackPosition() {
      const slideWidth = sliderContainer.offsetWidth;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
    
    // Set initial position
    setTrackPosition();
    
    // 6) Update dots: real slide index = currentIndex - originalCount
    function updateDots() {
      let realIndex = (currentIndex - originalCount) % originalCount;
      if (realIndex < 0) realIndex += originalCount;
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${realIndex + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    updateDots();
    
    // 7) Function to go to a specific slide (using real index: 0,1,...,originalCount-1)
    function goToSlide(realIndex) {
      currentIndex = realIndex + originalCount;
      setTrackPosition();
      updateDots();
    }
    
    // 8) Next / Prev functions
    function nextSlide() {
      currentIndex++;
      setTrackPosition();
      updateDots();
    }
    function prevSlide() {
      currentIndex--;
      setTrackPosition();
      updateDots();
    }
    
    // 9) On transition end, check if we're on a clone and jump instantly
    track.addEventListener("transitionend", function () {
      const slideWidth = sliderContainer.offsetWidth;
      // If we are in the right clone group (indices >= originalCount*2)
      if (currentIndex >= originalCount * 2) {
        // Jump back to the original group
        track.style.transition = "none";
        currentIndex = originalCount;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        void track.offsetWidth; // Force reflow
        track.style.transition = "transform 0.6s ease";
      }
      // If we are in the left clone group (indices < originalCount)
      if (currentIndex < originalCount) {
        track.style.transition = "none";
        currentIndex = originalCount + originalCount - 1; // Jump to the last slide of the original group (index = 5 for 3 slides)
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        void track.offsetWidth; // Force reflow
        track.style.transition = "transform 0.6s ease";
      }
      updateDots();
    });
    
    // 10) Dot click events: jump to corresponding real slide
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
    
    // 11) Autoplay every 7s if slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) {
          nextSlide();
        }
      }, 7000);
    }
    
    // 12) IntersectionObserver to detect slider visibility
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
    
    // 13) Handle window resize: re-calc track position
    function handleResize() {
      setTrackPosition();
    }
    
    // 14) Initialize slider functionality
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  });