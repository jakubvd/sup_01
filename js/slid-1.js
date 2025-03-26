document.addEventListener("DOMContentLoaded", function () {
  // Select the slider container and all slides within it
  const sliderContainer = document.querySelector("#slider-ma");
  const slides = sliderContainer.querySelectorAll(".slider-sl");
  const slideElements = sliderContainer.querySelectorAll(".slider-sl"); // New line to select slide elements
  const dots = document.querySelectorAll(".slider-dot"); // Optional, if present
  if (dots && dots.length > 0) {
    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        goToSlide(idx);
      });
    });
  }
  const slideCount = slides.length; // Get the total number of slides
  let currentIndex = 0; // Keep track of the current slide index
  let autoplayInterval = null; // Variable to store the autoplay interval
  let isInView = false; // Variable to check if the slider is in view

  // Set the initial position of the slider
  let slideWidth = slides[0].offsetWidth; // Get the width of the first active slide
  let currentTranslate = -slideWidth; // Set the initial translate value to show the first slide
  updateSlideTransforms(currentTranslate); // Apply the initial transform

  // Function to update the transform on each slide
  function updateSlideTransforms(translateX) {
    slideElements.forEach((slide) => {
      slide.style.transform = `translateX(${translateX}px)`;
    });
  }

  // Function to go to a specific slide
  function goToSlide(index) {
    currentIndex = index; // Update the current index
    currentTranslate = -(index + 1) * slideWidth; // Calculate the new translate value
    sliderContainer.style.transition = "transform 0.6s ease"; // Set the transition for smooth sliding
    updateSlideTransforms(currentTranslate); // Apply the new transform
    updateDots(currentIndex); // Update the dots to reflect the current slide
  }

  // Function to handle the end of the transition
  function handleTransitionEnd() {
    // No need for clone handling anymore
  }

  // Function to go to the next slide
  function nextSlide() {
    if (currentIndex >= slideCount - 1) {
      currentIndex = -1; // Reset to -1 if at the last slide
    }
    goToSlide(currentIndex + 1); // Move to the next slide
  }

  // Function to go to the previous slide
  function prevSlide() {
    if (currentIndex <= 0) {
      currentIndex = slideCount; // Reset to the last slide if at the first
    }
    goToSlide(currentIndex - 1); // Move to the previous slide
  }

  // Function to handle autoplay of slides
  function autoplay() {
    autoplayInterval = setInterval(() => {
      if (isInView) nextSlide(); // Only advance if the slider is in view
    }, 7000); // Set interval for 7 seconds
  }

  // Function to handle window resize events
  function handleResize() {
    slideWidth = slides[0].offsetWidth; // Update slide width on resize
    currentTranslate = -(currentIndex + 1) * slideWidth; // Recalculate the translate value
    sliderContainer.style.transition = "none"; // Disable transition for immediate effect
    updateSlideTransforms(currentTranslate); // Apply new transform
  }

  // Initialize the slider functionality
  observeVisibility(); // Start observing visibility
  autoplay(); // Start autoplaying slides
  // Add event listeners for various interactions
  sliderContainer.addEventListener("transitionend", handleTransitionEnd); // Listen for transition end
  window.addEventListener("resize", handleResize); // Listen for window resize
});
