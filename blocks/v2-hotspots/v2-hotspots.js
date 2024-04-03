import { decorateIcons } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/common.js';

/**
 * @typedef {Object} HotspotContent
 *
 * @property {number} id
 * @property {HTMLPictureElement} picture
 * @property {HTMLElement} category
 * @property {HTMLElement} title
 * @property {HTMLElement} text
 * @property {string} positionLeft
 * @property {string} positionTop
 */

let hotspotBlockCounter = 0;
const blockName = 'v2-hotspots';

export default function decorate(block) {
  const firstBlockRow = block.querySelector(':scope > div');
  const firstPicture = firstBlockRow.querySelector('picture');
  const title = firstBlockRow.querySelector('h1, h2');

  // every instance of this block needs a unique id.
  hotspotBlockCounter += 1;
  block.closest(`.section.${blockName}-container`).dataset.hotspotAreaId = hotspotBlockCounter;
  // first hotspots group is active by default (used for mobile view)
  if (hotspotBlockCounter === 1) {
    block.closest(`.section.${blockName}-container`).classList.add('active');
  }

  block.innerHTML = `
    <div class="main">
        <div class="hotspot-mobile"></div>
    </div>
    <div class="hotspot-layover" style="display: none;"></div>
  `;

  decorateImageAndTitle(block.querySelector('.main'), firstPicture, title);

  block.querySelector('.hotspot-layover')
    .addEventListener('click', (event) => {
      const layoverDialog = block.querySelector('.hotspot-layover-box.is-active');
      handleCloseLayover(event, layoverDialog, block);
    });

  decorateIcons(block);
}

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
 * @param block
 * @param index {number} 0-based index of the linked dialog
 */
function switchToOtherHotspot(block, index) {
  const dialogs = block.querySelectorAll('.hotspot-layover-box');
  dialogs.forEach((box) => box.classList.add('no-animation'));
  dialogs.forEach((box) => box.classList.remove('is-active'));

  block.querySelectorAll('.hotspot-icon-set .active-spot')
    .forEach((spot) => spot.classList.remove('active-spot'));

  const switchTo = dialogs[index];
  switchTo.classList.add('is-active');

  // activate the hotspot icon that links to the dialog
  block.querySelector(`[data-spot="${switchTo.dataset.hotspotContent}"]`).classList.add('active-spot');

  // open the new dialog
  setTimeout(() => {
    // workaround: for some reason the animation is still played when the class is added immediately
    block.querySelectorAll('.hotspot-layover-box')
      .forEach((box) => box.classList.remove('no-animation'));
  }, 0);
}

function addDesktopHotspotIcon(hotspot, block, main) {
  const iconLink = createElement('a', {
    classes: 'hotspot-icon',
    props: {
      href: '#',
      'data-spot': hotspot.id,
      style: `left: ${hotspot.positionLeft}; top: ${hotspot.positionTop};`,
    },
  });

  const plusIcon = createElement('img', { props: { src: '/icons/plus.svg' } });
  iconLink.appendChild(plusIcon);

  iconLink.onclick = (event) => handleClickHotspot(
    event,
    iconLink,
    hotspot.id,
    block,
  );

  main.querySelector('.hotspot-icon-set').append(iconLink);
}

function addDesktopLayover(hotspot, block) {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="hotspot-layover-box" data-hotspot-content="1">
      <h3></h3>
      <div class="hotspot-layover-thumb" style="background-image: url();"></div>
      <div class="hotspot-layover-close"></div>
      <div class="hotspot-layover-text"></div>
      <div class="hotspot-layover-controls">
        <a class="hotspot-layover-button prev"></a>
        <span class="hotspot-layover-pagination"></span>
        <a class="hotspot-layover-button next"></a>
      </div>
    </div>`;

  const dialog = container.querySelector('.hotspot-layover-box');
  dialog.dataset.hotspotContent = hotspot.id.toString();
  dialog.querySelector('.hotspot-layover-thumb').style.backgroundImage = `url(${hotspot.picture.querySelector('img').src})`;
  dialog.querySelector('h3').innerHTML = hotspot.title.innerHTML;
  hotspot.text.forEach((p) => {
    const pEl = createElement('p', { classes: 'large' });
    pEl.innerHTML = p.innerHTML;
    dialog.querySelector('.hotspot-layover-text').appendChild(pEl);
  });

  dialog.querySelectorAll('.hotspot-layover-button').forEach((arrow) => {
    const image = createElement('img', { props: { src: '/icons/arrow-right.svg' } });
    arrow.appendChild(image);
  });

  // don't close if clicked on sidebar
  dialog.addEventListener('click', (event) => event.stopPropagation());

  const closeBtn = dialog.querySelector('.hotspot-layover-close');
  closeBtn.addEventListener('click', (event) => handleCloseLayover(event, dialog, block));

  const closeIcon = createElement('img', { props: { src: '/icons/close.svg' } });
  closeBtn.appendChild(closeIcon);

  block.querySelector('.hotspot-layover').append(...container.childNodes);
}

function addMobileAlternativeCards(hotspot, main) {
  // using styles from "hotspots-features.css"
  const featureBlock = document.createElement('div');
  featureBlock.innerHTML = `
    <div class="features number-${hotspot.id}" data-fade-object="true">
        <div class="row">
            <div class="feature">
                <h4 class="feature-title"></h4>
                <picture></picture>
                <div class="feature-text"></div>
            </div>
            <div class='feature-pagination'></div>
        </div>
    </div>
  `;

  featureBlock.querySelector('picture').innerHTML = hotspot.picture.innerHTML;
  featureBlock.querySelector('.feature-title').innerHTML = hotspot.title.innerHTML;
  if (Number(hotspot.id) === 1) featureBlock.querySelector('.features').classList.add('is-active');

  hotspot.text.forEach((p) => {
    const pEl = createElement('p');
    pEl.innerHTML = p.innerHTML;
    featureBlock.querySelector('.feature-text').append(pEl);
  });

  const mobileDiv = main.querySelector('.hotspot-mobile');
  mobileDiv.append(...featureBlock.childNodes);
}

function updateDesktopLayoverBeforeAndNextButtons(block) {
  const dialogs = block.querySelectorAll('.hotspot-layover-box');
  dialogs.forEach((dialog, index) => {
    const prevIndex = index === 0 ? dialogs.length - 1 : index - 1;
    dialog.querySelector('.hotspot-layover-button.prev')
      .addEventListener('click', () => switchToOtherHotspot(block, prevIndex));

    const nextIndex = index === dialogs.length - 1 ? 0 : index + 1;
    dialog.querySelector('.hotspot-layover-button.next')
      .addEventListener('click', () => switchToOtherHotspot(block, nextIndex));

    dialog.querySelector('span.hotspot-layover-pagination').innerHTML = `${prevIndex + 1}/${dialogs.length}`;
  });
}

function addPaginationButtonsOnMobile(block) {
  const allFeatures = block.querySelectorAll('.features');
  allFeatures.forEach((feature, idx) => {
    const paginationStructure = `
      <a class="hotspot-mobile-button prev"></a>
      <span class="hotspot-mobile-pagination">${idx + 1}/${allFeatures.length}</span>
      <a class="hotspot-mobile-button next"></a>
    `;
    feature.querySelector('.feature-pagination').innerHTML = paginationStructure;

    feature.querySelectorAll('.hotspot-mobile-button').forEach((arrow) => {
      const image = createElement('img', { props: { src: '/icons/arrow-right.svg' } });
      arrow.appendChild(image);
    });
  });
}

function updateLayoutSlide(event, clickedNum) {
  const slideNumber = ((clickedNum > 3) && 1) || ((clickedNum < 1) && 3) || clickedNum;

  const clickedElmt = event.target.closest('.features');
  clickedElmt.classList.remove('is-active');

  clickedElmt.parentElement.querySelector(`.features.number-${slideNumber}`).classList.add('is-active');
}

function updateFeatureOnMobile(block) {
  const dialogs = block.querySelectorAll('.features');

  dialogs.forEach((dialog, idx) => {
    dialog.querySelector(`.features.number-${idx + 1} .hotspot-mobile-button.prev`).onclick = (e) => updateLayoutSlide(e, idx);
    dialog.querySelector(`.features.number-${idx + 1} .hotspot-mobile-button.next`).onclick = (e) => updateLayoutSlide(e, idx + 2);
  });
}

/**
 *
 * @param block
 * @param hotspot {HotspotContent}
 */
export function addSpot(block, hotspot) {
  // desktop hotspot icon
  const main = block.querySelector('.main');

  // keep track of the number of hotspots in the DOM
  main.dataset.hotspotCounter = (+main.dataset.hotspotCounter || 0) + 1;
  hotspot.id = main.dataset.hotspotCounter;
  addDesktopHotspotIcon(hotspot, block, main);
  addDesktopLayover(hotspot, block);

  updateDesktopLayoverBeforeAndNextButtons(block);

  addMobileAlternativeCards(hotspot, main);

  addPaginationButtonsOnMobile(block);

  updateFeatureOnMobile(block);
}

/**
 *
 * @param mainDiv {HTMLDivElement}
 * @param firstPicture {HTMLPictureElement}
 * @param title {HTMLElement}
//  * @param description {HTMLElement}
 */
function decorateImageAndTitle(mainDiv, firstPicture, title) {
  const hotspot = createElement('div', { classes: ['hotspot', 'animated'] });
  hotspot.innerHTML = `
      <picture class="hotspot-bg-img desktop"></picture>
      <div class="hotspot-content content-wrapper ">
          <h1 class="hotspot-header with-marker"></h1>
          <p class="hotspot-text reduced-width"></p>
      </div>

      <div class="hotspot-icon-set"></div>`;

  hotspot.querySelector('.hotspot-bg-img.desktop').innerHTML = firstPicture.innerHTML;
  hotspot.querySelector('.hotspot-header').innerHTML = title.innerHTML;

  mainDiv.prepend(hotspot);
}
