document.addEventListener("DOMContentLoaded", function () {
    // Create the loop
    function createSeamlessLoop(rowSelector, direction = 'left', duration = 30) {
      const row = document.querySelector(rowSelector);
      if (!row) return;
  
      const logos = Array.from(row.children);
      if (logos.length === 0) return;
  
      // Clone and add spacer
      const spacer = document.createElement("div");
      spacer.classList.add("img-wrap");
      spacer.style.width = "40px";
      spacer.style.minWidth = "40px";
      spacer.style.height = "1px";
      spacer.style.flexShrink = "0";
  
      // Clone all logos
      const clones = logos.map(logo => logo.cloneNode(true));
      const clonesWithGap = [spacer, ...clones];
  
      // Append to row
      clonesWithGap.forEach(clone => row.appendChild(clone));
  
      // Calculate width
      const loopWidth = Array.from(logos).reduce((acc, el) => acc + el.offsetWidth, 0) + 40;
  
      // Initial position
      const startX = direction === "left" ? 0 : -loopWidth;
      const endX = direction === "left" ? -loopWidth : 0;
  
      // Set initial position
      gsap.set(row, { x: startX });
  
      // Animate
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
  
    // Lazy-load animation trigger
    function initOnView(containerSelector, topSelector, bottomSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;
  
      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              createSeamlessLoop(topSelector, "left", 30);
              createSeamlessLoop(bottomSelector, "right", 30);
              observer.disconnect(); // Run only once
            }
          });
        },
        {
          root: null,
          threshold: 0.05 // Trigger when 5% visible
        }
      );
  
      observer.observe(container);
    }
  
    // Start observer
    initOnView(
      ".logo-slider-ver-PL", // parent
      ".logo-slider-top-row", // top row
      ".logo-slider-bottom-row" // bottom row
    );
  });