document.addEventListener("DOMContentLoaded", function () {
    // Get slider container and slides
    const sliderContainer = document.querySelector("#slider-ma");
    // Reverse the NodeList so that the first element becomes card-1
    const slides = Array.from(sliderContainer.querySelectorAll(".slider-sl")).reverse();
    const dots = document.querySelectorAll(".slider-dot"); // Must have IDs: slider-dot-1, slider-dot-2, etc.
    
    let currentIndex = 0;
    const slideCount = slides.length;
    let autoplayInterval = null;
    let isInView = false; // For IntersectionObserver
    
    // 1) Position each slide side by side in percentages
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "transform 0.6s ease";
      // Each slide's initial position: (i - currentIndex) * 100%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
    });
    
    // Activate the first dot on load
    updateDots(currentIndex);
    
    // 2) Dot click → jump to slide
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
    
    // MAIN function: go to a specific slide
    function goToSlide(index) {
      currentIndex = index;
      // Shift each slide so that the new currentIndex is at X=0%
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      updateDots(currentIndex);
    }
    
    // Update the active dot using the dot's ID
    function updateDots(index) {
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${index + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    
    // Next / Prev functions
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
    
    // Autoplay every 7s, only if slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) nextSlide();
      }, 7000);
    }
    
    // IntersectionObserver for performance
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
    
    // Handle window resize if needed (re-positions slides)
    function handleResize() {
      // Percentage-based transforms usually adjust automatically, but we reapply for safety
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // Initialize
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  });