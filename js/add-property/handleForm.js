function beginFormProcessing() {
  const currentLocationSpan = document.getElementsByClassName('currentLocation');
  const currentLocationFromUrl = decodeURI(window.location.search.replace('?postcode=', ''));

  if (currentLocationFromUrl) {
    [].forEach.call(currentLocationSpan, function (el) {
      el.innerHTML = currentLocationFromUrl;
    });
  }
}

document.addEventListener('DOMContentLoaded', beginFormProcessing);