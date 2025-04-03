document.addEventListener("DOMContentLoaded", function () {
    function getTransition() {
      return window.innerWidth <= 480
        ? "transform 0.4s ease, opacity 0.4s ease"
        : "transform 0.6s ease, opacity 0.6s ease";
    }
  
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
  
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const slideCount = originalSlides.length;
    const dots = Array.from(document.querySelectorAll(".slider-dot"));
  
    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add("clone");
  
    let slides = [...originalSlides, firstClone];
  
    sliderContainer.innerHTML = "";
    slides.forEach(slide => sliderContainer.appendChild(slide));
  
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false;
    let totalSlides = slides.length;
    let userInteracted = false;
    let clonesRemoved = false;
  
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = "0";
      slide.style.left = "0";
      slide.style.width = "100%";
      slide.style.transition = "none";
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
  
    setTimeout(() => {
      slides.forEach(slide => {
        slide.style.transition = getTransition();
        slide.style.opacity = "1";
      });
      dots.forEach(dot => {
        dot.style.transition = "background-color 0.6s ease";
      });
    }, 300);
  
    function updateDots(realIndex) {
      if (realIndex < 0) realIndex = slideCount - 1;
      if (realIndex > slideCount - 1) realIndex = 0;
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = dots[realIndex];
      if (activeDot) activeDot.classList.add("is-active");
    }
    updateDots(currentIndex);
  
    function goToSlide(realIndex) {
      userInteracted = true;
      clearInterval(autoplayInterval);
      if (!clonesRemoved) removeClones();
      currentIndex = realIndex;
      animateSlides();
      updateDots(realIndex);
    }
  
    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        goToSlide(idx);
      });
    });
  
    function nextSlide() {
      if (!userInteracted) {
        currentIndex++;
        animateSlides();
      } else {
        currentIndex = (currentIndex + 1) % slideCount;
        animateSlides();
        updateDots(currentIndex);
      }
    }
  
    function prevSlide() {
      if (!userInteracted) {
        currentIndex--;
        animateSlides();
      } else {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        animateSlides();
        updateDots(currentIndex);
      }
    }
  
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
  
    if (!userInteracted) {
      slides.forEach(slide => {
        slide.addEventListener("transitionend", () => {
          if (currentIndex === totalSlides - 1) {
            jumpWithoutAnimation(0);
          } else if (currentIndex < 0) {
            jumpWithoutAnimation(slideCount - 1);
          }
        });
      });
    }
  
    function jumpWithoutAnimation(newIndex) {
      slides.forEach(slide => {
        slide.style.transition = "none";
      });
      currentIndex = newIndex;
      animateSlides();
      void slides[0].offsetWidth;
      setTimeout(() => {
        slides.forEach(slide => {
          slide.style.transition = getTransition();
        });
      }, 50);
      updateDots(newIndex);
    }
  
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView && !userInteracted) {
          nextSlide();
        }
      }, 7000);
    }
  
    function observeVisibility() {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          isInView = entry.isIntersecting;
        });
      }, { threshold: 0.5 });
      observer.observe(sliderContainer);
    }
  
    function handleResize() {
      animateSlides();
    }
  
    function removeClones() {
      slides.forEach(slide => {
        if (slide.classList.contains("clone")) {
          sliderContainer.removeChild(slide);
        }
      });
      slides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
      totalSlides = slides.length;
      clonesRemoved = true;
      animateSlides();
    }
  
    observeVisibility();
    autoplay();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(autoplayInterval);
      } else if (!userInteracted) {
        autoplay();
        handleResize();
      }
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted) handleResize();
    });
    window.addEventListener("focus", () => handleResize());
  
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentDelta = 0;
    const dragThreshold = 10;
    let ignoreHorizontal = false;
  
    function touchStartHandler(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      ignoreHorizontal = false;
      slides.forEach(slide => {
        slide.style.transition = "none";
      });
    }
  
    function touchMoveHandler(e) {
      if (!isDragging) return;
      let currentX = e.touches ? e.touches[0].clientX : e.clientX;
      let currentY = e.touches ? e.touches[0].clientY : e.clientY;
      currentDelta = currentX - startX;
      let verticalDelta = currentY - startY;
      if (Math.abs(verticalDelta) > Math.abs(currentDelta) && Math.abs(verticalDelta) > dragThreshold) {
        ignoreHorizontal = true;
        return;
      }
      const percentDelta = (currentDelta / sliderContainer.offsetWidth) * 100;
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100 + percentDelta}%)`;
      });
    }
  
    function touchEndHandler() {
      if (!isDragging) return;
      isDragging = false;
      slides.forEach(slide => {
        slide.style.transition = getTransition();
      });
      if (ignoreHorizontal) {
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
        });
        currentDelta = 0;
        return;
      }
      if (Math.abs(currentDelta) > dragThreshold) {
        let targetRealIndex;
        if (currentDelta < 0) {
          targetRealIndex = (currentIndex === slideCount - 1) ? 0 : currentIndex + 1;
        } else {
          targetRealIndex = (currentIndex === 0) ? slideCount - 1 : currentIndex - 1;
        }
        goToSlide(targetRealIndex);
      } else {
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
        });
      }
      currentDelta = 0;
      userInteracted = true;
      clearInterval(autoplayInterval);
      if (!clonesRemoved) removeClones();
    }
  
    sliderContainer.addEventListener("touchstart", touchStartHandler);
    sliderContainer.addEventListener("touchmove", touchMoveHandler);
    sliderContainer.addEventListener("touchend", touchEndHandler);
    sliderContainer.addEventListener("mousedown", touchStartHandler);
    sliderContainer.addEventListener("mousemove", touchMoveHandler);
    sliderContainer.addEventListener("mouseup", touchEndHandler);
    sliderContainer.addEventListener("mouseleave", touchEndHandler);
  });