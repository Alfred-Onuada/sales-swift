async function beginFormProcessing() {
  try {
    const retrieveApiUrl = "https://api.addressy.com/Capture/Interactive/Retrieve/v1.2/json3ex.ws"
    const access_token = "FY37-ZU98-DA44-DA26";

    const currentLocationSpan = document.getElementsByClassName('currentLocation');
    const currentLocationFromUrl = decodeURI(window.location.search.replace('?id=', ''));

    const resp = await fetch(`${retrieveApiUrl}?Key=${encodeURIComponent(access_token)}&Id=${encodeURIComponent(currentLocationFromUrl)}`);
    const data = await resp.json();

    if (currentLocationFromUrl) {
      [].forEach.call(currentLocationSpan, function (el) {
        el.innerHTML = data.Items[0].Label;
      });
    }

    const allData = {};

    // updates the data object
    function updateAllData(data) {
      Object.assign(allData, data);
    }

    // gets the fields from the form
    function getFormFields(neededFields) {
      const fields = {};

      Object.keys(neededFields).forEach(function (key) {
        const value = document.querySelector(`[name="${key}"]`).value;
        fields[key] = value;
      });

      return fields;
    }

    // checks that the fields are present
    function checkCompleteness(fields, neededFields) {
      const fieldsAreComplete = Object.keys(neededFields).every(function (key) {
        return fields.hasOwnProperty(key) && fields[key] !== '';
      });

      return fieldsAreComplete;
    }

    // confirms the fields match a certain type
    function checkValidity(fields, neededFields) {
      const fieldsAreValid = Object.keys(neededFields).every(function (key) {
        const value = fields[key];
        const type = neededFields[key];

        if (type === 'string') {
          return typeof value === 'string';
        }

        if (type === 'phone') {
          return value.replace(/\s/g, "").match(/^\d{11}/) && value.replace(/\s/g, "").match(/^\d+$/);
        }

        if (type === 'email') {
          return value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        }

        return false;
      });

      return fieldsAreValid;
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

      if (!(fieldsAreComplete && fieldsAreValid)) {
        alert('Please fill out all fields correctly');

        return;
      }

      updateAllData(fields);
      firstStepBtn.parentElement.querySelector('.next-step').click();
    })

    // Begin second step constrols
    function secondStepControls() {
      const customRadios = document.getElementsByClassName('custom-radio');
      [].forEach.call(customRadios, (radio) => radio.addEventListener('click', function (e) {
        this.classList.add('custom-select-active');

        // remove from all others
        [].forEach.call(customRadios, (radio) => {
          if (radio !== this) {
            radio.classList.remove('custom-select-active');
          }
        });

        // update the property-type input
        const val = this.dataset.val;
        document.querySelector('[name="property-type"]').value = val;

        switch (val) {
          case 'house':
            [].forEach.call(document.querySelectorAll('[id^="second-"]'), (el) => el.classList.add('hide'));
            document.getElementById('second-' + val).classList.remove('hide');
            break;
          case 'apartment':
            [].forEach.call(document.querySelectorAll('[id^="second-"]'), (el) => el.classList.add('hide'));
            document.getElementById('second-' + val).classList.remove('hide');
            break;
          case 'land':
            [].forEach.call(document.querySelectorAll('[id^="second-"]'), (el) => el.classList.add('hide'));
            document.getElementById('second-' + val).classList.remove('hide');
            break;
          case 'commercial':
            [].forEach.call(document.querySelectorAll('[id^="second-"]'), (el) => el.classList.add('hide'));
            document.getElementById('second-' + val).classList.remove('hide');
            break;
          case 'other':
            [].forEach.call(document.querySelectorAll('[id^="second-"]'), (el) => el.classList.add('hide'));
            document.getElementById('second-' + val).classList.remove('hide');
            break;
          default:
            break;
        }
      }))

      document.getElementById('land-opt-toggle').addEventListener('change', function (e) {
        if (e.target.value == "With Planning") {
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
        const landOpt = document.getElementById('land-opt-toggle').value;

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

      if (!(fieldsAreComplete && fieldsAreValid)) {
        alert('Please fill out all fields correctly');

        return;
      }

      updateAllData(completeFields);
      secondStepBtn.parentElement.querySelector('.next-step').click();
    });

    // Begin third step controls
    function thirdStepControls() {
      document.getElementById('sale-reason').addEventListener('change', function (e) {
        if (e.target.value == 'other') {
          document.getElementById('sale-reason-other').classList.remove('hide');
        } else {
          document.getElementById('sale-reason-other').classList.add('hide');
        }
      })

      document.getElementById('landlord-or-homeowner').addEventListener('change', function (e) {
        if (e.target.value == 'Homeowner') {
          document.getElementById('ownership-type').classList.remove('hide');
          document.getElementById('landlord-last').classList.add('hide');
          document.getElementById('non-landlord-last').classList.remove('hide');
        } else {
          document.getElementById('ownership-type').classList.add('hide');
          document.getElementById('landlord-last').classList.remove('hide');
          document.getElementById('non-landlord-last').classList.add('hide');
        }
      })

      document.getElementById('properties-for-sale-question').addEventListener('change', function (e) {
        if (e.target.value == 'No') {
          document.getElementById('properties-for-sale-answer').classList.remove('hide');
        } else {
          document.getElementById('properties-for-sale-answer').classList.add('hide');
        }
      });

      document.getElementById('on-market-question').addEventListener('change', function (e) {
        if (e.target.value == 'Yes') {
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

      if (document.getElementById('sale-reason').value !== 'other') {
        delete neededFields['sale-reason-other'];
      }

      if (document.getElementById('landlord-or-homeowner').value !== 'Homeowner') {
        delete neededFields['ownership-type'];
      }

      if (document.getElementById('properties-for-sale-question').value !== 'No') {
        delete neededFields['properties-for-sale-answer'];
      }

      if (document.getElementById('on-market-question').value !== 'Yes') {
        delete neededFields['on-market-answer'];
      }

      const fields = getFormFields(neededFields);
      const fieldsAreComplete = checkCompleteness(fields, neededFields);
      const fieldsAreValid = checkValidity(fields, neededFields);

      if (!(fieldsAreComplete && fieldsAreValid)) {
        alert('Please fill out all fields correctly');

        return;
      }

      updateAllData(fields);
      thirdStepBtn.parentElement.querySelector('.next-step').click();
    });

    // Begin fourth step controls
    function fourthStepControls () {
      // add the date and time constraint to the date and time input (min today, max this time next year)
      const datePicker = document.querySelector("input[name='call-back-time']");
      datePicker.min = new Date().toISOString().replace(/\..*$/, "");
      datePicker.max = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().replace(/\..*$/, "");

      document.getElementById('additional-debts').addEventListener('change', function (e) {
        if (e.target.value == 'Yes') {
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
        'call-back-time': 'string',
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

      if (!(fieldsAreComplete && fieldsAreValid)) {
        alert('Please fill out all fields correctly');

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

      console.log(fields);

      const fieldsAreComplete = checkCompleteness(fields, neededFields);
      const fieldsAreValid = checkValidity(fields, neededFields);

      if (!(fieldsAreComplete && fieldsAreValid)) {
        alert('Please fill out all fields correctly');

        return;
      }

      updateAllData(fields);
      fifthStepBtn.parentElement.querySelector('.next-step').click();
    });
  } catch (error) {
    alert('Something went wrong, please try reload the page and try again');
  }
}

document.addEventListener('DOMContentLoaded', beginFormProcessing);





/*
  TODO: make everything properly responsive
  TODO: submit the allData object to the server
  TODO: handle errors better by using a toast and telling them the exact fields that fail
 */