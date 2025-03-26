document.addEventListener("DOMContentLoaded", function () {
  // Select the slider container and all slides within it
  const sliderContainer = document.querySelector("#slider-ma");
  const slides = sliderContainer.querySelectorAll(".slider-sl");
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

  // Clone the first and last slides to create an infinite loop effect
  const firstClone = slides[0].cloneNode(true); // Clone the first slide
  const lastClone = slides[slideCount - 1].cloneNode(true); // Clone the last slide
  firstClone.classList.add("clone"); // Add a class to identify the cloned slide
  lastClone.classList.add("clone"); // Add a class to identify the cloned slide
  sliderContainer.insertBefore(lastClone, slides[0]); // Insert the last clone before the first slide
  sliderContainer.appendChild(firstClone); // Append the first clone at the end of the slider

  // Select all slides including clones
  const allSlides = sliderContainer.querySelectorAll(".slider-sl");
  // Filter out the clones to get only the active slides
  let activeSlides = Array.from(allSlides).filter(slide => !slide.classList.contains("clone"));

  // Assign a data-index attribute to each active slide for easier tracking
  activeSlides.forEach((slide, index) => {
    slide.setAttribute("data-index", index);
  });

  // Set the initial position of the slider
  let slideWidth = activeSlides[0].offsetWidth; // Get the width of the first active slide
  let currentTranslate = -slideWidth; // Set the initial translate value to show the first slide
  sliderContainer.style.transform = `translateX(${currentTranslate}px)`; // Apply the initial transform

  // Function to go to a specific slide
  function goToSlide(index) {
    currentIndex = index; // Update the current index
    currentTranslate = -(index + 1) * slideWidth; // Calculate the new translate value
    sliderContainer.style.transition = "transform 0.6s ease"; // Set the transition for smooth sliding
    sliderContainer.style.transform = `translateX(${currentTranslate}px)`; // Apply the new transform
    updateDots(currentIndex); // Update the dots to reflect the current slide
  }

  // Function to update the active dot based on the current slide
  function updateDots(index) {
    if (!dots || dots.length === 0) return; // If no dots are present, exit the function
    dots.forEach(dot => dot.classList.remove("is-active")); // Remove active class from all dots
    if (dots[index]) dots[index].classList.add("is-active"); // Add active class to the current dot
  }

  // Function to handle the end of the transition
  function handleTransitionEnd() {
    const allSlides = sliderContainer.querySelectorAll(".slider-sl"); // Re-fetch slides in case of cloning
    // If on the last clone (fake first slide)
    if (allSlides[currentIndex + 1]?.classList.contains("clone") && currentIndex === slideCount) {
      sliderContainer.style.transition = "none";
      currentIndex = 0;
      currentTranslate = -(currentIndex + 1) * slideWidth;
      sliderContainer.style.transform = `translateX(${currentTranslate}px)`;
    }
    // If on the first clone (fake last slide)
    else if (allSlides[currentIndex + 1]?.classList.contains("clone") && currentIndex === -1) {
      sliderContainer.style.transition = "none";
      currentIndex = slideCount - 1;
      currentTranslate = -(currentIndex + 1) * slideWidth;
      sliderContainer.style.transform = `translateX(${currentTranslate}px)`;
    }
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

  // Variables for swipe support
  let startX = 0; // Starting X position for touch
  let isDragging = false; // Flag to check if dragging is in progress

  // Function to handle touch start event
  function handleTouchStart(e) {
    isDragging = true; // Set dragging to true
    startX = e.touches ? e.touches[0].clientX : e.clientX; // Get the starting X position
    sliderContainer.style.transition = "none"; // Disable transition for immediate response
  }

  // Function to handle touch move event
  function handleTouchMove(e) {
    if (!isDragging) return; // Exit if not dragging
    let currentX = e.touches ? e.touches[0].clientX : e.clientX; // Get the current X position
    let diff = currentX - startX; // Calculate the difference from the start position
    sliderContainer.style.transform = `translateX(${currentTranslate + diff}px)`; // Apply the drag effect
  }

  // Function to handle touch end event
  function handleTouchEnd(e) {
    if (!isDragging) return; // Exit if not dragging
    let endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX; // Get the ending X position
    let diff = endX - startX; // Calculate the difference
    isDragging = false; // Reset dragging flag
    // Determine if the swipe was enough to change slides
    if (diff > 50) {
      prevSlide(); // Swipe right to go to the previous slide
    } else if (diff < -50) {
      nextSlide(); // Swipe left to go to the next slide
    } else {
      sliderContainer.style.transition = "transform 0.6s ease"; // Smooth transition back to current slide
      sliderContainer.style.transform = `translateX(${currentTranslate}px)`; // Apply current transform
    }
  }

  // Function to observe the visibility of the slider
  function observeVisibility() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting; // Update visibility status based on intersection
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the slider is visible
      }
    );
    observer.observe(sliderContainer); // Start observing the slider container
  }

  // Function to handle window resize events
  function handleResize() {
    slideWidth = activeSlides[0].offsetWidth; // Update slide width on resize
    currentTranslate = -(currentIndex + 1) * slideWidth; // Recalculate the translate value
    sliderContainer.style.transition = "none"; // Disable transition for immediate effect
    sliderContainer.style.transform = `translateX(${currentTranslate}px)`; // Apply new transform
  }

  // Initialize the slider functionality
  observeVisibility(); // Start observing visibility
  autoplay(); // Start autoplaying slides
  // Add event listeners for various interactions
  sliderContainer.addEventListener("transitionend", handleTransitionEnd); // Listen for transition end
  sliderContainer.addEventListener("touchstart", handleTouchStart); // Listen for touch start
  sliderContainer.addEventListener("touchmove", handleTouchMove); // Listen for touch move
  sliderContainer.addEventListener("touchend", handleTouchEnd); // Listen for touch end
  sliderContainer.addEventListener("mousedown", handleTouchStart); // Listen for mouse down
  sliderContainer.addEventListener("mousemove", handleTouchMove); // Listen for mouse move
  sliderContainer.addEventListener("mouseup", handleTouchEnd); // Listen for mouse up
  sliderContainer.addEventListener("mouseleave", handleTouchEnd); // Listen for mouse leave
  window.addEventListener("resize", handleResize); // Listen for window resize
});
