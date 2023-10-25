function initializeAutoComplete() {
  // THIS IS A PRE-WRITTEN FUNCTION  
  function showAutoCompletion(input, val, options) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/

    /*close any already open lists of autocompleted values*/
    closeAllLists();

    if (!val) { return false;}

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

    function highlightMatch(str) {
      return str.replace(new RegExp(val, "gi"), (match) => `<strong>${match}</strong>`);
    }

    for (i = 0; i < options.length; i++) {
      const b = document.createElement("DIV");
      b.innerHTML = highlightMatch(options[i].Text);
      b.dataset.name = options[i].Text;
      b.dataset.id = options[i].Id;

      if (options[i].Type != 'Address') {
        b.innerHTML += `<span class="extra-address-text">${options[i].Description}</span><span class="fa-solid fa-angle-right angle-right-search"></span>`;
        b.addEventListener("click", function(e) {
          closeAllLists();

          getAddresses(this.dataset.id);
        })
      } else {
        b.addEventListener("click", function(e) {
          input.value = this.dataset.name;
          closeAllLists();
          
          window.location.assign(`/pages/add-property.html?id=${encodeURIComponent(this.dataset.id)}`);
        })
      }

      a.appendChild(b);
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

  async function getAddresses(containerId) {
    try {
      const searchTerm = input.value;
      const resp = await fetch(`${findApiUrl}?Key=${encodeURIComponent(access_token)}&Text=${encodeURIComponent(searchTerm)}&Language=en-gb&Origin=GBR&Countries=GBR&Container=${encodeURIComponent(containerId)}`);
      const data = await resp.json();

      const suggestions = data.Items;

      showAutoCompletion(input, searchTerm, suggestions);
    } catch (error) {
      showAutoCompletion(input, searchTerm, []);
    }
  }

  async function searchPostcode(input) {
    try {
      const searchTerm = input.value;
      const resp = await fetch(`${findApiUrl}?Key=${encodeURIComponent(access_token)}&Text=${encodeURIComponent(searchTerm)}&Language=en-gb&Limit=10&Origin=GBR&Countries=GBR`);
      const data = await resp.json();

      const suggestions = data.Items;

      showAutoCompletion(input, searchTerm, suggestions);
    } catch (error) {
      showAutoCompletion(input, searchTerm, []);
    }
  }

  const input = document.getElementById('postcode-search');
  const searchBtn = document.getElementById('search-btn');
  const access_token = "FY37-ZU98-DA44-DA26";
  const findApiUrl = "https://api.addressy.com/Capture/Interactive/Find/v1.1/json3ex.ws"

  if (input) {
    input.addEventListener('keyup', () => debounce(searchPostcode(input), 500));
    searchBtn.addEventListener('click', () => debounce(searchPostcode(input), 0));
  }
}

document.addEventListener('DOMContentLoaded', initializeAutoComplete());


function focusInputDiv() {
  document.getElementById('scrollPoint').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('postcode-search').focus()
  document.getElementById('myTabContent').classList.add("pulse")

  setTimeout(() => {
    document.getElementById('myTabContent').classList.remove("pulse")
  }, 2100);
}