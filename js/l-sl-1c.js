document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60) {
      const row = document.querySelector(selector);
      if (!row) return;

      const logos = Array.from(row.children);

      // Create 40px spacer div
      const spacer = document.createElement('div');
      spacer.classList.add('img-wrap');
      spacer.style.width = '40px';
      spacer.style.minWidth = '40px';
      spacer.style.height = '1px';
      spacer.style.flexShrink = '0';

      // Clone logos
      const cloned = logos.map(logo => logo.cloneNode(true));

      // Append spacer first, then cloned logos
      row.appendChild(spacer);
      cloned.forEach(clone => row.appendChild(clone));

      // Calculate full loop width including spacer
      const totalWidth = row.scrollWidth / 2 + 40;

      // Set initial position
      const startX = direction === 'left' ? 0 : -totalWidth;
      const endX = direction === 'left' ? -totalWidth : 0;

      gsap.set(row, { x: startX });

      gsap.to(row, {
        x: endX,
        duration: duration,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
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
        threshold: 0.05 // Trigger when 5% visible
      });

      observer.observe(row);
    }

    // Animate both rows only when visible
    observeAndAnimate(".logo-slider-top-row", "left", 10);
    observeAndAnimate(".logo-slider-bottom-row", "right", 10);
});