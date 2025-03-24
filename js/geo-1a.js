function geoip(json) {
    // Get PL and EU slider containers by ID
    const plElement = document.getElementById('logo-slider-ver-PL');
    const euElement = document.getElementById('logo-slider-ver-EU');

    if (!plElement || !euElement) {
      console.error('⚠️ Logo slider elements not found.');
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