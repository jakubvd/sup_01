document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const logos = Array.from(row.children);
  
      const cloned = logos.map(logo => logo.cloneNode(true));
  
      cloned.forEach(clone => row.appendChild(clone));
  
      // Calculate total width of original logos
      const loopWidth = logos.reduce((acc, el) => acc + el.offsetWidth, 0);
  
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
        threshold: 0.05
      });
  
      observer.observe(row);
    }
  
    // Trigger animations when in view
    observeAndAnimate(".logo-slider-top-row", "left", 30);
    observeAndAnimate(".logo-slider-bottom-row", "right", 30);
  });