function animateLogoRow(rowSelector, direction = 'left') {
    const row = document.querySelector(rowSelector);
    const totalWidth = row.scrollWidth / 2;

    gsap.to(row, {
      x: direction === 'left' ? -totalWidth : totalWidth,
      duration: 30,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    animateLogoRow(".logo-slider-top-row", "left");
    animateLogoRow(".logo-slider-bottom-row", "right");
  });