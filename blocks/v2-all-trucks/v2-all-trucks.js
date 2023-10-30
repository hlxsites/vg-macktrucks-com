import { createElement } from '../../scripts/common.js';

// Define break point/s
const MQMobile = window.matchMedia('(max-width: 744px)');
const blockName = 'v2-all-trucks';

export default function decorate(block) {
  const pageDescriptionHeading = document.querySelector('.v2-all-trucks-container > div > h1');
  pageDescriptionHeading.classList.add('with-marker');

  const truckElement = block.querySelectorAll(`.${blockName} > div`);
  truckElement.forEach((div) => {
    div.classList.add(`${blockName}__truck`);

    const truckImageWrapper = block.querySelectorAll('.v2-all-trucks__truck > div:first-child');
    truckImageWrapper.forEach((image) => {
      image.classList.add(`${blockName}__truck-image`);
    });

    const truckInfoWrapper = block.querySelectorAll('.v2-all-trucks__truck> div:last-child');
    truckInfoWrapper.forEach((info) => {
      info.classList.add(`${blockName}__truck-info`);
    });
  });

  const trucksWrapper = document.querySelector('.v2-all-trucks-wrapper');
  trucksWrapper.classList.add('full-width');

  const trucks = document.querySelectorAll(`.${blockName}__truck`);
  const setSecondaryButton = document.querySelectorAll(`.${blockName}__truck .${blockName}__truck-info .button-container:last-of-type a`);
  const segmentList = document.querySelectorAll(`.${blockName}__truck > div > ul`);
  setSecondaryButton.forEach((button) => {
    button.classList.remove('button--primary');
    button.classList.add('button--secondary');
  });

  // Add truck name to truck element class list
  getTruckName();

  // Create menu buttons from truck segments
  const allSegmentNames = [];
  segmentList.forEach((ul) => {
    ul.classList.add(`${blockName}__segment-list`);
    const segmentListItems = ul.querySelectorAll('li');
    const segmentNames = Array.from(segmentListItems)
      .map((item) => item.textContent.trim()
        .toLowerCase()
        .replaceAll(' ', '-'));
    allSegmentNames.push(...segmentNames);

    const truck = ul.closest(`.${blockName}__truck`);
    segmentNames.forEach((segment) => {
      truck.classList.add(segment);
    });
  });

  const buttonSegmentNames = [...new Set(allSegmentNames)];
  const segmentNamesList = createElement('ul', { classes: `${blockName}__button-list` });
  block.prepend(segmentNamesList);

  // Create a dropdown icon fragment
  const showAllButtonDropDownIcon = document.createRange()
    .createContextualFragment(`
    <span class="icon icon-drop-down-chevron">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
        <path d="M6 4L10 8L6 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    `);

  function addShowAllButton() {
    const showAllButtonLi = createElement('li');
    const showAllButton = createElement('button',
      { classes: [`${blockName}__segment-button`, `${blockName}__show-all-button`] });

    showAllButton.textContent = 'All trucks';
    showAllButtonLi.appendChild(showAllButton);
    segmentNamesList.appendChild(showAllButtonLi);
    showAllButton.appendChild(showAllButtonDropDownIcon);

    showAllButton.addEventListener('click', () => {
      trucks.forEach((truck) => {
        truck.style.display = 'flex';
        truck.classList.remove('odd-row', 'even-row');
      });

      if (MQMobile.matches) {
        const segmentNamesListWithoutShowAll = document.querySelectorAll(`.${blockName}__button-list > li > button:not(.${blockName}__show-all-button)`);
        segmentNamesListWithoutShowAll.forEach((item) => {
          item.classList.toggle('show');
        });
      }
    });
  }

  addShowAllButton();

  buttonSegmentNames.forEach((segment) => {
    const li = createElement('li');
    const filterButton = createElement('button', { classes: `${blockName}__segment-button` });
    filterButton.textContent = segment;
    segmentNamesList.appendChild(li);
    li.append(filterButton);

    filterButton.addEventListener('click', () => {
      const clickedSegment = filterButton.textContent.trim()
        .toLowerCase();

      trucks.forEach((truck) => {
        truck.style.display = truck.classList.contains(clickedSegment) ? 'flex' : 'none';
        const isSelected = truck.style.display === 'flex';
        truck.style.display = isSelected ? 'flex' : 'none';
        truck.classList.toggle('selected-truck', isSelected);
      });

      const allTrucksRows = document.querySelectorAll(`.${blockName}__truck`);

      allTrucksRows.forEach((truck) => {
        if (truck.classList.contains('selected-truck')) {
          truck.classList.remove('odd', 'even');

          const selectedTrucks = document.querySelectorAll('.selected-truck');

          selectedTrucks.forEach((selectedTruck, i) => {
            if (i % 2 === 0) {
              selectedTruck.classList.remove('even-row');
              selectedTruck.classList.add('odd-row');
            } else {
              selectedTruck.classList.remove('odd-row');
              selectedTruck.classList.add('even-row');
            }
          });
        } else if (!truck.classList.contains('selected-truck')) {
          truck.classList.remove('odd', 'even');
        }
      });
    });

    filterButton.addEventListener('click', () => {
      const segmentNamesListWithoutShowAll = document.querySelectorAll(`.${blockName}__button-list > li > button:not(.${blockName}__show-all-button)`);
      if (MQMobile.matches) {
        segmentNamesListWithoutShowAll.forEach((item) => {
          item.classList.remove('show');
        });
      }
    });

    MQMobile.addEventListener('change', (e) => {
      if (e.matches) {
        const segmentNamesListWithoutShowAll = document.querySelectorAll(`.${blockName}__button-list > li > button:not(.${blockName}__show-all-button)`);
        segmentNamesListWithoutShowAll.forEach((item) => {
          item.classList.remove('show');
        });
      }
    });
  });

  function getActiveFilterButton() {
    const AllFilterButtons = document.querySelectorAll(`.${blockName}__button-list .${blockName}__segment-button`);

    AllFilterButtons.forEach((filterButton) => {
      filterButton.addEventListener('click', (e) => {
        AllFilterButtons.forEach((button) => {
          if (button !== e.target) {
            button.classList.remove('active');
          } else if (button === e.target && !button.classList.contains('active')) {
            e.target.classList.toggle('active');
          }
        });
      });
    });
  }

  getActiveFilterButton();
}

function getTruckName() {
  const modelName = document.querySelectorAll(`.${blockName}__truck > div + div > h3`);
  modelName.forEach((model) => {
    const parentNodeElement = model.parentNode.parentNode;
    parentNodeElement.classList.add(model.id);
  });
}
