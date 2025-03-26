document.addEventListener("DOMContentLoaded", function () {
  const sliderContainer = document.querySelector("#slider-ma");
  const slides = sliderContainer.querySelectorAll(".slider-sl");
  const dots = document.querySelectorAll(".slider-dot"); // Optional, if present
  const slideCount = slides.length;
  let currentIndex = 0;
  let autoplayInterval = null;
  let isInView = false;

  // Clone first and last slides for infinite loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slideCount - 1].cloneNode(true);
  firstClone.classList.add("clone");
  lastClone.classList.add("clone");
  sliderContainer.insertBefore(lastClone, slides[0]);
  sliderContainer.appendChild(firstClone);

  const allSlides = sliderContainer.querySelectorAll(".slider-sl");
  let activeSlides = Array.from(allSlides).filter(slide => !slide.classList.contains("clone"));

  // Apply data-index dynamically
  activeSlides.forEach((slide, index) => {
    slide.setAttribute("data-index", index);
  });

  // Set initial position
  let slideWidth = activeSlides[0].offsetWidth;
  let currentTranslate = -slideWidth;
  sliderContainer.style.transform = `translateX(${currentTranslate}px)`;

  function goToSlide(index) {
    currentIndex = index;
    currentTranslate = -(index + 1) * slideWidth;
    sliderContainer.style.transition = "transform 0.6s ease";
    sliderContainer.style.transform = `translateX(${currentTranslate}px)`;
    updateDots(index);
  }

  function updateDots(index) {
    if (!dots || dots.length === 0) return;
    dots.forEach(dot => dot.classList.remove("is-active"));
    if (dots[index]) dots[index].classList.add("is-active");
  }

  function handleTransitionEnd() {
    if (allSlides[currentIndex + 1].classList.contains("clone")) {
      sliderContainer.style.transition = "none";
      currentIndex = currentIndex === -1 ? slideCount - 1 : 0;
      currentTranslate = -(currentIndex + 1) * slideWidth;
      sliderContainer.style.transform = `translateX(${currentTranslate}px)`;
    }
  }

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

  function autoplay() {
    autoplayInterval = setInterval(() => {
      if (isInView) nextSlide();
    }, 7000);
  }

  // Swipe support
  let startX = 0;
  let isDragging = false;

  function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    sliderContainer.style.transition = "none";
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    let currentX = e.touches ? e.touches[0].clientX : e.clientX;
    let diff = currentX - startX;
    sliderContainer.style.transform = `translateX(${currentTranslate + diff}px)`;
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;
    let endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    let diff = endX - startX;
    isDragging = false;
    if (diff > 50) {
      prevSlide();
    } else if (diff < -50) {
      nextSlide();
    } else {
      sliderContainer.style.transition = "transform 0.6s ease";
      sliderContainer.style.transform = `translateX(${currentTranslate}px)`;
    }
  }

  function observeVisibility() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
        });
      },
      {
        threshold: 0.5,
      }
    );
    observer.observe(sliderContainer);
  }

  // Resize support
  function handleResize() {
    slideWidth = activeSlides[0].offsetWidth;
    currentTranslate = -(currentIndex + 1) * slideWidth;
    sliderContainer.style.transition = "none";
    sliderContainer.style.transform = `translateX(${currentTranslate}px)`;
  }

  // Init
  observeVisibility();
  autoplay();
  sliderContainer.addEventListener("transitionend", handleTransitionEnd);
  sliderContainer.addEventListener("touchstart", handleTouchStart);
  sliderContainer.addEventListener("touchmove", handleTouchMove);
  sliderContainer.addEventListener("touchend", handleTouchEnd);
  sliderContainer.addEventListener("mousedown", handleTouchStart);
  sliderContainer.addEventListener("mousemove", handleTouchMove);
  sliderContainer.addEventListener("mouseup", handleTouchEnd);
  sliderContainer.addEventListener("mouseleave", handleTouchEnd);
  window.addEventListener("resize", handleResize);
});
