import {
  checkOneTrustGroup,
  createElement,
  deepMerge,
  getTextLabel,
} from './common.js';
import {
  AEM_ASSETS,
  COOKIE_VALUES,
} from './constants.js';

const { videoURLRegex } = AEM_ASSETS;

export const videoTypes = {
  aem: 'aem',
  youtube: 'youtube',
  local: 'local',
  both: 'both',
};

export const standardVideoConfig = {
  autoplay: false,
  muted: false,
  controls: true,
  disablePictureInPicture: false,
  currentTime: 0,
  playsinline: true,
};

export const videoConfigs = {};

export const addVideoConfig = (videoId, props = {}) => {
  if (!videoConfigs[videoId]) {
    videoConfigs[videoId] = deepMerge({}, standardVideoConfig);
  }
  deepMerge(videoConfigs[videoId], props);
};

export const getVideoConfig = (videoId) => videoConfigs[videoId];

export function isLowResolutionVideoUrl(url) {
  return url.split('?')[0].endsWith('.mp4');
}

export function isAEMVideoUrl(url) {
  return videoURLRegex.test(url);
}

export function isVideoLink(link) {
  const linkString = link.getAttribute('href');
  return (linkString.includes('youtube.com/embed/')
    || videoURLRegex.test(linkString)
    || isLowResolutionVideoUrl(linkString))
    && link.closest('.block.embed') === null;
}

export function selectVideoLink(links, preferredType, videoType = videoTypes.both) {
  const hasConsentForSocialVideos = checkOneTrustGroup(COOKIE_VALUES.social);
  const isTypeBoth = videoType === videoTypes.both;
  const prefersYouTube = (hasConsentForSocialVideos && preferredType !== 'local')
                      || (!isTypeBoth && videoType === videoTypes.youtube);

  const findLinkByCondition = (conditionFn) => links.find((link) => conditionFn(link.getAttribute('href')));

  const aemVideoLink = findLinkByCondition((href) => videoURLRegex.test(href));
  const youTubeLink = findLinkByCondition((href) => href.includes('youtube.com/embed/'));
  const localMediaLink = findLinkByCondition((href) => href.split('?')[0].endsWith('.mp4'));

  if (aemVideoLink) return aemVideoLink;
  if (prefersYouTube && youTubeLink) return youTubeLink;
  return localMediaLink;
}

export function createLowResolutionBanner() {
  const lowResolutionMessage = getTextLabel('Low resolution video message');
  const changeCookieSettings = getTextLabel('Change cookie settings');

  const banner = createElement('div', { classes: 'low-resolution-banner' });
  banner.innerHTML = `${lowResolutionMessage} <button class="low-resolution-banner-cookie-settings">${changeCookieSettings}</button>`;
  banner.querySelector('button').addEventListener('click', () => {
    window.OneTrust.ToggleInfoDisplay();
  });

  return banner;
}

export function showVideoModal(linkUrl) {
  // eslint-disable-next-line import/no-cycle
  import('../common/modal/modal-component.js').then((modal) => {
    let beforeBanner = {};

    if (isLowResolutionVideoUrl(linkUrl)) {
      beforeBanner = createLowResolutionBanner();
    }

    modal.showModal(linkUrl, beforeBanner);
  });
}

export function addVideoShowHandler(link) {
  link.classList.add('text-link-with-video');

  link.addEventListener('click', (event) => {
    event.preventDefault();

    showVideoModal(link.getAttribute('href'));
  });
}

export function isSoundcloudLink(link) {
  return link.getAttribute('href').includes('soundcloud.com/player')
    && link.closest('.block.embed') === null;
}

export function addSoundcloudShowHandler(link) {
  link.classList.add('text-link-with-soundcloud');

  link.addEventListener('click', (event) => {
    event.preventDefault();

    const thumbnail = link.closest('div')?.querySelector('picture');
    const title = link.closest('div')?.querySelector('h1, h2, h3');
    const text = link.closest('div')?.querySelector('p:not(.button-container, .image)');

    // eslint-disable-next-line import/no-cycle
    import('../common/modal/modal-component.js').then((modal) => {
      const episodeInfo = document.createElement('div');
      episodeInfo.classList.add('modal-soundcloud');
      episodeInfo.innerHTML = `<div class="episode-image"><picture></div>
      <div class="episode-text">
          <h2></h2>
          <p></p>
      </div>`;
      episodeInfo.querySelector('picture').innerHTML = thumbnail?.innerHTML || '';
      episodeInfo.querySelector('h2').innerText = title?.innerText || '';
      episodeInfo.querySelector('p').innerText = text?.innerText || '';

      modal.showModal(link.getAttribute('href'), null, episodeInfo);
    });
  });
}

export function addPlayIcon(parent) {
  const iconWrapper = createElement('div', { classes: 'video-icon-wrapper' });
  const icon = createElement('i', { classes: ['fa', 'fa-play', 'video-icon'] });
  iconWrapper.appendChild(icon);
  parent.appendChild(iconWrapper);
}

export function wrapImageWithVideoLink(videoLink, image) {
  videoLink.innerText = '';
  videoLink.appendChild(image);
  videoLink.classList.add('link-with-video');
  videoLink.classList.remove('button', 'primary', 'text-link-with-video');

  addPlayIcon(videoLink);
}

export function createIframe(url, { parentEl, classes = [] }) {
  // iframe must be recreated every time otherwise the new history record would be created
  const iframe = createElement('iframe', {
    classes: Array.isArray(classes) ? classes : [classes],
    props: {
      frameborder: '0',
      allowfullscreen: true,
      src: url,
    },
  });

  if (parentEl) {
    parentEl.appendChild(iframe);
  }

  return iframe;
}

/**
 * Creates a video element or an iframe for a video, depending on whether the video is local
 * or not. Configures the element with specified classes, properties, and source.
 *
 * @param {string} src The source URL of the video.
 * @param {string} [className=''] Optional. CSS class names to apply to the video element or iframe.
 * @param {Object} [props={}] Optional. Properties and attributes for the video element or iframe,
 *                            including attributes like 'muted', 'autoplay', 'title'. All properties
 *                            are applied as attributes.
 * @param {boolean} [localVideo=true] Optional. Indicates if the video is a local file. If true,
 *                                    creates a <video> element with a <source> child. If false,
 *                                    creates an iframe for an external video.
 * @param {string} [videoId=''] Optional. Identifier for the video, used for external video sources.
 * @returns {HTMLElement} The created video element (<video> or <iframe>) with specified configs.
 */
export const createVideo = (src, className = '', props = {}, localVideo = true, videoId = '') => {
  let video = '';

  if (localVideo) {
    video = createElement('video', {
      classes: className,
    });
    if (props.muted) {
      video.muted = props.muted;
    }

    if (props.autoplay) {
      video.autoplay = props.autoplay;
    }

    if (props) {
      Object.keys(props).forEach((propName) => {
        video.setAttribute(propName, props[propName]);
      });
    }

    const source = createElement('source', {
      props: {
        src,
        type: 'video/mp4',
      },
    });

    video.appendChild(source);
  } else {
    addVideoConfig(videoId, props);

    video = createElement('iframe', {
      classes: className,
      props: {
        allow: 'autoplay; fullscreen',
        allowfullscreen: true,
        title: props.title,
        src,
      },
    });
  }

  return video;
};

const logVideoEvent = (eventName, videoId, timeStamp, blockName = 'video') => {
  // eslint-disable-next-line no-console
  console.info(`[${blockName}] ${eventName} for ${videoId} at ${timeStamp}`);
};

const formatDebugTime = (date) => {
  const timeOptions = {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${formattedTime}.${milliseconds}`;
};

export const handleVideoMessage = (event, videoId, blockName = 'video') => {
  if (event.data.type === 'embedded-video-player-event') {
    const timeStamp = formatDebugTime(new Date());
    switch (event.data.name) {
      case 'video-playing':
      case 'video-play':
      case 'video-ended':
      case 'video-loadedmetadata':
        logVideoEvent(event.data.name, event.data.videoId, timeStamp, blockName);
        break;
      default:
        break;
    }
  } if (event.data.name === 'video-config' && event.data.videoId === videoId) {
    // eslint-disable-next-line no-console
    console.info('Sending video config:', getVideoConfig(videoId));
    event.source.postMessage(JSON.stringify(getVideoConfig(videoId)), '*');
  }
};
