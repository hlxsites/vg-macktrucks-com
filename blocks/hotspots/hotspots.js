import { decorateIcons } from '../../scripts/lib-franklin.js';

/**
 *
 * @param event
 * @param layoverDialog {HtmlDialogElement}
 */
function handleCloseLayover(event, layoverDialog) {
  console.log('handleCloseLayover');
  layoverDialog.close();
  // container.addEventListener('click', function () {
  //   document.querySelectorAll('[spot]')
  //     .forEach(function (spot) {
  //       spot.classList.remove('active-spot');
  //     });
  //   content.classList.remove('is-active');
  //   content.parentElement.classList.remove('is-active');
  //   setTimeout(function () {
  //     content.parentElement.style.display = 'none';
  //   }, 300);
  // });
}

function handleClickHotspot(event, iconLink, hotspotId, block) {
  event.preventDefault();
  console.log('clicked ', hotspotId);

  iconLink.classList.add('active-spot');

  const allLayovers = block.querySelector('.hotspot-layover');
  allLayovers.style.display = 'block';
  allLayovers.classList.add('is-active');

  const layoverDialog = allLayovers.querySelector(`.hotspot-layover-box[data-hotspot-content="${hotspotId}"]`);
  layoverDialog.classList.add('is-active');
  layoverDialog.showModal();
}

/**
 *
 * @param hotspotsBlock {HTMLDivElement}
 * @param firstImage {HTMLPictureElement}
 * @param title {HTMLElement}
 * @param description {HTMLElement}
 * @param layoverContents {LayoverContent[]}
 */
function decorateImageWithHotspots(hotspotsBlock, firstImage, title, description, layoverContents) {
  // TODO: set data-hotspot="1" data-fade-object="true"  style="opacity: 1;"
  hotspotsBlock.innerHTML = `<div class="hotspot animated" data-hotspot="1" data-fade-object="true" style="opacity: 1;">

<!-- TODO: set stand="" up="" sleeper="" -->
    <img class="hotspot-bg-img desktop" alt="Three-quarter view of a black Mack Anthem 70" stand="" up="" sleeper="" src="">
    <!--    TODO: mobile image-->
    <img class="hotspot-bg-img mobile" alt="Three-quarter view of a black Mack Anthem 70" stand="" up="" sleeper="" src="">

    <div class="hotspot-content content-wrapper ">
        <h1 class="hotspot-header"></h1>
        <p class="hotspot-text reduced-width"></p>
    </div>

    <div class="hotspot-icon-set">
        <a href="#" class="hotspot-icon" style="left: 0; top: 0;" data-spot="0">
            <img src="../../icons/hotspot.png" alt="Detail view of the Anthem air dam" />
        </a>
       
    </div>
</div>`;

  hotspotsBlock.querySelector('.hotspot-bg-img.desktop').src = firstImage.src;
  hotspotsBlock.querySelector('.hotspot-header')
    .append(...title.childNodes);
  hotspotsBlock.querySelector('.hotspot-text')
    .append(...description.childNodes);

  const iconSet = hotspotsBlock.querySelector('.hotspot-icon-set');
  const iconTemplate = iconSet.firstElementChild;
  iconTemplate.remove();
  layoverContents.forEach((hotspot) => {
    const iconLink = iconTemplate.cloneNode(true);
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
  });
}

/**
 *
 * @param layoverBlock
 * @param layoverContents {LayoverContent[]}
 */
function decorateLayoverBox(layoverBlock, layoverContents) {
  layoverContents.forEach((layoverContent) => {
    const box = document.createElement('div');
    box.innerHTML = `
<dialog class="hotspot-layover-box" data-hotspot-content="1">
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
            <span>TODO</span>
        </a>
        <a class="hotspot-layover-button next">
            <img src="../../icons/right-arrow-small.png" alt="Right arrow">
            <span>TODO</span>
        </a>
    </div>
</dialog>`;

    box.querySelector('.hotspot-layover-box').dataset.hotspotContent = layoverContent.id.toString();
    box.querySelector('.hotspot-layover-thumb').style.backgroundImage = `url(${layoverContent.picture.querySelector('img').src})`;
    box.querySelector('.hotspot-layover-text h5').append(...layoverContent.category.childNodes);
    box.querySelector('.hotspot-layover-text h3').append(...layoverContent.title.childNodes);
    box.querySelector('.hotspot-layover-text p').append(...layoverContent.text.childNodes);
    // TODO: link prev / next
    // eslint-disable-next-line max-len
    // box.querySelector('.hotspot-layover-button.prev span').append(...prevButtonContent.childNodes);
    // eslint-disable-next-line max-len
    // box.querySelector('.hotspot-layover-button.next span').append(...nextButtonContent.childNodes);

    // don't close if clicked on sidebar
    box.addEventListener('click', (event) => {
      event.stopPropagation(); // TODO: implement differently
    });

    const layoverDialog = box.querySelector('dialog');

    box.querySelector('.hotspot-layover-close')
      .addEventListener('click', (event) => {
        handleCloseLayover(event, layoverDialog);
      });

    layoverBlock.append(...box.childNodes);
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

  block.innerHTML = `
    <div class="main"></div>
    <!--    TODO: data-hotspot-target="1" -->
    <div class="hotspot-layover" data-hotspot-target="1" style="display: none;"></div>
  `;

  decorateImageWithHotspots(block.children[0], firstImage, title, description, layoverContents);
  decorateLayoverBox(block.children[1], layoverContents);
  // TODO: clean
  // block.children[1].addEventListener('click', (event) =>
  // handleCloseLayover(event, block.children[1]));

  decorateIcons(block);
}
