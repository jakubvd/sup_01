document.addEventListener("DOMContentLoaded", function () {
    // Select the slider container and all slides within it
    const sliderContainer = document.querySelector("#slider-ma");
    const slides = sliderContainer.querySelectorAll(".slider-sl");
    const slideElements = sliderContainer.querySelectorAll(".slider-sl"); // For applying transforms to each slide
    const dots = document.querySelectorAll(".slider-dot"); // Dots should have IDs assigned (e.g., "slider-dot-1", "slider-dot-2", ...)
    
    // Add click event listeners to dots to navigate to the corresponding slide using IDs
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
    
    const slideCount = slides.length; // Total number of slides
    let currentIndex = 0; // Current slide index
    let autoplayInterval = null; // For autoplay interval
    let isInView = false; // To check if slider is visible in viewport
    
    // Set the initial position of the slider
    let slideWidth = slides[0].offsetWidth; // Get width of first slide
    let currentTranslate = 0; // Start with no offset so that slide 1 is visible
    updateSlideTransforms(currentTranslate); // Apply the initial transform
    
    // Function to update the transform on each slide element
    function updateSlideTransforms(translateX) {
      slideElements.forEach((slide) => {
        slide.style.transform = `translateX(${translateX}px)`;
      });
    }
    
    // Function to go to a specific slide
    function goToSlide(index) {
      currentIndex = index; // Update the current index
      currentTranslate = -index * slideWidth; // Calculate the new translate value based on index
      sliderContainer.style.transition = "transform 0.6s ease"; // Apply smooth transition
      updateSlideTransforms(currentTranslate); // Move slides to the new position
      updateDots(currentIndex); // Update dot active state
    }
    
    // Function to update the active dot based on the current slide index using IDs
    function updateDots(index) {
      // Remove 'is-active' class from all dots
      dots.forEach(dot => dot.classList.remove("is-active"));
      
      // Get the dot element with ID "slider-dot-#" (assuming numbering starts at 1)
      const activeDot = document.getElementById(`slider-dot-${index + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
    
    // Function to handle the end of the transition (currently no extra handling needed)
    function handleTransitionEnd() {
      // No clone handling required now
    }
    
    // Function to go to the next slide
    function nextSlide() {
      if (currentIndex >= slideCount - 1) {
        currentIndex = -1; // Reset if on the last slide
      }
      goToSlide(currentIndex + 1); // Move to next slide
    }
    
    // Function to go to the previous slide
    function prevSlide() {
      if (currentIndex <= 0) {
        currentIndex = slideCount; // Reset to last slide if on the first
      }
      goToSlide(currentIndex - 1); // Move to previous slide
    }
    
    // Function to autoplay slides every 7 seconds if slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) nextSlide();
      }, 7000);
    }
    
    // Function to handle window resize events
    function handleResize() {
      slideWidth = slides[0].offsetWidth; // Update slide width on resize
      currentTranslate = -currentIndex * slideWidth; // Recalculate translate value
      sliderContainer.style.transition = "none"; // Remove transition for immediate update
      updateSlideTransforms(currentTranslate); // Apply new transform
    }
    
    // Function to observe visibility of the slider (starts autoplay only when in view)
    function observeVisibility() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isInView = entry.isIntersecting;
          });
        },
        {
          threshold: 0.5, // Trigger when 50% of slider is visible
        }
      );
      observer.observe(sliderContainer);
    }
    
    // Initialize slider functionality
    observeVisibility();
    autoplay();
    // Add event listeners
    sliderContainer.addEventListener("transitionend", handleTransitionEnd);
    window.addEventListener("resize", handleResize);
  });