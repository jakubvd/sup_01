document.addEventListener("DOMContentLoaded", function () {
    // --- Funkcja pomocnicza: getTransition() zwraca odpowiedni string przejścia
    function getTransition() {
      return window.innerWidth <= 480 
        ? "transform 0.4s ease, opacity 0.4s ease" 
        : "transform 0.6s ease, opacity 0.6s ease";
    }
  
    // --- 1) Przygotowanie slidera – bez klonów
    const sliderContainer = document.querySelector("#slider-ma");
    sliderContainer.style.overflow = "hidden";
  
    // Pobieramy 3 oryginalne karty
    const originalSlides = Array.from(sliderContainer.querySelectorAll(".slider-sl"));
    const slideCount = originalSlides.length; // powinno być 3
    const dots = document.querySelectorAll(".slider-dot"); // ID: slider-dot-1, slider-dot-2, slider-dot-3
  
    // Używamy tylko oryginalnych kart – nie tworzymy żadnych klonów
    let slides = originalSlides; 
    sliderContainer.innerHTML = "";
    slides.forEach(slide => sliderContainer.appendChild(slide));
  
    // --- 2) Stan podstawowy
    // Indeksy: 0 = Card1, 1 = Card2, 2 = Card3.
    // Ustawiamy currentIndex początkowo na 0 (Card1 widoczna)
    let currentIndex = 0;
    let autoplayInterval = null;
    let isInView = false; // IntersectionObserver
    let totalRealSlides = slides.length; // 3
    let userInteracted = false; // gdy true, wyłączamy autoplay
  
    // --- 3) Stylowanie początkowe (pozycja i opacity)
    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = "0";
      slide.style.left = "0";
      slide.style.width = "100%";
      slide.style.transition = "none";
      // Ustawiamy transformację: aktywna karta (i == currentIndex) ma translateX(0%), kolejne +100%, poprzednie -100%
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
  
    // --- 4) Aktualizacja kropek – aktywna kropka odpowiada currentIndex
    updateDots(currentIndex);
  
    // --- 5) Funkcja główna: goToSlide(realIndex)
    // realIndex – docelowy indeks w zakresie [0, slideCount-1]
    function goToSlide(realIndex) {
      userInteracted = true;
      clearInterval(autoplayInterval);
      // Jeśli ruch dotyczący przejścia zamkniętego wymaga animacji przejścia „poza zakresem”,
      // wykorzystamy tymczasowo currentIndex poza zakresem, a po animacji przeskoczymy (jumpWithoutAnimation).
      // Jeśli przejście jest "normalne", ustawiamy currentIndex bezpośrednio.
      // Przykładowo: jeśli jesteśmy na karcie 2 (index 1) i chcemy przejść do karty 1 (index 0) – to normalnie.
      // Ale jeśli jesteśmy na karcie 3 (index 2) i klikamy dot dla karty 1 (real index 0),
      // chcemy, aby animacja przebiegła tak, że karta 1 wjedzie z lewej.
      if (realIndex === 0 && currentIndex === totalRealSlides - 1) {
        // Z karty 3 (index 2) do karty 1 – ustawiamy tymczasowo currentIndex = 3
        currentIndex = totalRealSlides; // 3
        animateSlides();
        // Po zakończeniu animacji natychmiast skaczemy do indeksu 0
        setTimeout(() => {
          jumpWithoutAnimation(0);
        }, parseFloat(getTransition().match(/0\.\d+s/)[0]) * 1000);
      } else if (realIndex === totalRealSlides - 1 && currentIndex === 0) {
        // Z karty 1 do karty 3 – ustawiamy tymczasowo currentIndex = -1
        currentIndex = -1;
        animateSlides();
        setTimeout(() => {
          jumpWithoutAnimation(totalRealSlides - 1);
        }, parseFloat(getTransition().match(/0\.\d+s/)[0]) * 1000);
      } else {
        // Normalna zmiana: ustawiamy currentIndex = realIndex
        currentIndex = realIndex;
        animateSlides();
      }
      updateDots(realIndex);
    }
  
    // --- 6) Obsługa kliknięć w kropki
    if (dots && dots.length > 0) {
      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
        });
      });
    }
  
    // --- 7) Funkcje nextSlide i prevSlide (dla autoplay lub swipe)
    function nextSlide() {
      // Jeśli przejście z ostatniej karty do pierwszej:
      if (currentIndex === totalRealSlides - 1) {
        currentIndex = totalRealSlides; // tymczasowo ustawiamy na 3 (poza zakresem realnym)
        animateSlides();
        setTimeout(() => {
          jumpWithoutAnimation(0);
        }, parseFloat(getTransition().match(/0\.\d+s/)[0]) * 1000);
      } else {
        currentIndex++;
        animateSlides();
      }
      updateDots(currentIndex % totalRealSlides);
    }
    function prevSlide() {
      // Jeśli przejście z pierwszej karty do ostatniej:
      if (currentIndex === 0) {
        currentIndex = -1; // tymczasowo ustawiamy na -1
        animateSlides();
        setTimeout(() => {
          jumpWithoutAnimation(totalRealSlides - 1);
        }, parseFloat(getTransition().match(/0\.\d+s/)[0]) * 1000);
      } else {
        currentIndex--;
        animateSlides();
      }
      updateDots((currentIndex + totalRealSlides) % totalRealSlides);
    }
    function animateSlides() {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
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
    }
  
    // --- 8) AUTOPLAY
    function autoplay() {
      autoplayInterval = setInterval(() => {
        if (isInView && !userInteracted) {
          nextSlide();
        }
      }, 7000);
    }
  
    // --- 9) INTERSECTION OBSERVER
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
  
    // --- 10) HANDLE RESIZE
    function handleResize() {
      animateSlides();
    }
  
    // --- 11) OBSŁUGA USUWANIA KLONÓW (tutaj nie mamy klonów w DOM, więc nie robimy nic)
    // W tym podejściu nie używamy klonów – closed loop od początku.
    function removeClones() {
      // Nie trzeba nic usuwać – nasza tablica slides zawiera już tylko 3 realne karty.
      // Ustawiamy flagę, aby dalsza logika działała na 3 kartach.
    }
  
    // --- 12) INICJACJA
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
          // Swipe w lewo – jeśli obecnie jesteśmy na ostatniej karcie (index 2), cel = 0
          targetRealIndex = (currentIndex === totalRealSlides - 1) ? 0 : currentIndex + 1;
        } else {
          // Swipe w prawo – jeśli obecnie jesteśmy na pierwszej karcie (index 0), cel = 2
          targetRealIndex = (currentIndex === 0) ? totalRealSlides - 1 : currentIndex - 1;
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