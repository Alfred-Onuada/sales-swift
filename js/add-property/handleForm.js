async function beginFormProcessing() {
  try {
    const retrieveApiUrl = "https://api.addressy.com/Capture/Interactive/Retrieve/v1.2/json3ex.ws"
    const access_token = "FY37-ZU98-DA44-DA26";
  
    const currentLocationSpan = document.getElementsByClassName('currentLocation');
    const currentLocationFromUrl = decodeURI(window.location.search.replace('?id=', ''));
  
    const resp = await fetch(`${retrieveApiUrl}?Key=${encodeURIComponent(access_token)}&Id=${encodeURIComponent(currentLocationFromUrl)}`);
    const data = await resp.json();

    console.log(data)
  
    if (currentLocationFromUrl) {
      [].forEach.call(currentLocationSpan, function (el) {
        el.innerHTML = data.Items[0].Label;
      });
    }
  } catch (error) {
    alert('Something went wrong, please try reload the page and try again');
  }
}

document.addEventListener('DOMContentLoaded', beginFormProcessing);