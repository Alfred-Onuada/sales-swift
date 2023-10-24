function beginFormProcessing() {
  const currentLocationSpan = document.getElementById('currentLocation');
  const currentLocationFromUrl = decodeURI(window.location.search.replace('?postcode=', ''));

  if (currentLocationFromUrl) {
    currentLocationSpan.textContent = currentLocationFromUrl;
  }
}

document.addEventListener('DOMContentLoaded', beginFormProcessing);