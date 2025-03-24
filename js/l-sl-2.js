document.addEventListener("DOMContentLoaded", () => {
    function createSeamlessLoop({ rowSelector, direction = 'left', speed = 40 }) {
      const row = document.querySelector(rowSelector);
      if (!row) return;
  
      const logos = Array.from(row.children);
      if (logos.length === 0) return;
  
      // Add 40px spacer between original and cloned set
      const spacer = document.createElement('div');
      spacer.classList.add('img-wrap');
      spacer.style.minWidth = '40px';
      spacer.style.height = '1px';
      spacer.style.flexShrink = '0';
      row.appendChild(spacer);
  
      // Clone original logos
      const clones = logos.map(logo => logo.cloneNode(true));
      clones.forEach(clone => row.appendChild(clone));
  
      // Calculate scroll distance (original set + spacer)
      const loopWidth = row.scrollWidth / 2 + 40;
  
      // GSAP animation
      gsap.set(row, {
        x: direction === 'left' ? 0 : -loopWidth
      });
  
      gsap.to(row, {
        x: direction === 'left' ? -loopWidth : 0,
        duration: speed,
        ease: 'none',
        repeat: -1,
        onRepeat: () => {
          gsap.set(row, { x: direction === 'left' ? 0 : -loopWidth });
        }
      });
    }
  
    function initOnView() {
      const container = document.querySelector('.logo-slider-ver-PL');
      if (!container) return;
  
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            createSeamlessLoop({
              rowSelector: '.logo-slider-top-row',
              direction: 'left',
              speed: 60
            });
  
            createSeamlessLoop({
              rowSelector: '.logo-slider-bottom-row',
              direction: 'right',
              speed: 60
            });
  
            observer.disconnect(); // Only trigger once
          }
        });
      }, {
        root: null,
        threshold: 0.05
      });
  
      observer.observe(container);
    }
  
    initOnView();
  });