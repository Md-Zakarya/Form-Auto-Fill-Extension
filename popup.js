document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('saveBtn');
  const autoFillBtn = document.getElementById('autoFillBtn');
  const loadingBar = document.getElementById('loadingBar');

  // Utility function to get and set values for form fields
  function setField(selector, value) {
    const field = document.querySelector(selector);
    if (field) {
      field.value = value || '';
    }
  }

  // Utility function to retrieve form data from fields
  function getFieldData() {
    return {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      fullName: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      jobTitle: document.getElementById('jobTitle').value,
      education: document.getElementById('education').value,
      skills: document.getElementById('skills').value,
      experience: document.getElementById('experience').value,
      languages: document.getElementById('languages').value,
      linkedin: document.getElementById('linkedin').value,
      github: document.getElementById('github').value,
      portfolio: document.getElementById('portfolio').value,
      bio: document.getElementById('bio').value
    };
  }
  
  // Populate form fields with saved data
  function populateForm(formData) {
    setField('#firstName', formData.firstName);
    setField('#lastName', formData.lastName);
    setField('#name', formData.fullName || `${formData.firstName} ${formData.lastName}`);
    setField('#email', formData.email);
    setField('#phone', formData.phone);
    setField('#address', formData.address);
    setField('#jobTitle', formData.jobTitle);
    setField('#education', formData.education);
    setField('#skills', formData.skills);
    setField('#experience', formData.experience);
    setField('#languages', formData.languages);
    setField('#linkedin', formData.linkedin);
    setField('#github', formData.github);
    setField('#portfolio', formData.portfolio);
    setField('#bio', formData.bio);
  }

  // Load saved data on page load
  chrome.storage.sync.get(['formData'], function(result) {
    const formData = result.formData || {};
    populateForm(formData);
    console.log("Loaded and populated form with data:", formData);
  });

  // Show the loading bar
  function showLoadingBar() {
    loadingBar.style.display = 'block';
  }

  // Hide the loading bar
  function hideLoadingBar() {
    loadingBar.style.display = 'none';
  }

  // Save data when the save button is clicked
  saveBtn.addEventListener('click', function() {
    const data = getFieldData();
    data.fullName = `${data.firstName} ${data.lastName}`; // Combine first and last names
  
    chrome.storage.sync.set({ formData: data }, function() {
      // Convert the data object to a JSON string
      const dataString = JSON.stringify(data, null, 2); // Pretty print with 2 spaces
  
      console.log("Data saved successfully:", data);
      // Display the data in the alert window
      alert('Data saved successfully:\n\n' + dataString);
    });
  });

  // Auto-fill form based on detected fields from backend
  autoFillBtn.addEventListener('click', async function() {
    showLoadingBar(); // Show loading bar when auto-fill starts

    try {
      // Get HTML content of the popup body (or another way to identify the form content)
      const popupContent = document.body.innerHTML;

      const response = await fetch('http://localhost:3000/detect-fields', {  // Replace with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ htmlContent: popupContent })
      });

      const data = await response.json();
      console.log("Detected fields:", data);

      // Retrieve saved data and send it to the content script for auto-filling
      chrome.storage.sync.get(['formData'], function(result) {
        const formData = result.formData || {};
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'autoFill', data: formData });
          console.log("Auto-fill triggered with data:", formData);
          hideLoadingBar(); // Hide loading bar when auto-fill is done
        });
      });
    } catch (error) {
      console.error('Error auto-filling form:', error);
      hideLoadingBar(); // Hide loading bar in case of error
    }
  });
});
