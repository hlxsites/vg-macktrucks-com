// Importing a function 'createElement' from an external file 'common.js'
import { createElement } from '../../scripts/common.js';

// Define break point/s
const MQMobile = window.matchMedia('(max-width: 744px)');

// Fetch truck data from a JSON file
function fetchTruckData() {
  return fetch('/all-trucks.json')
    .then((response) => response.json());
}

// Create truck segment buttons based on provided data
function createSegmentButtons(data) {
  // Creating a container for segment buttons using createElement function
  const segmentButtonsContainer = createElement('div', {
    classes: 'v2-all-trucks__segment-buttons-container',
  });

  // Extracting all segments from the data and converting to lowercase
  const allSegments = data.flatMap((truck) => truck.segments);
  const lowerCaseSegments = [...new Set(allSegments)].map((segment) => segment.toLowerCase());

  // Creating a list to hold buttons
  const buttonList = document.createElement('ul');
  buttonList.classList.add('v2-all-trucks__button-list');

  // Hiding the button list on mobile view
  if (MQMobile.matches) {
    buttonList.classList.add('hidden');
  }

  // Creating buttons and attaching event listeners
  lowerCaseSegments.forEach((segment) => {
    const segmentButton = document.createElement('button');
    segmentButton.textContent = segment;
    segmentButton.addEventListener('click', () => filterTrucks(lowerCaseSegments, segment));

    const segmentItem = document.createElement('li');
    segmentItem.appendChild(segmentButton);
    buttonList.appendChild(segmentItem);
  });

  // Appending the button list to the segment buttons container
  segmentButtonsContainer.appendChild(buttonList);

  return segmentButtonsContainer;
}

// Toggle the visibility of the button list
function toggleButtonListVisibility() {
  const buttonList = document.querySelector('.v2-all-trucks__button-list');
  const buttonListButtons = document.querySelectorAll('.v2-all-trucks__button-list > li > button');

  // Attaching event listeners to buttons inside the list
  buttonListButtons.forEach((button) => {
    button.addEventListener('click', () => buttonList.classList.add('hidden'));
  });

  // Toggling the 'hidden' class for the button list based on mobile view
  if (MQMobile.matches) {
    buttonList.classList.toggle('hidden');
    buttonListButtons.forEach((button) => {
      button.addEventListener('click', () => buttonList.classList.add('hidden'));
    });
  }
}

// Filter trucks based on segments
function filterTrucks(lowerCaseSegments, segment) {
  const trucks = document.querySelectorAll('.v2-all-trucks__truck');

  trucks.forEach((truck) => {
    if (!segment || truck.classList.contains(segment)) {
      truck.style.display = 'flex';

      if (truck.style.display === 'flex') {
        truck.classList.add('selected-truck');
      }
    } else {
      truck.style.display = 'none';
      truck.classList.remove('selected-truck');
    }
  });

  const allTrucks = document.querySelectorAll('.v2-all-trucks__truck');

  allTrucks.forEach((truck) => {
    if (truck.classList.contains('selected-truck')) {
      truck.classList.remove('odd', 'even');

      const selectedTrucks = document.querySelectorAll('.selected-truck');

      selectedTrucks.forEach((selectedTruck, i) => {
        // eslint-disable-next-line no-unused-expressions
        (i % 2 === 0) ? selectedTruck.style.backgroundColor = '#E9EAEC' : selectedTruck.style.backgroundColor = '#F4F5F6';
      });
    } else if (!truck.classList.contains('selected-truck')) {
      truck.classList.remove('odd', 'even');
    }
  });
}

// Decorate the page with truck data
export default function decorate(block) {
  const truckListing = document.querySelector('.v2-all-trucks > div > div');

  const pageDescriptionHeading = document.querySelector('.v2-all-trucks-container > div > h1');
  pageDescriptionHeading.classList.add('with-marker');

  // Create a container for displaying errors
  const errorContainer = createElement('div', {
    classes: 'error-container',
  });

  // Append the error container to the block
  block.appendChild(errorContainer);

  // Display errors
  function displayError(message) {
    errorContainer.textContent = message;
  }

  // Creating a dropdown icon fragment
  const showAllButtonDropDownIcon = document.createRange()
    .createContextualFragment(`
    <span class="icon icon-drop-down-chevron">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
        <path d="M6 4L10 8L6 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    `);

  // Fetching truck data
  fetchTruckData()
    .then((data) => {
      // Creating a 'Show All' button
      const showAllButton = document.createElement('button');
      showAllButton.textContent = 'All Trucks';
      showAllButton.classList.add('v2-all-trucks__show-all-button');
      showAllButton.appendChild(showAllButtonDropDownIcon);

      if (MQMobile.matches) {
        showAllButton.addEventListener('click', toggleButtonListVisibility);
        showAllButton.addEventListener('click', () => filterTrucks(null));
      } else {
        showAllButton.addEventListener('click', () => filterTrucks(null));
      }

      // Creating segment buttons container and prepending the 'Show All' button
      const segmentButtonsContainer = createSegmentButtons(data);
      segmentButtonsContainer.prepend(showAllButton);

      // Event listener for mobile view changes
      MQMobile.addEventListener('change', (e) => {
        const buttonList = document.querySelector('.v2-all-trucks__button-list');
        const buttonListButtons = document.querySelectorAll('.v2-all-trucks__button-list > li > button');

        if (e.matches) {
          showAllButton.removeEventListener('click', () => filterTrucks(null));
          showAllButton.addEventListener('click', toggleButtonListVisibility);
          buttonList.classList.add('hidden');
        } else {
          showAllButton.removeEventListener('click', toggleButtonListVisibility);
          showAllButton.addEventListener('click', () => filterTrucks(null));
          buttonList.classList.remove('hidden');

          buttonListButtons.forEach((button) => {
            button.addEventListener('click', () => buttonList.classList.remove('hidden'));
          });
        }
      });

      // Loop through truck data and create truck elements
      data.forEach((truck) => {
        const truckContainer = document.createElement('div');
        truckContainer.classList.add('v2-all-trucks__truck', 'stripped-rows-on-load');

        // Remove spaces and convert to lowercase for class name
        const truckModelNameTrimmed = truck.model.replaceAll(' ', '-')
          .toLowerCase();

        const lowerCaseSegments = truck.segments.map((segment) => segment.toLowerCase());

        truckContainer.classList.add(...lowerCaseSegments, truckModelNameTrimmed);

        const containerDiv = document.createElement('div');
        containerDiv.classList.add('v2-all-trucks__truck-info');

        const imageElement = document.createElement('img');
        imageElement.src = truck.image;
        imageElement.alt = `${truck.model} Image`;
        imageElement.classList.add('v2-all-trucks__truck-image');

        const modelElement = document.createElement('h3');
        modelElement.textContent = truck.model;

        const segmentsList = document.createElement('ul');
        segmentsList.classList.add('segment-list');
        lowerCaseSegments.forEach((segment) => {
          const segmentItem = document.createElement('li');
          segmentItem.textContent = `${segment}`;
          segmentsList.appendChild(segmentItem);
        });

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = truck.description;

        const primaryButton = document.createElement('a');
        primaryButton.classList.add('button', 'button--primary', 'button--large');
        primaryButton.textContent = truck.primaryButton;

        const secondaryButton = document.createElement('a');
        secondaryButton.classList.add('button', 'button--secondary', 'button--large');
        secondaryButton.textContent = truck.secondaryButton;

        // Appending elements to the DOM
        containerDiv.appendChild(modelElement);
        containerDiv.appendChild(segmentsList);
        containerDiv.appendChild(descriptionElement);
        containerDiv.appendChild(primaryButton);
        containerDiv.appendChild(secondaryButton);

        block.prepend(segmentButtonsContainer);
        truckContainer.appendChild(imageElement);
        truckContainer.appendChild(containerDiv);
        truckListing.appendChild(truckContainer);
      });
    })
    .catch(() => {
      // Display error message on the page
      displayError('An error occurred while fetching truck data.');
    });
}
