import { addSpot } from '../hotspots/hotspots.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const hotspotsBlock = block.closest('.hotspots-container').querySelector('.hotspots.block');

  const config = readBlockConfig(block);
  /**
   * @type {HotspotContent}
   */
  const hotspot = {
    title: config.title,
    text: config.description,
    image: config.image,
    positionLeft: config['spot-left'],
    positionTop: config['spot-top'],

    picture: config.image,
    category: config.subtitle,

  };
  addSpot(hotspotsBlock, hotspot, null, null);

  // Content was added to ther block, therefore we can remove it
  block.remove();
}
