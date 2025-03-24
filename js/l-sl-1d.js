document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const logos = Array.from(row.children);
  
      // Clone logos and add 40px spacer between original and clones
      const spacer = document.createElement('div');
      spacer.classList.add('img-wrap');
      spacer.style.width = '40px';
      spacer.style.minWidth = '40px';
      spacer.style.height = '1px';
      spacer.style.flexShrink = '0';
  
      const cloned = logos.map(logo => logo.cloneNode(true));
  
      // Append spacer and cloned logos
      row.appendChild(spacer);
      cloned.forEach(clone => row.appendChild(clone));
  
      // Calculate total width of original logos + spacer
      const loopWidth = logos.reduce((acc, el) => acc + el.offsetWidth, 0) + 40;
  
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