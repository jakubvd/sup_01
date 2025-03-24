document.addEventListener("DOMContentLoaded", function () {
    const bottomRow = document.querySelector(".logo-slider-bottom-row");

    if (bottomRow) {
      const totalWidth = bottomRow.scrollWidth / 2;

      // Set starting x position to the left (so animation can go right smoothly)
      gsap.set(bottomRow, {
        x: -totalWidth
      });

      // Animate to the right
      gsap.to(bottomRow, {
        x: 0,
        duration: 30, // Adjust for slower or faster scroll
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
        }
      });
    }
  });