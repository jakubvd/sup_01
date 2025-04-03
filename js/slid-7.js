document.addEventListener("DOMContentLoaded", function () {
    // --- Funkcja pomocnicza: getTransition() zwraca string przejścia zależnie od szerokości okna ---
    function getTransition() {
      return window.innerWidth <= 480 
        ? "transform 0.4s ease, opacity 0.4s ease" 
        : "transform 0.6s ease, opacity 0.6s ease";
    }
    
    // --- 1) PRZYGOTOWANIE SLIDERA (bez klonów) ---
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
    
    // Pobieramy 3 oryginalne karty
    let slides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const slideCount = slides.length; // powinno być 3
    const dots = Array.from(document.querySelectorAll(".slider-dot")); // ID: slider-dot-1, slider-dot-2, slider-dot-3
    
    // --- 2) STAN PODSTAWOWY ---
    // Indeksy: 0 = Card1, 1 = Card2, 2 = Card3.
    // Ustawiamy currentIndex na 0, czyli Card1 jest widoczna.
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // Dla IntersectionObserver
    let userInteracted = false; // gdy true – wyłączamy autoplay
    
    // --- 3) INICJALNE STYLOWANIE (POZYCJA I OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = "0";
      slide.style.left = "0";
      slide.style.width = "100%";
      slide.style.transition = "none"; // bez przejścia na starcie
      // Aktywna karta ma translateX(0%), następna +100%, poprzednia -100%
      slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      slide.style.opacity = (i === currentIndex) ? "1" : "0";
    });
    
    // Po krótkim czasie włączamy przejścia
    setTimeout(() => {
      slides.forEach(slide => {
        slide.style.transition = getTransition();
        slide.style.opacity = "1";
      });
      dots.forEach(dot => {
        dot.style.transition = "background-color 0.6s ease";
      });
    }, 300);
    
    // --- 4) FUNKCJA updateDots ---
    function updateDots(realIndex) {
      // realIndex w zakresie [0, slideCount-1]
      if (realIndex < 0) realIndex = slideCount - 1;
      if (realIndex > slideCount - 1) realIndex = 0;
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = dots[realIndex];
      if (activeDot) activeDot.classList.add("is-active");
    }
    
    // Aktualizujemy kropki przy starcie
    updateDots(currentIndex);
    
    // --- 5) GŁÓWNA FUNKCJA: goToSlide(realIndex)
    // realIndex: docelowy indeks karty (0: Card1, 1: Card2, 2: Card3)
    function goToSlide(realIndex) {
      userInteracted = true;
      clearInterval(autoplayInterval);
      currentIndex = realIndex;
      animateSlides();
      updateDots(realIndex);
    }
    
    // --- 6) OBSŁUGA KLIKNIĘĆ KROPEK ---
    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        goToSlide(idx);
      });
    });
    
    // --- 7) FUNKCJE nextSlide i prevSlide (dla autoplay lub swipe) ---
    function nextSlide() {
      currentIndex = (currentIndex + 1) % slideCount;
      animateSlides();
      updateDots(currentIndex);
    }
    function prevSlide() {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      animateSlides();
      updateDots(currentIndex);
    }
    
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
      });
    }
    
    // --- 8) AUTOPLAY ---
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView && !userInteracted) {
          nextSlide();
        }
      }, 7000);
    }
    
    // --- 9) INTERSECTION OBSERVER ---
    function observeVisibility() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isInView = entry.isIntersecting;
        });
      }, { threshold: 0.5 });
      observer.observe(sliderContainer);
    }
    
    // --- 10) HANDLE RESIZE ---
    function handleResize() {
      animateSlides();
    }
    
    // --- 11) INICJACJA ---
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
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) handleResize();
    });
    window.addEventListener("focus", () => handleResize());
    
    // --- 12) SWIPE GESTURY (TOUCH & MOUSE)
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentDelta = 0;
    const dragThreshold = 10; // w px
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
      // Jeśli ruch pionowy jest dominujący, ignorujemy swipe poziomy.
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
          // Swipe w lewo: target = (currentIndex + 1) mod slideCount
          targetRealIndex = (currentIndex + 1) % slideCount;
        } else {
          // Swipe w prawo: target = (currentIndex - 1 + slideCount) mod slideCount
          targetRealIndex = (currentIndex - 1 + slideCount) % slideCount;
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
    }
    
    sliderContainer.addEventListener("touchstart", touchStartHandler);
    sliderContainer.addEventListener("touchmove", touchMoveHandler);
    sliderContainer.addEventListener("touchend", touchEndHandler);
    sliderContainer.addEventListener("mousedown", touchStartHandler);
    sliderContainer.addEventListener("mousemove", touchMoveHandler);
    sliderContainer.addEventListener("mouseup", touchEndHandler);
    sliderContainer.addEventListener("mouseleave", touchEndHandler);
  });