function geoip(json) {
    console.log('🌍 Geo data:', json);

    document.addEventListener('DOMContentLoaded', function () {
      const plElement = document.getElementById('logo-slider-ver-PL');
      const euElement = document.getElementById('logo-slider-ver-EU');

      if (!plElement || !euElement) {
        console.error('⚠️ Logo slider elements not found.');
        return;
      }

      if (json.country_code === 'PL') {
        plElement.classList.add('is-visible');
        euElement.classList.remove('is-visible');
      } else {
        euElement.classList.add('is-visible');
        plElement.classList.remove('is-visible');
      }
    });
  }