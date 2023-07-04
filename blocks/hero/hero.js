import { createElement } from '../../scripts/scripts.js';

const decorateVideo = (link) => {
  const { parentElement } = link;
  const mediaParent = parentElement.closest('.hero-content-media');
  const video = createElement('video', ['hero-video', 'hide'], {
    loop: 'loop',
  });
  const source = createElement('source', '', { src: link.href, type: 'video/mp4' });
  video.appendChild(source);
  parentElement.appendChild(video);
  parentElement.className = 'hero-video-container';
  link.remove();
  setTimeout(() => {
    video.classList.remove('hide');
    video.muted = true;
    video.play();
    mediaParent.classList.add('playing');
  }, 3000);
};

export default function decorate(block) {
  const isAutoBlock = block.classList.contains('auto-block');
  if (isAutoBlock) return;
  const contentWrapper = block.querySelector(':scope > div > div');
  const parentContainer = contentWrapper.parentElement;
  // check if it has a video or an image
  const picture = block.querySelector('picture');
  const pictureWrapper = picture.closest('p');
  const video = block.querySelector('a[href*=".mp4"]');
  const videoWrapper = video && video.closest('p');
  const videoLink = videoWrapper?.firstElementChild;
  const contentContainer = createElement('div', 'hero-content-container');
  const mediaWrapper = createElement('div', 'hero-content-media');

  // move aside all media elements: image, video...
  pictureWrapper.className = 'hero-image-container';
  parentContainer.prepend(mediaWrapper);
  mediaWrapper.appendChild(pictureWrapper);
  if (videoWrapper) {
    mediaWrapper.appendChild(videoWrapper);
    // transform link into a video tag
    decorateVideo(videoLink);
    contentContainer.classList.add('has-video');
  }

  contentContainer.appendChild(contentWrapper);
  parentContainer.appendChild(contentContainer);
  contentContainer.prepend(mediaWrapper);
  contentWrapper.className = 'hero-content-wrapper';
}
