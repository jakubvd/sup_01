document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left') {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const totalWidth = row.scrollWidth / 2;
  
      // Set starting position based on direction
      gsap.set(row, {
        x: direction === 'left' ? 0 : -totalWidth
      });
  
      // Animate
      gsap.to(row, {
        x: direction === 'left' ? -totalWidth : 0,
        duration: 60,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
        }
      });
    }
  
    // Animate both rows
    animateLogoRow(".logo-slider-top-row", "left");
    animateLogoRow(".logo-slider-bottom-row", "right");
  });