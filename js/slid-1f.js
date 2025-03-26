document.addEventListener("DOMContentLoaded", function () {
    // 1) Get references
    const sliderMask = document.querySelector("#slider-ma"); // The visible mask
    const slideNodes = Array.from(sliderMask.querySelectorAll(".slider-sl"));
    const dots = document.querySelectorAll(".slider-dot"); // Must have IDs: slider-dot-1, slider-dot-2, slider-dot-3
  
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // for IntersectionObserver
    const slideCount = slideNodes.length;
  
    // 2) Create a 'track' wrapper that holds all slides in a row
    const track = document.createElement("div");
    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.transition = "transform 0.6s ease";
    track.style.width = `${slideCount * 100}%`; // Enough width to hold all slides side by side
  
    // Move .slider-sl elements into this track
    slideNodes.forEach((slide) => {
      // Each slide is 100% of the mask, so you see exactly one at a time
      slide.style.flex = "0 0 100%";
      // Remove any absolute positioning from earlier approach
      slide.style.position = "relative";
      slide.style.left = "unset";
      slide.style.top = "unset";
      slide.style.width = "100%";
      slide.style.transition = "none"; // We'll rely on the track's transition
      track.appendChild(slide);
    });
  
    // Clear out the old .slider-sl from the mask, then insert the track
    sliderMask.innerHTML = "";
    sliderMask.style.overflow = "hidden"; // hide slides that move out of view
    sliderMask.appendChild(track);
  
    // 3) Dot click → go to slide
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
  
    // 4) Go to a specific slide
    function goToSlide(index) {
      currentIndex = index;
      // The track moves left by (index * 100%)
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots(currentIndex);
    }
  
    // 5) Update dot active class
    function updateDots(index) {
      dots.forEach((dot) => dot.classList.remove("is-active"));
      const activeDot = document.getElementById(`slider-dot-${index + 1}`);
      if (activeDot) {
        activeDot.classList.add("is-active");
      }
    }
  
    // 6) Next / Prev
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
  
    // 7) Autoplay every 7s, only if slider is in view
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView) nextSlide();
      }, 7000);
    }
  
    // 8) IntersectionObserver to detect if slider is in view
    function observeVisibility() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isInView = entry.isIntersecting;
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(sliderMask);
    }
  
    // 9) Handle window resize if needed
    function handleResize() {
      // On resize, we can re-apply the transform so it doesn’t jump
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  
    // 10) Initialize
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
  
    // Mark first dot active + show first slide
    updateDots(currentIndex);
    goToSlide(currentIndex);
  });