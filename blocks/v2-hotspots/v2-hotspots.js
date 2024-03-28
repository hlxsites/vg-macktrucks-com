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
    props: { href: '#' },
  });
  iconLink.dataset.spot = hotspot.id;
  iconLink.style.left = hotspot.positionLeft;
  iconLink.style.top = hotspot.positionTop;
  iconLink.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3444 25.0722L25.0723 12.3443L23.6581 10.9301L10.9302 23.658L12.3444 25.0722Z" fill="var(--c-primary-white)"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3444 10.9301L10.9302 12.3443L23.6581 25.0722L25.0723 23.658L12.3444 10.9301Z" fill="var(--c-primary-white)"/>
    </svg>
  `;

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
        <div class="hotspot-layover-title">
          <h3></h3>
        </div>
          <div class="hotspot-layover-thumb" style="background-image: url();"></div>
          <div class="hotspot-layover-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3444 25.0722L25.0723 12.3443L23.6581 10.9301L10.9302 23.658L12.3444 25.0722Z" fill="var(--c-primary-black)"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3444 10.9301L10.9302 12.3443L23.6581 25.0722L25.0723 23.658L12.3444 10.9301Z" fill="var(--c-primary-black)"/>
            </svg>
          </div>
        <div class="hotspot-layover-text">
        </div>
        <div class="hotspot-layover-controls">
            <a class="hotspot-layover-button prev">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <path d="M21.6298 9.03663C21.6298 9.36032 21.4981 9.67075 21.2636 9.89963C21.0292 10.1285 20.7113 10.2571 20.3797 10.2571H5.06695L10.4316 15.495C10.5482 15.6083 10.6406 15.7431 10.7037 15.8914C10.7668 16.0398 10.7993 16.1988 10.7993 16.3595C10.7993 16.5201 10.7668 16.6791 10.7037 16.8275C10.6406 16.9758 10.5482 17.1106 10.4316 17.224C10.1957 17.4513 9.87764 17.5787 9.5462 17.5787C9.21476 17.5787 8.89665 17.4513 8.66077 17.224L1.16063 9.90113C1.04409 9.78774 0.951628 9.65301 0.888537 9.50466C0.825446 9.35631 0.792969 9.19726 0.792969 9.03663C0.792969 8.876 0.825446 8.71695 0.888537 8.56859C0.951628 8.42024 1.04409 8.28551 1.16063 8.17213L8.66077 0.849299C8.8956 0.620019 9.2141 0.491211 9.5462 0.491211C9.71064 0.491211 9.87347 0.522834 10.0254 0.584275C10.1773 0.645716 10.3154 0.735771 10.4316 0.849299C10.5479 0.962827 10.6401 1.0976 10.7031 1.24594C10.766 1.39427 10.7984 1.55325 10.7984 1.7138C10.7984 1.87435 10.766 2.03333 10.7031 2.18166C10.6401 2.33 10.5479 2.46477 10.4316 2.5783L5.06695 7.81616H20.3797C20.7113 7.81616 21.0292 7.94474 21.2636 8.17362C21.4981 8.40251 21.6298 8.71294 21.6298 9.03663Z" fill="#09161F"/>
                </svg>
            </a>
            <span class="hotspot-layover-pagination"></span>
            <a class="hotspot-layover-button next">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
                    <path d="M20.2006 9.90113L12.9348 17.224C12.7063 17.4513 12.3981 17.5787 12.077 17.5787C11.756 17.5787 11.4478 17.4513 11.2193 17.224C11.1064 17.1106 11.0168 16.9758 10.9557 16.8275C10.8946 16.6791 10.8631 16.5201 10.8631 16.3595C10.8631 16.1988 10.8946 16.0398 10.9557 15.8914C11.0168 15.7431 11.1064 15.6083 11.2193 15.495L16.4163 10.2571H1.58205C1.26089 10.2571 0.952875 10.1285 0.725776 9.89963C0.498677 9.67075 0.371094 9.36032 0.371094 9.03663C0.371094 8.71294 0.498677 8.40251 0.725776 8.17362C0.952875 7.94474 1.26089 7.81616 1.58205 7.81616H16.4163L11.2193 2.5783C10.9918 2.34902 10.864 2.03805 10.864 1.7138C10.864 1.55325 10.8954 1.39427 10.9563 1.24594C11.0173 1.0976 11.1066 0.962827 11.2193 0.849299C11.3319 0.735771 11.4656 0.645716 11.6128 0.584275C11.76 0.522834 11.9177 0.491211 12.077 0.491211C12.3988 0.491211 12.7073 0.620019 12.9348 0.849299L20.2006 8.17213C20.3134 8.28551 20.403 8.42024 20.4641 8.56859C20.5253 8.71695 20.5567 8.876 20.5567 9.03663C20.5567 9.19726 20.5253 9.35631 20.4641 9.50466C20.403 9.65301 20.3134 9.78774 20.2006 9.90113Z" fill="#09161F"/>
                </svg>
            </a>
        </div>
    </div>`;

  const dialog = container.querySelector('.hotspot-layover-box');
  dialog.dataset.hotspotContent = hotspot.id.toString();
  dialog.querySelector('.hotspot-layover-thumb').style.backgroundImage = `url(${hotspot.picture.querySelector('img').src})`;
  dialog.querySelector('.hotspot-layover-title h3').innerHTML = hotspot.title.innerHTML;
  hotspot.text.forEach((p) => {
    const pEl = createElement('p', { classes: 'large' });
    pEl.innerHTML = p.innerHTML;
    dialog.querySelector('.hotspot-layover-text').appendChild(pEl);
  });

  // don't close if clicked on sidebar
  dialog.addEventListener('click', (event) => event.stopPropagation());

  dialog.querySelector('.hotspot-layover-close')
    .addEventListener('click', (event) => handleCloseLayover(event, dialog, block));

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
      <a class="hotspot-mobile-button prev">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path d="M21.6298 9.03663C21.6298 9.36032 21.4981 9.67075 21.2636 9.89963C21.0292 10.1285 20.7113 10.2571 20.3797 10.2571H5.06695L10.4316 15.495C10.5482 15.6083 10.6406 15.7431 10.7037 15.8914C10.7668 16.0398 10.7993 16.1988 10.7993 16.3595C10.7993 16.5201 10.7668 16.6791 10.7037 16.8275C10.6406 16.9758 10.5482 17.1106 10.4316 17.224C10.1957 17.4513 9.87764 17.5787 9.5462 17.5787C9.21476 17.5787 8.89665 17.4513 8.66077 17.224L1.16063 9.90113C1.04409 9.78774 0.951628 9.65301 0.888537 9.50466C0.825446 9.35631 0.792969 9.19726 0.792969 9.03663C0.792969 8.876 0.825446 8.71695 0.888537 8.56859C0.951628 8.42024 1.04409 8.28551 1.16063 8.17213L8.66077 0.849299C8.8956 0.620019 9.2141 0.491211 9.5462 0.491211C9.71064 0.491211 9.87347 0.522834 10.0254 0.584275C10.1773 0.645716 10.3154 0.735771 10.4316 0.849299C10.5479 0.962827 10.6401 1.0976 10.7031 1.24594C10.766 1.39427 10.7984 1.55325 10.7984 1.7138C10.7984 1.87435 10.766 2.03333 10.7031 2.18166C10.6401 2.33 10.5479 2.46477 10.4316 2.5783L5.06695 7.81616H20.3797C20.7113 7.81616 21.0292 7.94474 21.2636 8.17362C21.4981 8.40251 21.6298 8.71294 21.6298 9.03663Z" fill="#09161F"/>
        </svg>
      </a>
      <span class="hotspot-mobile-pagination">${idx + 1}/${allFeatures.length}</span>
      <a class="hotspot-mobile-button next">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
            <path d="M20.2006 9.90113L12.9348 17.224C12.7063 17.4513 12.3981 17.5787 12.077 17.5787C11.756 17.5787 11.4478 17.4513 11.2193 17.224C11.1064 17.1106 11.0168 16.9758 10.9557 16.8275C10.8946 16.6791 10.8631 16.5201 10.8631 16.3595C10.8631 16.1988 10.8946 16.0398 10.9557 15.8914C11.0168 15.7431 11.1064 15.6083 11.2193 15.495L16.4163 10.2571H1.58205C1.26089 10.2571 0.952875 10.1285 0.725776 9.89963C0.498677 9.67075 0.371094 9.36032 0.371094 9.03663C0.371094 8.71294 0.498677 8.40251 0.725776 8.17362C0.952875 7.94474 1.26089 7.81616 1.58205 7.81616H16.4163L11.2193 2.5783C10.9918 2.34902 10.864 2.03805 10.864 1.7138C10.864 1.55325 10.8954 1.39427 10.9563 1.24594C11.0173 1.0976 11.1066 0.962827 11.2193 0.849299C11.3319 0.735771 11.4656 0.645716 11.6128 0.584275C11.76 0.522834 11.9177 0.491211 12.077 0.491211C12.3988 0.491211 12.7073 0.620019 12.9348 0.849299L20.2006 8.17213C20.3134 8.28551 20.403 8.42024 20.4641 8.56859C20.5253 8.71695 20.5567 8.876 20.5567 9.03663C20.5567 9.19726 20.5253 9.35631 20.4641 9.50466C20.403 9.65301 20.3134 9.78774 20.2006 9.90113Z" fill="#09161F"/>
        </svg>
      </a>
    `;

    feature.querySelector('.feature-pagination').innerHTML = paginationStructure;
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
