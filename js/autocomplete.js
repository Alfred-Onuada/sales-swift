function initializeAutoComplete() {
  // THIS IS A PRE-WRITTEN FUNCTION  
  function showAutoCompletion(input, val, options) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/

    let currentFocus;

    /*close any already open lists of autocompleted values*/
    closeAllLists();

    if (!val) { return false;}

    currentFocus = -1;

    /*create a DIV element that will contain the items (values):*/
    const a = document.createElement("DIV");
    a.setAttribute("class", "autocomplete-items");

    /*append the DIV element as a child of the autocomplete container:*/
    document.getElementById('autocomplete-parent').appendChild(a);

    // Check for no results
    if (options.length === 0) {
      const b = document.createElement("DIV");
      b.innerHTML = "No results found";
      a.appendChild(b);
    }

    for (i = 0; i < options.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (options[i].place_name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        const b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + options[i].place_name.substr(0, val.length) + "</strong>";
        b.innerHTML += options[i].place_name.substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + options[i].postcode + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            input.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();

            // MOVE TO THE NEXT PAGE
            window.location.href = `/add-property.html?postcode=${input.value}`;
        });
        a.appendChild(b);
      }
    }

    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != input) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  }
  // END OF PRE-WRITTEN FUNCTION

  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  async function searchPostcode(input) {
    try {
      const searchTerm = input.value;
      const resp = await fetch(`${mapboxUrl}/${searchTerm}.json?access_token=${access_token}`);
      const data = await resp.json();

      const suggestions = data.features
      .filter(option => option.context.find(ctx => ctx.text.includes('United Kingdom')))
      .map(option => ({ place_name: option.place_name, postcode: option.text }));

      showAutoCompletion(input, searchTerm, suggestions);
    } catch (error) {
      showAutoCompletion(input, searchTerm, []);
    }
  }

  const input = document.getElementById('postcode-search');
  const searchBtn = document.getElementById('search-btn');
  const access_token = "pk.eyJ1IjoiYWxmcmVkb251YWRhIiwiYSI6ImNsbzRncGlyZTAyMmcyaXFkbHZweTM2cTcifQ.cmtWXyEPgIXZTdH1ltzx0g";
  const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places`

  if (input) {
    input.addEventListener('keyup', () => debounce(searchPostcode(input), 500));
    searchBtn.addEventListener('click', () => debounce(searchPostcode(input), 0));
  }
}

document.addEventListener('DOMContentLoaded', initializeAutoComplete());


function focusInputDiv() {
  document.getElementById('myTabContent').scrollIntoView();
  document.getElementById('postcode-search').focus()
  document.getElementById('myTabContent').classList.add("pulse")

  setTimeout(() => {
    document.getElementById('myTabContent').classList.remove("pulse")
  }, 2100);
}