document.addEventListener("DOMContentLoaded", function () {
    // 1) Select the slider container and slides in DOM order
    const sliderContainer = document.querySelector("#slider-ma");
    // Ensure that any slides outside of the container are hidden
    sliderContainer.style.overflow = "hidden";
    
    const slides = Array.from(sliderContainer.querySelectorAll(".slider-sl")); 
    const dots = document.querySelectorAll(".slider-dot"); // Must have IDs: slider-dot-1, slider-dot-2, etc.
    
    // 2) Basic slider state
    let currentIndex = 0;
    const slideCount = slides.length;
    let autoplayInterval = null;
    let isInView = false; // for IntersectionObserver
    
    // 3) Position each slide side by side using percentage transforms
    // Disable transitions initially and set opacity so that only the first slide is visible
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // disable transition on load
      // Position slides: for currentIndex = 0, card 1: 0%, card 2: 100%, card 3: 200%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      // Only the first slide is visible initially
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
    
    // After a short delay, re-enable transitions and reveal all slides
    setTimeout(() => {
      slides.forEach((slide) => {
        slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        slide.style.opacity = "1";
      });
    }, 300);
    
    // 4) Mark the first dot as active immediately
    updateDots(currentIndex);
    
    // 5) If you have clickable dots, hook them up
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
    
    // 6) Main function: go to a specific slide
    function goToSlide(index) {
      currentIndex = index;
      slides.forEach((slide, i) => {
        // Shift each slide so the currentIndex slide is at 0%
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      updateDots(currentIndex);
    }
    
    // 7) Update the active dot based on the current slide index using IDs
    function updateDots(index) {
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${index + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    
    // 8) Next / Prev slide functions
    function nextSlide() {
      if (currentIndex >= slideCount - 1) {
        currentIndex = -1;
      }
      goToSlide(currentIndex + 1);
    }
    function prevSlide() {
      if (currentIndex <= 0) {
        currentIndex = slideCount;
      }
      goToSlide(currentIndex - 1);
    }
    
    // 9) Autoplay every 7s, only if slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) nextSlide();
      }, 7000);
    }
    
    // 10) IntersectionObserver to detect if slider is in view
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
    
    // 11) Handle window resize if needed (usually not necessary for pure percentage transforms)
    function handleResize() {
      // Re-apply transforms in case the layout changed drastically
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // 12) Initialize slider functionality
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  });