import { showModal } from '../../common/modal/modal.js';
import fragmentBlock from '../fragment/fragment.js';

const cacheList = [];

document.addEventListener('open-modal', (event) => {
  const { modalId } = event.detail;

  if (modalId) {
    const modalData = cacheList.find((el) => el.modalId === modalId);
    const { content, classes } = modalData;

    if (modalData) {
      showModal(content, { classes: ['modal-form', ...classes] });
    }
  }
});

export default async function decorate(block) {
  const content = block.querySelector(':scope > div');
  const fragmentLink = content.innerText.trim();
  const modalId = [...block.classList].find((el) => el.startsWith('id-modal'));
  const classes = [...block.classList].filter((el) => el !== modalId && el !== 'block');
  const itemFromCache = cacheList.find((el) => el.fragmentLink === fragmentLink);

  // load fragment only if it wasn't loaded yet
  if (!itemFromCache) {
    await fragmentBlock(content);

    const newContent = block.querySelector(':scope > .fragment');

    cacheList.push({
      modalId,
      fragmentLink,
      classes,
      content: newContent,
    });
  } else {
    itemFromCache.modalId = modalId;
    itemFromCache.fragmentLink = fragmentLink;
    itemFromCache.classes = classes;
  }

  // modal block do not render anything by itself
  block.remove();
}
