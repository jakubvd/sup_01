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
    
    // 3) Position each slide side by side using percentage transforms.
    // Initially, disable transitions and set opacity so that only card 1 is visible.
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = "100%";
      slide.style.transition = "none"; // disable transition on load
      // For currentIndex = 0: card 1: translateX(0%), card 2: translateX(100%), card 3: translateX(200%)
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      // Only the first slide is visible; others are hidden
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
    
    // 4) After a short delay, re-enable transitions and set all slides' opacity to 1.
    setTimeout(() => {
      slides.forEach((slide) => {
        slide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        slide.style.opacity = "1";
      });
    }, 300);
    
    // 5) Mark the first dot as active immediately
    updateDots(currentIndex);
    
    // 6) Hook up dot click events to navigate to the corresponding slide
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
    
    // 7) Main function: go to a specific slide
    function goToSlide(index) {
      currentIndex = index;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
      updateDots(currentIndex);
    }
    
    // 8) Update the active dot using its ID
    function updateDots(index) {
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${index + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    
    // 9) Next / Prev slide functions
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
    
    // 10) Autoplay every 7s, only if the slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) nextSlide();
      }, 7000);
    }
    
    // 11) IntersectionObserver to detect if the slider is in view
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
    
    // 12) Handle window resize if needed (re-apply transforms)
    function handleResize() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // 13) Initialize slider functionality
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  });