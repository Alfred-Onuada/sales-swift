/**
 * provides a handy way to add a custom event listener for when an element's innerHTML changes
 * @param {HTMLElement} element 
 * @param {string} attribute 
 * @param {Function} callbackFunc 
 * @returns 
 */
function listenForChanges(element, attribute, callbackFunc) {
  // Create a MutationObserver instance
  const observer = new MutationObserver(function(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.target === element) {
        // Child list has changed (innerHTML change)
        let newValue = element[attribute];

        // Call the callback function with the new value
        callbackFunc(newValue);
      }
    }
  });

  // Configure the observer to watch for child list changes
  const config = { childList: true };

  // Start observing the target element
  observer.observe(element, config);

  // Return the observer so it can be disconnected later if needed
  return observer;
}

async function beginFormProcessing() {
  try {
    const retrieveApiUrl = "https://api.os.uk/search/places/v1/uprn?key=uY7Jn1XGF95U6w9FzySvGlgI4RmYr38l&format=JSON"

    const currentLocationSpan = document.getElementsByClassName('currentLocation');
    const currentLocationFromUrl = decodeURI(window.location.search.replace('?id=', ''));

    // const resp = await fetch(`${retrieveApiUrl}&uprn=${currentLocationFromUrl}`);
    // const data = await resp.json();

    // if (currentLocationFromUrl) {
    //   [].forEach.call(currentLocationSpan, function (el) {
    //     el.innerHTML = makeIntialsCapital(data.results[0].DPA.ADDRESS);
    //   });
    // }

    const allData = {};

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

    // updates the data object
    function updateAllData(data) {
      Object.assign(allData, data);
    }

    // gets the fields from the form
    function getFormFields(neededFields) {
      const fields = {};

      Object.keys(neededFields).forEach(function (key) {
        let value = null;
        if (neededFields[key] === 'array') {
          value = getValueOfMultipleSelect(document.querySelector(`[name="${key}"]`));
        } else {
          value = document.querySelector(`[name="${key}"]`).value;
        }

        fields[key] = value;
      });

      return fields;
    }

    function showError(parentElement, message) {
      const el = document.createElement('h5');
      el.textContent = message;
      el.classList.add('error-text');
      
      // this makes sure it shows as a block element
      if (parentElement.classList.contains('flex')) {
        parentElement = parentElement.parentElement;
      }

      if (parentElement.querySelector('.error-text') == null) {
        parentElement.appendChild(el);

        setTimeout(function () {
          parentElement.removeChild(el);
        }, 3000);
      }
    }

    // checks that the fields are present
    function checkCompleteness(fields, neededFields) {
      const incompleteFields = Object.keys(neededFields).filter(function (key) {
        return !fields.hasOwnProperty(key) || (fields[key] === '' && fields[key].length === 0);
      });

      if (incompleteFields.length > 0) {
        // create a h5 with the error for each field
        incompleteFields.forEach(field => {
          const parent = document.querySelector(`[name="${field}"]`).parentElement;
          const message = `${field.replace(/\-/g, " ")} is required`;
          showError(parent, message);
        })
        return false;
      }

      return true;
    }

    function checkValidity(fields, neededFields) {
      const invalidFields = Object.keys(neededFields).filter(function (key) {
        const value = fields[key];
        const type = neededFields[key];

        if (type === 'string' && typeof value !== 'string') {
          return true;
        }

        if (type === 'phone' && (!value.replace(/\s/g, "").match(/^\d{11}/) || !value.replace(/\s/g, "").match(/^\d+$/))) {
          return true;
        }

        if (type === 'email' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return true;
        }

        if (type === 'array' && (!Array.isArray(value) || value.length === 0)) {
          return true;
        }

        return false;
      });

      if (invalidFields.length > 0) {
        // create a h5 with the error for each field
        invalidFields.forEach(field => {
          const parent = document.querySelector(`[name="${field}"]`).parentElement;
          const message = `${field.replace(/\-/g, " ")} is invalid`;
          showError(parent, message);
        })
        return false;
      }

      return true;
    }

    function getValueOfMultipleSelect(select) {
      return JSON.parse(select.value || "[]").map(obj => obj.value);
    } 

    const firstStepBtn = document.getElementById('first-step');
    const secondStepBtn = document.getElementById('btn-second-step');
    const thirdStepBtn = document.getElementById('third-step');
    const fourthStepBtn = document.getElementById('fourth-step');
    const fifthStepBtn = document.getElementById('fifth-step');

    firstStepBtn.addEventListener('click', function (e) {
      const neededFields = {
        'first-name': 'string',
        'last-name': 'string',
        'phone': 'phone',
        'email': 'email'
      }
      const fields = getFormFields(neededFields);
      const fieldsAreComplete = checkCompleteness(fields, neededFields);
      const fieldsAreValid = checkValidity(fields, neededFields);

      if (fieldsAreComplete == false || fieldsAreValid == false) {
        return;
      }

      updateAllData(fields);
      firstStepBtn.parentElement.querySelector('.next-step').click();
    })

    // Begin second step constrols
    function secondStepControls() {
      const topMenuElems = document.getElementsByClassName('top-radio-controls');
      [].forEach.call(topMenuElems, (radio) => radio.addEventListener('click', function (e) {
        this.classList.add('custom-select-active');

        // remove from all others
        [].forEach.call(topMenuElems, (radio) => {
          if (radio !== this) {
            radio.classList.remove('custom-select-active');
          }
        });

        // Update the property-type input
        const val = this.dataset.val;
        const propertyTypeInput = document.querySelector('[name="property-type"]');
        propertyTypeInput.value = val;

        // Hide all elements with id starting with 'second-'
        const allSecondElements = document.querySelectorAll('[id^="second-"]');
        [].forEach.call(allSecondElements, (el) => el.classList.add('hide'));

        // Remove the 'hide' class from the selected element based on val
        const selectedElement = document.getElementById('second-' + val);
        if (selectedElement) {
          selectedElement.classList.remove('hide');
        }
      }))

      const landToggleFromNiceSelect = document.getElementById('land-opt-toggle').parentElement.querySelector('.current');

      listenForChanges(landToggleFromNiceSelect, 'innerHTML', function (newValue) {
        if (newValue == 'With Planning') {
          document.getElementById('with-p').classList.remove('hide');
          document.getElementById('without-p').classList.add('hide');
        } else {
          document.getElementById('with-p').classList.add('hide');
          document.getElementById('without-p').classList.remove('hide');
        }
      });

    };

    secondStepControls();

    secondStepBtn.addEventListener('click', function (e) {
      const fields = getFormFields({ "property-type": "string" });

      if (fields['property-type'] === '') {
        alert('Please select a property type');

        return;
      }

      const secondStage = {
        'house': {
          'house-type': 'string',
          'house-tenure-type': 'string',
          'house-bedrooms': 'string',
          'house-build-type': 'string',
        },
        'apartment': {
          'apartment-type': 'string',
          'apartment-tenure-type': 'string',
          'apartment-build-type': 'string',
          'apartment-floor': 'string',
          'apartment-total-floor': 'string',
          'apartment-bedrooms': 'string',
        },
        'land': {
          'land-type': 'string',
          'land-purpose-without-planning': 'string',
          'land-purpose-with-planning': 'string',
        },
        'commercial': {
          'commercial-type': 'string'
        },
        'other': {
          'other-select': 'string'
        }
      }

      // clear all fields from second stage in allData
      Object.keys(secondStage).forEach(function (key) {
        Object.keys(secondStage[key]).forEach(function (key2) {
          delete allData[key2];
        });
      });

      // check the land constraints
      if (fields['property-type'] === 'land') {
        const landOpt = document.getElementById('land-opt-toggle').parentElement.querySelector('.current').textContent;

        if (landOpt === 'With Planning') {
          delete secondStage['land']['land-purpose-with-planning'];
        } else {
          delete secondStage['land']['land-purpose-without-planning'];
        }
      }

      let neededFields = secondStage[fields['property-type']];

      const completeFields = getFormFields({ ...neededFields, "property-type": "string" });

      const fieldsAreComplete = checkCompleteness(completeFields, neededFields);
      const fieldsAreValid = checkValidity(completeFields, neededFields);

      if (fieldsAreComplete == false || fieldsAreValid == false) {
        return;
      }

      updateAllData(completeFields);
      secondStepBtn.parentElement.querySelector('.next-step').click();
    });

    // Begin third step controls
    function thirdStepControls() {
      const saleReasonElemFromNiceSelect = document.getElementById('sale-reason').parentElement.querySelector('.current');

      listenForChanges(saleReasonElemFromNiceSelect, 'innerHTML', function (newValue) {
        if (newValue == 'other') {
          document.getElementById('sale-reason-other').classList.remove('hide');
        } else {
          document.getElementById('sale-reason-other').classList.add('hide');
        }
      });

      // listen for css change on the parent element and use that instead
      const landlordAndHomeOwner = document.getElementById('landlord-or-homeowner').querySelector('.current');

      listenForChanges(landlordAndHomeOwner, 'innerHTML', function (newValue) {
        if (newValue == 'Landlord') {
          document.getElementById('ownership-type').classList.add('hide');
          document.getElementById('landlord-last').classList.remove('hide');
          document.getElementById('non-landlord-last').classList.add('hide');
        } else if (newValue == 'Homeowner') {
          document.getElementById('ownership-type').classList.remove('hide');
          document.getElementById('landlord-last').classList.add('hide');
          document.getElementById('non-landlord-last').classList.remove('hide');
        } else if (newValue == 'Homeowner And Landlord') {
          document.getElementById('ownership-type').classList.remove('hide');
          document.getElementById('landlord-last').classList.remove('hide');
          document.getElementById('non-landlord-last').classList.remove('hide');
        }
      });

      const propertiesForSaleElemFromNiceSelect = document.getElementById('properties-for-sale-question').parentElement.querySelector('.current');

      listenForChanges(propertiesForSaleElemFromNiceSelect, 'innerHTML', function (newValue) {
        if (newValue == 'No') {
          document.getElementById('properties-for-sale-answer').classList.remove('hide');
        } else {
          document.getElementById('properties-for-sale-answer').classList.add('hide');
        }
      });


      const onMarketElemFromNiceSelect = document.getElementById('on-market-question').parentElement.querySelector('.current');

      listenForChanges(onMarketElemFromNiceSelect, 'innerHTML', function (newValue) {
        if (newValue == 'Yes') {
          document.getElementById('on-market-answer').classList.remove('hide');
        } else {
          document.getElementById('on-market-answer').classList.add('hide');
        }
      });
    }

    thirdStepControls();

    thirdStepBtn.addEventListener('click', function (e) {
      const neededFields = {
        'sale-reason': 'string',
        'sale-reason-other': 'string',
        'landlord-or-homeowner': 'string',
        "ownership-type": 'string',
        'properties-for-sale-question': 'string',
        "properties-for-sale-answer": 'string',
        'on-market-question': 'string',
        'on-market-answer': 'string',
        "property-condition": "string",
        "speed-of-sale": "string",
      }

      // clear all fields from third stage in allData
      Object.keys(neededFields).forEach(function (key) {
        delete allData[key];
      });

      if (document.getElementById('sale-reason').parentElement.querySelector('.current').textContent !== 'other') {
        delete neededFields['sale-reason-other'];
      }

      if (document.querySelector(`[name='landlord-or-homeowner']`).value !== 'Homeowner') {
        delete neededFields['ownership-type'];
      }

      if (document.getElementById('properties-for-sale-question').parentElement.querySelector('.current').textContent !== 'No') {
        delete neededFields['properties-for-sale-answer'];
      }

      if (document.getElementById('on-market-question').parentElement.querySelector('.current').textContent !== 'Yes') {
        delete neededFields['on-market-answer'];
      }

      const fields = getFormFields(neededFields);
      const fieldsAreComplete = checkCompleteness(fields, neededFields);
      const fieldsAreValid = checkValidity(fields, neededFields);

      if (fieldsAreComplete == false || fieldsAreValid == false) {
        return;
      }

      updateAllData(fields);
      thirdStepBtn.parentElement.querySelector('.next-step').click();
    });

    // Begin fourth step controls
    function fourthStepControls () {
      const debtElemFromNiceSelect = document.getElementById('additional-debts').parentElement.querySelector('.current');

      listenForChanges(debtElemFromNiceSelect, 'innerHTML', function (newValue) {
        if (newValue == 'Yes') {
          document.getElementById('additional-debts-answer').classList.remove('hide');
        } else {
          document.getElementById('additional-debts-answer').classList.add('hide');
        }
      });
    }

    fourthStepControls();

    fourthStepBtn.addEventListener('click', function (e) {
      const neededFields = {
        'additional-debts': 'string',
        'additional-debts-answer': 'string',
        'debt-on-property': 'string',
        'property-worth': 'string',
        'time-to-call-back': 'array',
        'day-to-call-back': 'array',
        'hear-about-us': 'string',
        'marketing': 'string'
      }

      // clear all fields from fourth stage in allData
      Object.keys(neededFields).forEach(function (key) {
        delete allData[key];
      });

      if (document.getElementById('additional-debts').value !== 'Yes') {
        delete neededFields['additional-debts-answer'];
      }

      const fields = getFormFields(neededFields);
      const fieldsAreComplete = checkCompleteness(fields, neededFields);
      const fieldsAreValid = checkValidity(fields, neededFields);

      if (fieldsAreComplete == false || fieldsAreValid == false) {
        return;
      }

      updateAllData(fields);
      fourthStepBtn.parentElement.querySelector('.next-step').click();
    });

    fifthStepBtn.addEventListener('click', function (e) {
      const neededFields = {
        'free-consultation': 'string',
        'cash-offer': 'string',
        'half-price-legal-services': 'string',
        'removal-services': 'string',
        'onwards-purchase': 'string',
      }

      // clear all fields from fourth stage in allData
      Object.keys(neededFields).forEach(function (key) {
        delete allData[key];
      });

      if (allData['landlord-or-homeowner'] === 'Homeowner') {
        delete neededFields['free-consultation']
        delete neededFields['cash-offer']
      } else {
        delete neededFields['half-price-legal-services']
        delete neededFields['removal-services']
        delete neededFields['onwards-purchase']
      }

      // get the checked values from neededFields
      const fields = Object.fromEntries(Object.keys(neededFields).map(function (key) {
        return [key, document.querySelector(`[name="${key}"]`).checked.toString()]
      }));

      const fieldsAreComplete = checkCompleteness(fields, neededFields);
      const fieldsAreValid = checkValidity(fields, neededFields);

      if (fieldsAreComplete == false || fieldsAreValid == false) {
        return;
      }

      updateAllData(fields);

      // update the name with the first and last name
      document.getElementById('customer-name').textContent = `${allData['first-name']} ${allData['last-name']}`;
      fifthStepBtn.parentElement.querySelector('.next-step').click();

      // NOTE: this is the data to submit
      console.log(allData);
    });
  } catch (error) {
    console.log(error);
    alert('Something went wrong, please try reload the page and try again');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  beginFormProcessing();

  // initialize tagify
  const inputElements = document.querySelectorAll('.tagify');
  inputElements.forEach(function (inputElement) {
      new Tagify(inputElement, {
        enforceWhitelist: true,
        whitelist: inputElement.value.trim().split(/\s*,\s*/)
      });
  });

  // setup all custom radio buttons
  const customRadios = document.querySelectorAll('.custom-radio');

  customRadios.forEach(function (customRadio) {
    customRadio.addEventListener('click', function (e) {
      customRadio.classList.add('custom-select-active');
      
      // remove from all others
      const othersInGroup = document.querySelectorAll(`[data-group="${customRadio.dataset.group}"]`);
      [].forEach.call(othersInGroup, (radio) => {
        if (radio !== customRadio) {
          radio.classList.remove('custom-select-active');
        }
      });

      // update the input
      const input = document.querySelector(`[name="${customRadio.dataset.target}"]`);
      input.value = customRadio.dataset.val;
    });
  });

});

/*
  TODO: submit the allData object to the server
 */