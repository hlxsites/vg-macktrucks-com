import {
  addVideoConfig,
  getVideoConfig,
} from '../../scripts/video-helper.js';

const blockName = 'v2-embed';

function logVideoEvent(eventName, videoId, timeStamp) {
  // eslint-disable-next-line no-console
  console.info(`[${blockName}] ${eventName} for ${videoId} at ${timeStamp}`);
}

function formatDebugTime(date) {
  const timeOptions = {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${formattedTime}.${milliseconds}`;
}

export default function decorate(block) {
  const isAutoplay = block.classList.contains('autoplay');
  const isLoopedVideo = block.classList.contains('loop');
  const isDisableControls = block.classList.contains('disable-controls');
  const isDisablePictureInPicture = block.classList.contains('disable-picture-in-picture');
  const link = block.querySelector('a').getAttribute('href');
  const title = block.querySelector('a').textContent;
  const regex = /urn:aaid:aem:[0-9a-fA-F-]+/;
  const match = link.match(regex);

  if (!link) {
    // eslint-disable-next-line no-console
    console.warn('[V2 Video Embed block]: There is no video link');
    return;
  }

  if (match) {
    [block.videoId] = match;
  } else {
    // eslint-disable-next-line no-console
    console.warn('[V2 Video Embed block]: Video link is incorrect: ', link);
  }

  if (isAutoplay) {
    addVideoConfig(block.videoId, { autoplay: 'any', muted: true });
  }

  if (isLoopedVideo) {
    addVideoConfig(block.videoId, { loop: true });
  }

  if (isDisableControls) {
    addVideoConfig(block.videoId, { controls: false, controlBar: false });
  }

  if (isDisablePictureInPicture) {
    addVideoConfig(block.videoId, { disablePictureInPicture: true });
  }

  window.addEventListener('message', (event) => {
    if (event.data.name === 'video-config') {
      if (event.data.videoId === block.videoId) {
        event.source.postMessage(JSON.stringify(getVideoConfig(block.videoId)), '*');
      }
    }

    // TODO: add code to handle other video events
    if (event.data.type === 'embedded-video-player-event') {
      const timeStamp = formatDebugTime(new Date());
      switch (event.data.name) {
        case 'video-playing':
          logVideoEvent(event.data.name, event.data.videoId, timeStamp);
          break;
        case 'video-play':
          logVideoEvent(event.data.name, event.data.videoId, timeStamp);
          break;
        case 'video-ended':
          logVideoEvent(event.data.name, event.data.videoId, timeStamp);
          break;
        case 'video-loadedmetadata':
          logVideoEvent(event.data.name, event.data.videoId, timeStamp);
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
