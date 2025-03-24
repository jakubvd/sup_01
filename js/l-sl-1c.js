document.addEventListener("DOMContentLoaded", function () {
    function animateLogoRow(selector, direction = 'left') {
      const row = document.querySelector(selector);
      if (!row) return;
  
      const logos = Array.from(row.children);
      const spacer = document.createElement('div');
      spacer.classList.add('img-wrap');
      spacer.style.width = '40px';
      spacer.style.minWidth = '40px';
      spacer.style.height = '1px'; // keeps it invisible
      spacer.style.flexShrink = '0';
  
      // Duplicate logos and insert spacer
      const cloned = logos.map(logo => logo.cloneNode(true));
      row.appendChild(spacer); // spacer between sets
      cloned.forEach(clone => row.appendChild(clone));
  
      const totalWidth = row.scrollWidth / 2;
  
      gsap.set(row, {
        x: direction === 'left' ? 0 : -totalWidth
      });
  
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