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
  modalBackground.style = 'height: 0; opacity: 0;';
  document.body.appendChild(modalBackground);

  // don't close modal when clicking on modal content
  modalContent.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // adding close modal button
  const closeButton = createElement('button', ['modal-close-button']);
  const closeIcon = createElement('i', ['fa', 'fa-close']);
  closeButton.append(closeIcon);
  modalBackground.appendChild(closeButton);
  // eslint-disable-next-line no-use-before-define
  closeButton.addEventListener('click', () => hideModal());

  const clearModalContent = () => {
    modalContent.innerHTML = '';
  };

  async function showModal(newUrl, beforeBanner, beforeIframe) {
    await styles$;
    await new Promise((resolve) => {
      // beacues the styels$ is based on the on load event it's waiting for the file to be loaded
      // but it is not waiting for the style to be applied
      // (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#stylesheet_load_events)
      // here were check if the styles are already applied by checking the calculated styles
      // for one of the element
      const inverval = setInterval(() => {
        const modalBackgroundStyles = window.getComputedStyle(modalBackground);
        // the position should be set to 'fixed' by modal css file
        if (modalBackgroundStyles.getPropertyValue('position') === 'fixed') {
          clearInterval(inverval);
          resolve();
        }
      }, 100);
    });
    modalBackground.style = '';
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

    // stop playing video if the modal contains one
    document.querySelector('modal-content video')?.pause();

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
