document.addEventListener("DOMContentLoaded", function () {
    // --- Helper: getTransition() zwraca odpowiedni string przejścia zależnie od szerokości okna ---
    function getTransition() {
      return window.innerWidth <= 480 
        ? "transform 0.4s ease, opacity 0.4s ease" 
        : "transform 0.6s ease, opacity 0.6s ease";
    }
    
    // --- 1) PRZYGOTOWANIE SLIDERA ---
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
    
    // Pobieramy 3 oryginalne karty
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const slideCount = originalSlides.length; // powinno być 3
    const dots = Array.from(document.querySelectorAll(".slider-dot")); // ID: slider-dot-1, slider-dot-2, slider-dot-3
    
    // Tworzymy klon tylko pierwszej karty (używany przy autoplay do infinite loop)
    const firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add("clone");
    
    // Budujemy tablicę: [Card1, Card2, Card3, CloneCard1]
    let slides = [...originalSlides, firstClone];
    
    // Wstawiamy karty do kontenera
    sliderContainer.innerHTML = "";
    slides.forEach(slide => sliderContainer.appendChild(slide));
    
    // --- 2) STAN PODSTAWOWY ---
    // Indeksy: 0 = Card1, 1 = Card2, 2 = Card3, 3 = CloneCard1.
    // Startujemy z currentIndex = 0 (Card1 widoczna)
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // IntersectionObserver
    let totalSlides = slides.length; // 4 na starcie
    let userInteracted = false; // Gdy true – wyłączamy autoplay
    let clonesRemoved = false; // Flaga, czy klony zostały usunięte (przy interakcji)
    
    // --- 3) INICJALNE STYLOWANIE (POZYCJA I OPACITY) ---
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = "0";
      slide.style.left = "0";
      slide.style.width = "100%";
      slide.style.transition = "none"; // bez przejścia na starcie
      // Ustawiamy transformację: aktywna karta na 0%, następna +100%, poprzednia -100%
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
    
    // --- 4) AKTUALIZACJA KROPEK ---
    function updateDots(realIndex) {
      if (realIndex < 0) realIndex = slideCount - 1;
      if (realIndex > slideCount - 1) realIndex = 0;
      dots.forEach(dot => dot.classList.remove("is-active"));
      const activeDot = dots[realIndex];
      if (activeDot) activeDot.classList.add("is-active");
    }
    updateDots(currentIndex);
    
    // --- 5) GŁÓWNA FUNKCJA: goToSlide(realIndex) ---
    // realIndex: docelowy indeks realnej karty [0, slideCount-1]
    function goToSlide(realIndex) {
      userInteracted = true;
      clearInterval(autoplayInterval);
      // Jeśli interakcja manualna, usuwamy klony, aby działała closed loop
      if (!clonesRemoved) removeClones();
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
    
    // --- 7) FUNKCJE nextSlide i prevSlide (dla autoplay) ---
    function nextSlide() {
      // W trybie autoplay (gdy użytkownik nie wchodzi w interakcję) zachowujemy infinite loop z klonem.
      if (!userInteracted) {
        currentIndex++;
        animateSlides();
        // Po zakończeniu przejścia, jeżeli currentIndex wskazuje na klon (index 3), natychmiast przeskakujemy do Card1 (index 0)
        // Logikę tę realizujemy w zdarzeniu transitionend.
      } else {
        // Gdy interakcja manualna, działamy w closed loop
        currentIndex = (currentIndex + 1) % slideCount;
        animateSlides();
        updateDots(currentIndex);
      }
    }
    function prevSlide() {
      if (!userInteracted) {
        currentIndex--;
        animateSlides();
        // W przypadku negative currentIndex, transitionend przeskoczy do ostatniej karty
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
    
    // --- 8) OBSŁUGA PRZEJŚCIA KOŃCOWEGO (tylko dla infinite loop z klonem)
    if (!userInteracted) { // Gdy autoplay działa, klony pozostają
      slides.forEach(slide => {
        slide.addEventListener("transitionend", () => {
          // Jeśli currentIndex wskazuje na klon (index 3), natychmiast przeskocz do Card1 (index 0)
          if (currentIndex === totalSlides - 1) {
            jumpWithoutAnimation(0);
          }
          // Jeśli currentIndex jest mniejszy niż 0 (przy swipe w prawo na Card1), przeskocz do Card3 (index 2)
          else if (currentIndex < 0) {
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
      void slides[0].offsetWidth; // wymusza reflow
      setTimeout(() => {
        slides.forEach(slide => {
          slide.style.transition = getTransition();
        });
      }, 50);
      updateDots(newIndex);
    }
    
    // --- 9) AUTOPLAY ---
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView && !userInteracted) {
          nextSlide();
        }
      }, 7000);
    }
    
    // --- 10) INTERSECTION OBSERVER ---
    function observeVisibility() {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          isInView = entry.isIntersecting;
        });
      }, { threshold: 0.5 });
      observer.observe(sliderContainer);
    }
    
    // --- 11) HANDLE RESIZE ---
    function handleResize() {
      animateSlides();
    }
    
    // --- Funkcja do usunięcia klonów przy interakcji manualnej ---
    function removeClones() {
      slides.forEach(slide => {
        if (slide.classList.contains("clone")) {
          sliderContainer.removeChild(slide);
        }
      });
      slides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
      totalSlides = slides.length; // powinno być 3
      clonesRemoved = true;
      animateSlides();
    }
    
    // --- 12) INICJACJA ---
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
    
    // --- 13) SWIPE GESTURY (TOUCH & MOUSE)
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
          // Swipe w lewo: jeżeli jesteśmy na ostatniej karcie (index 2) -> cel = 0 (infinite loop autoplay)
          targetRealIndex = (currentIndex === slideCount - 1) ? 0 : currentIndex + 1;
        } else {
          // Swipe w prawo: jeżeli jesteśmy na pierwszej karcie (index 0) -> cel = 2 (infinite loop autoplay)
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