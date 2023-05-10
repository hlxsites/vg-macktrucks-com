import { loadCSS } from '../../scripts/lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import { createIframe, createElement } from '../../scripts/scripts.js';

const styles$ = new Promise((r) => {
  loadCSS(`${window.hlx.codeBasePath}/common/modal/modal.css`, r);
});

const HIDE_MODAL_CLASS = 'modal-hidden';

const createModal = () => {
  const modalBackground = createElement('div', ['modal-background', HIDE_MODAL_CLASS]);

  modalBackground.addEventListener('click', () => {
    // eslint-disable-next-line no-use-before-define
    hideModal();
  });

  const keyDownAction = (event) => {
    if (event.key === 'Escape') {
      // eslint-disable-next-line no-use-before-define
      hideModal();
    }
  };

  const modalContent = createElement('div', ['modal-content']);
  modalBackground.appendChild(modalContent);
  // preventing initial animation when added to DOM
  modalBackground.style = 'display:none';
  document.body.appendChild(modalBackground);

  // don't close modal when clicking on modal content
  modalContent.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // adding close modal button
  const closeButton = document.createElement('button');
  closeButton.classList.add('modal-close-button');
  closeButton.innerHTML = '<i class="fa fa-close"></i>';
  modalBackground.appendChild(closeButton);
  // eslint-disable-next-line no-use-before-define
  closeButton.addEventListener('click', () => hideModal());

  const clearModalContent = () => {
    modalContent.innerHTML = '';
  };

  async function showModal(newUrl, beforeBanner, beforeIframe) {
    await styles$;
    modalBackground.style.display = '';
    window.addEventListener('keydown', keyDownAction);

    if (newUrl) {
      clearModalContent();
      const iframe = createIframe(newUrl, { parentEl: modalContent, classes: 'modal-video' });

      if (beforeBanner) {
        const bannerWrapper = createElement('div', ['modal-before-banner']);
        bannerWrapper.addEventListener('click', (event) => event.stopPropagation());
        bannerWrapper.appendChild(beforeBanner);

        iframe.parentElement.insertBefore(bannerWrapper, iframe);
      }

      if (beforeIframe) {
        const wrapper = createElement('div', 'modal-before-iframe');
        wrapper.appendChild(beforeIframe);
        iframe.parentElement.insertBefore(wrapper, iframe);
      }
    }

    modalBackground.classList.remove(HIDE_MODAL_CLASS);

    // disable page scrolling
    document.body.classList.add('disable-scroll');
  }

  function hideModal() {
    modalBackground.classList.add(HIDE_MODAL_CLASS);
    window.removeEventListener('keydown', keyDownAction);
    document.body.classList.remove('disable-scroll');

    modalContent.addEventListener('transitionend', () => {
      clearModalContent();
    }, { once: true });
  }

  return {
    showModal,
    hideModal,
  };
};

const { showModal, hideModal } = createModal();

export {
  showModal,
  hideModal,
};
