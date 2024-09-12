// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'autoFill') {
    autoFillForm();
  }
});

function autoFillForm() {
  chrome.storage.sync.get(['formData'], function(result) {
    const formData = result.formData;

    if (formData) {
      document.querySelectorAll('form').forEach(form => {
        form.querySelectorAll('input, textarea, select').forEach(element => {
          const fieldId = element.id;
          const name = fieldId || element.name || element.placeholder || '';

          let value = formData[name];
          if (name === 'name') {
            value = formData.fullName;
          }

          if (value !== undefined) {
            switch (element.type) {
              case 'checkbox':
                element.checked = Boolean(value);
                break;
              case 'radio':
                if (element.value === value) {
                  element.checked = true;
                }
                break;
              case 'select-one':
                const options = Array.from(element.options);
                const selectedOption = options.find(option => option.value === value);
                if (selectedOption) {
                  element.value = selectedOption.value;
                }
                break;
                default:
                  if (element.tagName === 'TEXTAREA') {
                    element.textContent = value;
                  } else if (element.type === 'file') {
                    const files = value instanceof Array ? value : [value];
                    element.files = new FileList(files);
                  } else if (element.tagName === 'SELECT') {
                    const options = Array.from(element.options);
                    const selectedOption = options.find(option => option.value === value);
                    if (selectedOption) {
                      element.value = selectedOption.value;
                    } else {
                      console.log(`Warning: Value "${value}" is not a valid option for select element`);
                    }
                  } else {
                    switch (element.type) {
                      case 'number':
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue)) {
                          element.value = numericValue;
                        } else {
                          // If the value is not a valid number, set a default value
                          element.value = 0; // or some other default value that makes sense
                          console.log(`Warning: Value "${value}" is not a valid number, defaulting to 0`);
                        }
                        break;
                      case 'date':
                        element.value = new Date(value);
                        break;
                      // Add more cases for other data types as needed
                      default:
                        element.value = value;
                    }
                  }
            }
          }
        });
      });
    }
  });
}