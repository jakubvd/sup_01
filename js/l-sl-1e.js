document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;

      const logos = Array.from(row.children);

      for (let i = 0; i < 10; i++) {
        const cloned = logos.map(logo => logo.cloneNode(true));
        cloned.forEach(clone => row.appendChild(clone));
      }

      // Calculate total width of original logos
      const loopWidth = logos.reduce((acc, el) => acc + el.offsetWidth, 0);

      // Set initial position based on direction
      const startX = direction === 'left' ? 0 : -loopWidth;
      const endX = direction === 'left' ? -loopWidth : 0;

      gsap.set(row, { x: startX });

      const tl = gsap.timeline({ repeat: -1, paused: true });
      tl.to(row, {
        x: endX,
        duration: duration,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize(x => {
            const mod = parseFloat(x) % loopWidth;
            return direction === "left" ? mod : mod - loopWidth;
          })
        }
      });

      return tl;
    }

    function observeAndAnimate(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;

      const tl = animateLogoRow(selector, direction, duration);

      const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tl.play();
          } else {
            tl.pause();
          }
        });
      }, {
        root: null,
        threshold: 0.05
      });

      visibilityObserver.observe(row);
    }

    // Trigger animations when in view
    observeAndAnimate(".logo-slider-top-row", "left", 30);
    observeAndAnimate(".logo-slider-bottom-row", "right", 30);
});