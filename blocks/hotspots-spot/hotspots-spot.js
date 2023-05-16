import { addSpot } from '../hotspots/hotspots.js';

/**
 *
 * @param block {HTMLDivElement} raw block with content
 * @return {HotspotContent}
 */
function parseHotspotContent(block) {
  const picture = block.querySelector('picture img').src;
  // remove the paragraph that contains the picture to avoid finding it when looking for text
  block.querySelector('picture').closest('p').remove();

  // this is based on order, not header level
  const category = block.querySelector('p, h1, h2, h3, h4, h5, h6');
  category?.remove();

  const title = block.querySelector('p, h1, h2, h3, h4, h5, h6');
  title?.remove();

  const text = block.querySelector('p');

  const positionRegExp = /position-([0-9]+)-([0-9]+)/;
  const positionClass = [...block.classList].find((el) => positionRegExp.test(el));
  const positionMatch = positionClass.match(positionRegExp);

  const positionLeft = `${positionMatch[1].trim()}%`;
  const positionTop = `${positionMatch[2].trim()}%`;

  return {
    picture,
    category,
    title,
    text,
    positionLeft,
    positionTop,
  };
}

export default function decorate(block) {
  const hotspotsBlock = block.closest('.hotspots-container').querySelector('.hotspots.block');

  const hotspot = parseHotspotContent(block);
  addSpot(hotspotsBlock, hotspot);

  // Content was added to ther block, therefore we can remove it
  block.remove();
}
