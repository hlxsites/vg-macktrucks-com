/* eslint-disable no-console */
import {
  standardVideoConfig,
} from '../../scripts/video-helper.js';

const blockName = 'v2-embed';

export default function decorate(block) {
  const link = block.querySelector('a').getAttribute('href');
  const title = block.querySelector('a').textContent;

  if (!link) {
    /* eslint-disable-next-line no-console */
    console.warn('V2 Video Embed block: There is no video link. Please check if the fallback video link is provided.');
    return;
  }

  window.addEventListener('message', (event) => {
    if (event.data.name === 'video-config') {
      event.source.postMessage(JSON.stringify(standardVideoConfig), '*');
    }

    if (event.data.type === 'embedded-video-player-event') {
      switch (event.data.name) {
        case 'video-playing':
          /* eslint-disable-next-line no-console */
          console.info(`[parent] [playing] ${event.data.name} for ${event.data.videoId} ${Date.now()}`);
          break;
        case 'video-play':
          /* eslint-disable-next-line no-console */
          console.info(`[parent] [play] ${event.data.name} for ${event.data.videoId} ${Date.now()}`);
          break;
        case 'video-ended':
          /* eslint-disable-next-line no-console */
          console.info(`[parent] [ended] ${event.data.name} for ${event.data.videoId} ${Date.now()}`);
          break;
        case 'video-loadedmetadata':
          /* eslint-disable-next-line no-console */
          console.info(`[parent] [loadedmetadata] ${event.data.name} for ${event.data.videoId} ${Date.now()}`);
          break;
        default:
          break;
      }
    }
  });

  const videoFrame = document.createRange().createContextualFragment(`
  <iframe class="${blockName}__frame"
    allowfullscreen
    title="${title}"
    src="${link}">
  </iframe>
  `);

  block.innerHTML = '';
  block.append(videoFrame);
}
