function initializeAutoComplete() {
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

    function makeIntialsCapital(str) {
      const matches = str.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/g)
      const postcode = matches ? matches[0] : "";

      // remove postcode from string
      str = str.replace(postcode, "");

      return str
        .trim()
        .toLowerCase()
        .split(" ")
        .map(e => e[0].toUpperCase() + e.slice(1))
        .join(" ")
        .concat(" " + postcode);
    }

    for (i = 0; i < options.length; i++) {
      const b = document.createElement("DIV");
      b.innerHTML = highlightMatch(makeIntialsCapital(options[i].ADDRESS));
      b.dataset.name = makeIntialsCapital(options[i].ADDRESS);
      b.dataset.id = options[i].UPRN;

      b.addEventListener("click", function(e) {
        input.value = this.dataset.name;
        closeAllLists();
        
        window.location.href = `pages/add-property.html?id=${encodeURIComponent(this.dataset.id)}`
      })

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

  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  async function searchLocation(input) {
    try {
      const searchTerm = input.value;
      const resp = await fetch(`${findApiUrl}&query=${searchTerm}`);
      const data = await resp.json();

      const suggestions = data.results.map(result => result.DPA);

      showAutoCompletion(input, searchTerm, suggestions);
    } catch (error) {
      showAutoCompletion(input, searchTerm, []);
    }
  }

  const input = document.getElementById('postcode-search');
  const searchBtn = document.getElementById('search-btn');
  const findApiUrl = "https://api.os.uk/search/places/v1/find?key=K3zVR0BhE9ADVPAEjXJBBeTeIKL0PFyT&format=JSON&maxresults=10";

  if (input) {
    input.addEventListener('keyup', () => debounce(searchLocation(input), 500));
    searchBtn.addEventListener('click', () => debounce(searchLocation(input), 0));
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