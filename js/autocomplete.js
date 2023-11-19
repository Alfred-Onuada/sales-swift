function initializeAutoComplete() {
  function showAutoCompletion(input, val, autocompleteOptions, type) {
    /*close any already open lists of autocompleted values*/
    closeAllLists();

    if (!val) { return false;}

    const options = Object.keys(autocompleteOptions);

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

    for (let i = 0; i < options.length; i++) {
      const b = document.createElement("DIV");
      b.innerHTML = highlightMatch(makeIntialsCapital(autocompleteOptions[options[i]].address));
      b.dataset.name = makeIntialsCapital(autocompleteOptions[options[i]].address);
      
      // container is for an address that contains sub addresses
      if (type == "container") {
        b.innerHTML += ` - <span class="extra-address-text">${autocompleteOptions[options[i]].count} addresses</span><span class="fa-solid fa-angle-right angle-right-search"></span>`;
        b.dataset.id = options[i];

        b.addEventListener("click", function(e) {
          input.value = this.dataset.name;
          closeAllLists();
          
          searchAddressInContainer(this.dataset.id);
        })
      } else {
        b.dataset.id = autocompleteOptions[options[i]].uprn;
  
        b.addEventListener("click", function(e) {
          input.value = this.dataset.name;
          closeAllLists();
          
          window.location.href = `pages/add-property.html?id=${encodeURIComponent(this.dataset.id)}`
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

  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  function getAddressesInPostcode(postcodes) {
    return new Promise(async (resolve, reject) => {
      try {
        // this receives and object of the following format { "postcode": { "count": 0, "address": "str" } }
        const postcodesArray = Object.keys(postcodes);
    
        // make 6 requests at a time to the postcodeAPIUrl and update the count
        const postcodeAPIUrl = "https://api.os.uk/search/places/v1/postcode?key=uY7Jn1XGF95U6w9FzySvGlgI4RmYr38l&format=JSON&maxresults=10&postcode="
    
        const promises = [];
    
        for (let i = 0; i < postcodesArray.length; i++) {
          const postcode = postcodesArray[i];
          const url = postcodeAPIUrl + postcode;
    
          promises.push(fetch(url));
        }
    
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(resp => resp.json()));
  
        data.forEach((postcodeData, index) => {
          const postcode = postcodesArray[index];
          const addressCount = postcodeData.header.totalresults;
  
          postcodes[postcode].count = addressCount;
        });
  
        resolve(postcodes);
      } catch (error) {
        console.log(error);
        resolve();
      }
    })
  }

  async function getPostcodeAndAddressCount(data) {
    // extract the unique postcodes to emulate what loqate does 
    const postcodes = data.results.map(result => ({ [result.DPA.POSTCODE]: { address: result.DPA.ADDRESS, count: 0, uprn: result.DPA.UPRN } }));
    const uniquePostcodes = {};

    postcodes.forEach(postcode => {
      const postcodeKey = Object.keys(postcode)[0];

      if (uniquePostcodes.hasOwnProperty(postcodeKey) == false) {
        uniquePostcodes[postcodeKey] = postcode[postcodeKey];
      }
    });

    // get the address count for each
    const postcodeAndAddressCount = await getAddressesInPostcode(uniquePostcodes);

    return postcodeAndAddressCount;
  }

  async function searchLocation(input) {
    try {
      const findApiUrl = "https://api.os.uk/search/places/v1/find?key=uY7Jn1XGF95U6w9FzySvGlgI4RmYr38l&format=JSON&maxresults=10";

      const searchTerm = input.value;
      const resp = await fetch(`${findApiUrl}&query=${searchTerm}`);
      const data = await resp.json();

      // to prevent old queries from calling this
      if (input.value === searchTerm) {
        const postcodeAndAddressCount = await getPostcodeAndAddressCount(data);

        showAutoCompletion(input, searchTerm, postcodeAndAddressCount, "container");
      }
    } catch (error) {
      showAutoCompletion(input, searchTerm, []);
    }
  }

  async function searchAddressInContainer(postcode) {
    try {
      const postcodeApiUrl = "https://api.os.uk/search/places/v1/postcode?key=uY7Jn1XGF95U6w9FzySvGlgI4RmYr38l&format=JSON&maxresults=100";

      const resp = await fetch(`${postcodeApiUrl}&postcode=${postcode}`);
      const data = await resp.json();

      const suggestions = {};
      data.results.forEach(result => {
        suggestions[result.DPA.UPRN] = { address: result.DPA.ADDRESS, uprn: result.DPA.UPRN };
      });

      showAutoCompletion(input, postcode, suggestions, "address");
    } catch (error) {
      showAutoCompletion(input, postcode, []);
    }
  }

  const input = document.getElementById('postcode-search');
  const searchBtn = document.getElementById('search-btn');

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