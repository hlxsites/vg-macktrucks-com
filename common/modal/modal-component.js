import { loadCSS } from '../../scripts/lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import { createIframe, isLowResolutionVideoUrl } from '../../scripts/video-helper.js';
import { createElement } from '../../scripts/common.js';

const styles$ = new Promise((r) => {
  loadCSS(`${window.hlx.codeBasePath}/common/modal/modal-component.css`, r);
});

const HIDE_MODAL_CLASS = 'modal-hidden';

const createModal = () => {
  const modalBackground = createElement('div', { classes: ['modal-background', HIDE_MODAL_CLASS] });

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

  const modalContent = createElement('div', { classes: 'modal-content' });
  modalBackground.appendChild(modalContent);
  // preventing initial animation when added to DOM
  modalBackground.style = 'height: 0; opacity: 0;';
  document.body.appendChild(modalBackground);

  // adding close modal button
  const closeButton = createElement('button', { classes: 'modal-close-button' });
  const closeIcon = createElement('span', { classes: ['icon', 'icon-close'] });
  const svgCloseIcon = document.createRange().createContextualFragment(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.00195 5L19.1441 19.1421" stroke="var(--color-icon, #000)" stroke-width="2" stroke-linecap="round"/>
      <path d="M19.1426 5L5.00044 19.1421" stroke="var(--color-icon, #000)" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `);
  closeIcon.append(...svgCloseIcon.children);
  closeButton.append(closeIcon);
  modalBackground.appendChild(closeButton);
  // eslint-disable-next-line no-use-before-define
  closeButton.addEventListener('click', () => hideModal());

  const clearModalContent = () => {
    modalContent.innerHTML = '';
    modalContent.className = 'modal-content';
  };

  async function showModal(newContent, { beforeBanner, beforeIframe, classes = [] } = {}) {
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

    if (newContent && (typeof newContent !== 'string')) {
      // opening modal
      clearModalContent();
      modalContent.classList.add(...classes);
      modalContent.append(newContent);
      modalContent.appendChild(closeButton);
    } else if (newContent) {
      clearModalContent();
      let videoOrIframe = null;
      if (isLowResolutionVideoUrl(newContent)) {
        // Leverage the <video> HTML tag to improve video display
        // This implementation addresses video height inconsistencies in Safari when using an iframe
        videoOrIframe = createElement('video', {
          classes: 'modal-video',
          props: {
            src: newContent,
            controls: '',
            autoplay: '',
            playsinline: '',
          },
        });
        modalContent.append(videoOrIframe);
      } else {
        // otherwise load it as iframe
        videoOrIframe = createIframe(newContent, { parentEl: modalContent, classes: 'modal-video' });
      }

      if (beforeBanner) {
        const bannerWrapper = createElement('div', { classes: 'modal-before-banner' });
        bannerWrapper.addEventListener('click', (event) => event.stopPropagation());
        bannerWrapper.appendChild(beforeBanner);

        videoOrIframe.parentElement.insertBefore(bannerWrapper, videoOrIframe);
      }

      if (beforeIframe) {
        const wrapper = createElement('div', { classes: 'modal-before-iframe' });
        wrapper.appendChild(beforeIframe);
        videoOrIframe.parentElement.insertBefore(wrapper, videoOrIframe);
      }

      videoOrIframe.parentElement.insertBefore(closeButton, videoOrIframe);
    }

    modalBackground.classList.remove(HIDE_MODAL_CLASS);

    // disable page scrolling
    document.body.classList.add('disable-scroll');

    modalContent.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  function hideModal() {
    modalBackground.classList.add(HIDE_MODAL_CLASS);
    window.removeEventListener('keydown', keyDownAction);
    document.body.classList.remove('disable-scroll');

    // stop playing video if the modal contains one
    document.querySelector('.modal-content video')?.pause();
    document.querySelector('.modal-content iframe')?.setAttribute('src', '');

    let onHideTransitionCancel;
    const onHideTransitionEnd = (event) => {
      if (event.target === modalBackground) {
        clearModalContent();

        if (onHideTransitionCancel) {
          modalBackground.removeEventListener('transitioncancel', onHideTransitionCancel);
        }
      }
    };

    onHideTransitionCancel = (event) => {
      if (event.target === modalBackground) {
        modalBackground.removeEventListener('transitionend', onHideTransitionEnd);
      }
    };

    modalBackground.addEventListener('transitionend', onHideTransitionEnd, { once: true });
    modalBackground.addEventListener('transitioncancel', onHideTransitionCancel, { once: true });
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
