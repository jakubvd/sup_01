function geoip(json) {
    void json; // void data
  
    const plElement = document.getElementById('logo-slider-ver-PL');
    const euElement = document.getElementById('logo-slider-ver-EU');
  
    if (!plElement || !euElement) {
      // Optional: silently fail without showing error in browser
      return;
    }
  
    // Hide both initially — to avoid double rendering
    plElement.classList.remove('is-visible');
    euElement.classList.remove('is-visible');
  
    // Add correct version dynamically
    if (json.country_code === 'PL') {
      plElement.classList.add('is-visible');
    } else {
      euElement.classList.add('is-visible');
    }
  }