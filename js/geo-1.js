function geoip(json) {
    if (!json || !json.country_code) return;
  
    const plElement = document.getElementById('logo-slider-ver-PL');
    const euElement = document.getElementById('logo-slider-ver-EU');
  
    if (!plElement || !euElement) return;
  
    plElement.classList.remove('is-visible');
    euElement.classList.remove('is-visible');
  
    if (json.country_code === 'PL') {
      plElement.classList.add('is-visible');
    } else {
      euElement.classList.add('is-visible');
    }
  }