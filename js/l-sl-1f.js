document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      // Store only the original logos (before cloning)
      const originalLogos = Array.from(row.children);
  
      // Clone the original logos 10 times
      for (let i = 0; i < 10; i++) {
        originalLogos.forEach(logo => {
          const clone = logo.cloneNode(true);
          row.appendChild(clone);
        });
      }
  
      // Calculate total width of the original set of logos
      const loopWidth = originalLogos.reduce((acc, el) => acc + el.offsetWidth, 0);
  
      // Set initial position based on direction
      const startX = direction === 'left' ? 0 : -loopWidth;
      const endX = direction === 'left' ? -loopWidth : 0;
  
      gsap.set(row, { x: startX });
  
      gsap.to(row, {
        x: endX,
        duration: duration,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => {
            const mod = parseFloat(x) % loopWidth;
            return direction === "left" ? mod : mod - loopWidth;
          })
        }
      });
    }
  
    function observeAndAnimate(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateLogoRow(selector, direction, duration);
            observer.unobserve(entry.target); // Run only once
          }
        });
      }, {
        root: null,
        threshold: 0.05 // Trigger when 5% visible
      });
  
      observer.observe(row);
    }
  
    // Trigger animations when in view
    observeAndAnimate(".logo-slider-top-row", "left", 30);
    observeAndAnimate(".logo-slider-bottom-row", "right", 30);
  });