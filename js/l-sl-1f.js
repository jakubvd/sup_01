document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left', duration = 60, cloneCount = 10) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const logos = Array.from(row.children);
  
      // Clone the logos N times for seamless infinite-like scrolling
      for (let i = 0; i < cloneCount; i++) {
        const clones = logos.map(logo => logo.cloneNode(true));
        clones.forEach(clone => row.appendChild(clone));
      }
  
      // Recalculate total width after all clones
      const loopWidth = logos.reduce((acc, el) => acc + el.offsetWidth + 40, 0); // 40px gap
      const totalLoopWidth = loopWidth * cloneCount;
  
      // Set initial position
      const startX = direction === 'left' ? 0 : -totalLoopWidth;
      const endX = direction === 'left' ? -totalLoopWidth : 0;
  
      gsap.set(row, { x: startX });
  
      // Create timeline
      const tl = gsap.to(row, {
        x: endX,
        duration: duration,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => {
            const mod = parseFloat(x) % totalLoopWidth;
            return direction === "left" ? mod : mod - totalLoopWidth;
          })
        }
      });
  
      return tl;
    }
  
    function observeAndAnimate(selector, direction = 'left', duration = 60, cloneCount = 10) {
      const row = document.querySelector(selector);
      if (!row) return;
  
      let timeline;
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!timeline) {
              timeline = animateLogoRow(selector, direction, duration, cloneCount);
            } else {
              timeline.play();
            }
          } else {
            if (timeline) timeline.pause();
          }
        });
      }, {
        root: null,
        threshold: 0.05
      });
  
      observer.observe(row);
    }
  
    // Trigger animations when visible
    observeAndAnimate(".logo-slider-top-row", "left", 30, 10);
    observeAndAnimate(".logo-slider-bottom-row", "right", 30, 10);
  });