import { decorateIcons } from '../../scripts/lib-franklin.js';

let hotspotBlockCounter = 0;

function handleClickHotspot(event, iconLink, hotspotId, block) {
  event.preventDefault();

  iconLink.classList.add('active-spot');

  const allLayovers = block.querySelector('.hotspot-layover');
  allLayovers.style.display = 'block';
  allLayovers.classList.add('is-active');

  // Workaround: Delay adding the class, otherwise slide-in animation is not played.
  setTimeout(() => {
    const layoverDialog = allLayovers.querySelector(`.hotspot-layover-box[data-hotspot-content="${hotspotId}"]`);
    layoverDialog.classList.add('is-active');
  }, 0);
}

/**
 *
 * @param event
 * @param layoverDialog {HTMLDialogElement}
 * @param block {HTMLDivElement}
 */
function handleCloseLayover(event, layoverDialog, block) {
  block.querySelectorAll('.hotspot-icon-set .active-spot')
    .forEach((spot) => spot.classList.remove('active-spot'));

  layoverDialog.parentElement.classList.remove('is-active');
  layoverDialog.classList.remove('is-active');

  setTimeout(() => {
    layoverDialog.parentElement.style.display = 'none';
  }, 300);
}

/**
 *
 * @param event
 * @param layoverDialog
 * @param block
 * @param direction {'prev'|'next'}
 */
function switchToOtherLayover(event, layoverDialog, block, direction) {
  block.querySelectorAll('.hotspot-layover-box').forEach((box) => {
    box.classList.add('no-animation');
  });
  block.querySelectorAll('.hotspot-layover-box').forEach((box) => {
    box.classList.remove('is-active');
  });
  block.querySelectorAll('.hotspot-icon-set .active-spot').forEach((spot) => spot.classList.remove('active-spot'));

  let switchTo;
  if (direction === 'next') {
    switchTo = layoverDialog.nextElementSibling;
    if (!switchTo) {
      switchTo = layoverDialog.parentElement.firstElementChild;
    }
  } else {
    switchTo = layoverDialog.previousElementSibling;
    if (!switchTo) {
      switchTo = layoverDialog.parentElement.lastElementChild;
    }
  }
  switchTo.classList.add('is-active');

  // activate hotspot link
  block.querySelector(`[data-spot="${switchTo.dataset.hotspotContent}"]`).classList.add('active-spot');

  setTimeout(() => {
    // workaround: for some reason the animation is still played when the class is added immediately
    block.querySelectorAll('.hotspot-layover-box')
      .forEach((box) => {
        box.classList.remove('no-animation');
      });
  }, 0);
}

function addSpot(hotspotsBlock, hotspot) {
  const iconSet = hotspotsBlock.querySelector('.hotspot-icon-set');
  const iconLink = document.createElement('a');
  iconLink.classList.add('hotspot-icon');
  iconLink.innerHTML = ' <img src="../../icons/hotspot.png" alt="Detail view of the Anthem air dam" /> ';
  iconLink.href = '#';
  iconLink.style.left = hotspot.positionLeft;
  iconLink.style.top = hotspot.positionTop;
  iconLink.dataset.spot = hotspot.id.toString();
  // iconLink.firstElementChild.alt = hotspot.alt; TODO: alt
  iconLink.onclick = (event) => handleClickHotspot(
    event,
    iconLink,
    hotspot.id,
    hotspotsBlock.parentNode,
  );
  iconSet.append(iconLink);
}

/**
 *
 * @param hotspotsBlock {HTMLDivElement}
 * @param firstImage {HTMLPictureElement}
 * @param title {HTMLElement}
 * @param description {HTMLElement}
 * @param layoverContents {LayoverContent[]}
 */
function decorateDesktopImageWithHotspots(hotspotsBlock, firstImage, title, description, layoverContents) {
  // TODO: set data-hotspot="1" data-fade-object="true"
  const hotspot = document.createElement('div');
  hotspot.classList.add('hotspot');
  hotspot.classList.add('animated');
  hotspot.dataset.hotspot = '1'; // TODO
  hotspot.dataset.fadeObject = 'true'; // TODO
  hotspot.innerHTML = `
      <!-- TODO: set stand="" up="" sleeper=""  alt-->
      <!--    TODO: dynamic image size-->
      <img class="hotspot-bg-img desktop"  src="">
      <img class="hotspot-bg-img mobile"  src="">
  
      <div class="hotspot-content content-wrapper ">
          <h1 class="hotspot-header"></h1>
          <p class="hotspot-text reduced-width"></p>
      </div>
  
      <div class="hotspot-icon-set"></div>`;

  hotspot.querySelector('.hotspot-bg-img.desktop').src = firstImage.src;
  hotspot.querySelector('.hotspot-bg-img.mobile').src = firstImage.src;
  hotspot.querySelector('.hotspot-header').innerHTML = title.innerHTML;
  hotspot.querySelector('.hotspot-text').innerHTML = description.innerHTML;

  hotspotsBlock.prepend(hotspot);
}

function getLayoverContentWithOffset(layoverContents, index, offset) {
  // JS does not support negative modulo, therefore we need to add length of the array
  return layoverContents[(index + offset + layoverContents.length) % layoverContents.length];
}

/**
 *
 * @param layoverBlock
 * @param layoverContents {LayoverContent[]}
 * @param block {HTMLDivElement}
 */
function decorateDesktopLayoverBox(layoverBlock, layoverContents, block) {
  layoverContents.forEach((layoverContent, index) => {
    const box = document.createElement('div');
    box.innerHTML = `<div class="hotspot-layover-box" data-hotspot-content="1">
    <div class="hotspot-layover-thumb" style="background-image: url();"></div>
    <div class="hotspot-layover-close">
        <img src="../../icons/x.png">
    </div>
    <div class="hotspot-layover-text">
        <h5></h5>
        <h3></h3>
        <p class="large"></p>
    </div>
    <div class="hotspot-layover-controls">
        <a class="hotspot-layover-button prev">
            <img src="../../icons/left-arrow-small.png" alt="Left arrow">
            <span></span>
        </a>
        <a class="hotspot-layover-button next">
            <img src="../../icons/right-arrow-small.png" alt="Right arrow">
            <span></span>
        </a>
    </div>
</div>`;

    const layoverDialog = box.querySelector('.hotspot-layover-box');
    layoverDialog.dataset.hotspotContent = layoverContent.id.toString();
    layoverDialog.querySelector('.hotspot-layover-thumb').style.backgroundImage = `url(${layoverContent.picture.querySelector('img').src})`;
    layoverDialog.querySelector('.hotspot-layover-text h5').innerHTML = layoverContent.category.innerHTML;
    layoverDialog.querySelector('.hotspot-layover-text h3').innerHTML = layoverContent.title.innerHTML;
    layoverDialog.querySelector('.hotspot-layover-text p').innerHTML = layoverContent.text.innerHTML;

    const prevContent = getLayoverContentWithOffset(layoverContents, index, -1);
    const nextContent = getLayoverContentWithOffset(layoverContents, index, +1);
    layoverDialog.querySelector('.hotspot-layover-button.prev span').innerHTML = prevContent.title.innerHTML;
    layoverDialog.querySelector('.hotspot-layover-button.next span').innerHTML = nextContent.title.innerHTML;
    layoverDialog.querySelector('.hotspot-layover-button.prev')
      .addEventListener('click', (event) => switchToOtherLayover(event, layoverDialog, block, 'prev'));
    layoverDialog.querySelector('.hotspot-layover-button.next')
      .addEventListener('click', (event) => switchToOtherLayover(event, layoverDialog, block, 'next'));

    // don't close if clicked on sidebar
    layoverDialog.addEventListener('click', (event) => event.stopPropagation());

    layoverDialog.querySelector('.hotspot-layover-close')
      .addEventListener('click', (event) => handleCloseLayover(event, layoverDialog, block));

    layoverBlock.append(...box.childNodes);
  });
}

/**
 *
 * @param layoverBlock
 * @param layoverContents {LayoverContent[]}
 * @param block {HTMLDivElement}
 */
function decorateMobileFeatureImages(layoverBlock, layoverContents, block) {
  const mobileDiv = layoverBlock.querySelector('.hotspot-mobile');

  layoverContents.forEach((layoverContent) => {
    const featureBlock = document.createElement('div');
    featureBlock.innerHTML = `
    <div class="feature-block animated" fade-object="true">
        <div class="content-wrapper">
            <div class="feature">
                <div class="feature-thumb" style="background-image: url();"></div>
                <h4 class="feature-title"></h4>
                <p></p></div>
        </div>
    </div>`;

    featureBlock.querySelector('.feature-thumb').style.backgroundImage = `url(${layoverContent.picture.querySelector('img').src})`;
    featureBlock.querySelector('.feature-title').innerHTML = layoverContent.title.innerHTML;
    featureBlock.querySelector('.feature p').innerHTML = layoverContent.text.innerHTML;

    mobileDiv.append(...featureBlock.childNodes);
  });
}

/**
 * @typedef {Object} LayoverContent
 * @property {number} id
 * @property {HTMLElement} picture
 * @property {HTMLElement} category
 * @property {HTMLElement} title
 * @property {HTMLElement} text
 * @property {string} positionLeft
 * @property {string} positionTop
 */

/**
 *
 * @param block {HTMLDivElement} raw block with content
 * @return {LayoverContent[]}
 */
function parseLayoverContent(block) {
  const layoverContents = block.querySelectorAll(':scope > div:not(:first-child)');

  const layovers = [];

  let id = 1;

  layoverContents.forEach((layoverContent) => {
    const picture = layoverContent.querySelector('picture');

    // this is based on order, not header level
    const category = layoverContent.querySelector('h2, h3, h4, h5, h6');
    category.remove();

    const title = layoverContent.querySelector('h2, h3, h4, h5, h6');
    title.remove();

    const text = layoverContent.querySelector('p:not(:has(picture))');

    const positionLeft = layoverContent.querySelector(':scope > div:nth-child(2)').textContent;
    const positionTop = layoverContent.querySelector(':scope > div:nth-child(3)').textContent;

    layovers.push({
      id,
      picture,
      category,
      title,
      text,
      positionLeft,
      positionTop,
    });
    id += 1;
  });

  return layovers;
}

export default function decorate(block) {
  const firstBlockRow = block.querySelector(':scope > div');
  const firstImage = firstBlockRow.querySelector('img');
  const title = firstBlockRow.querySelector('h1, h2');

  const description = firstBlockRow.querySelector('p');

  const layoverContents = parseLayoverContent(block);

  hotspotBlockCounter += 1;

  block.innerHTML = `
    <div class="main">
        <div class="hotspot-mobile"></div>
    </div>
    <!--    TODO: data-hotspot-target="1" -->
    <div class="hotspot-layover" data-hotspot-target="${hotspotBlockCounter}" style="display: none;"></div>
  `;

  decorateDesktopImageWithHotspots(block.children[0], firstImage, title, description, layoverContents);

  layoverContents.forEach((hotspot) => {
    addSpot(block.children[0], hotspot);
  });

  decorateMobileFeatureImages(block.children[0], layoverContents, block);
  decorateDesktopLayoverBox(block.children[1], layoverContents, block);

  block.children[1].addEventListener('click', (event) => {
    const layoverDialog = block.querySelector('.hotspot-layover-box.is-active');
    handleCloseLayover(event, layoverDialog, block);
  });

  decorateIcons(block);
}

// TODO: add support for multiple hotspots
// Get all elements with the attribute 'hotspot-target-id'
// const hotspotTargetIdElements = document.querySelectorAll('[hotspot-target-id]');
//
// // Iterate through each hotspot target ID element
// hotspotTargetIdElements.forEach((hotspotTargetId) => {
//   // Add a click event listener for the hotspot target ID element
//   hotspotTargetId.addEventListener('click', function () {
//     // Check if the element is not active
//     if (!hotspotTargetId.classList.contains('active')) {
//       // Remove the active class from other active elements
//       const activeElements = document.querySelectorAll('[hotspot-target-id].active');
//       activeElements.forEach((activeElement) => {
//         activeElement.classList.remove('active');
//       });
//
//       // Scroll to the top of the page
//       window.scrollTo(0, 0);
//
//       // Add the active class to the current element
//       this.classList.add('active');
//
//       // Get the target ID
//       const id = hotspotTargetId.getAttribute('hotspot-target-id');
//
//       // Remove the active class from other active hotspot areas
//       const activeHotspotAreas = document.querySelectorAll('.hotspot-area.active');
//       activeHotspotAreas.forEach((activeHotspotArea) => {
//         activeHotspotArea.classList.remove('active');
//       });
//
//       // Add the active class to the target hotspot area
//       const targetHotspotArea = document.querySelector(`[hotspot-id="${id}"]`);
//       targetHotspotArea.classList.add('active');
//     }
//   });
// });
