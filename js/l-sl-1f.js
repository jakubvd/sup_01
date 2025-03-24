document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const logos = Array.from(row.children);
  
      // ✅ Clone 10x
      for (let i = 0; i < 10; i++) {
        const cloned = logos.map(logo => logo.cloneNode(true));
        cloned.forEach(clone => row.appendChild(clone));
      }
  
      // Measure width of original logos only
      const loopWidth = logos.reduce((acc, el) => acc + el.offsetWidth, 0);
  
      // Animate
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
            observer.unobserve(entry.target); // Run once
          }
        });
      }, {
        root: null,
        threshold: 0.05
      });
  
      observer.observe(row);
    }
  
    // Start animation for both rows
    observeAndAnimate(".logo-slider-top-row", "left", 30);
    observeAndAnimate(".logo-slider-bottom-row", "right", 30);
  });