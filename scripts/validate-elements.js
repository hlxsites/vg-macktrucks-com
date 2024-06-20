const v1SectionClasses = [
  'background',
  'background-top',
  'bg-paper',
  'bg-white-paper',
  'dark-background',
  'center',
  'flex-center',
  'font-l',
  'font-m',
  'font-s',
  'font-xl',
  'font-xxl',
  'font-xs',
  'font-xxs',
  'helvetica-55',
  'helvetica-65',
  'helvetica-75',
  'helvetica-56',
  'helvetica-66',
  'helvetica-76',
  'gap',
  'highlight',
  'line-separator',
  'magazine-listing-content',
  'no-first-line',
  'padding-0',
  'padding-16',
  'padding-32',
  'section-width',
  'text-white',
  'text-black',
  'responsive-title',
  'title-line',
  'title-margin-bottom-0',
  'title-white',
  'wrapper-margin-top-0',
];

const v2SectionClasses = [
  'header-with-mark',
  'recalls-padding',
  'section--background-with-dots',
  'section--black-background',
  'section--gray-background',
  'section--light-gray-background',
  'section--no-gap',
  'section--no-vertical-padding',
  'section--with-background',
];

const v1AllowedBlocks = [
  'v2-embed',
];

const v2AllowedBlocks = [
  'embed',
  'footer',
  'fragment',
  'header',
  'iframe',
  'modal',
];

const isV2 = document.documentElement.classList.contains('redesign-v2');
const pageText = isV2 ? 'redesign page' : 'non-redesign page';
const targetNode = document.body;
const config = { childList: true, subtree: false };

// Initialize the toast container
const initSnackbarContainer = () => {
  const container = document.createElement('section');
  container.classList.add('snackbar-container');
  document.body.insertBefore(container, document.body.firstChild);
  return container;
};

// Create a toast element
const createSnackbar = (text) => {
  const toast = document.createElement('output');
  toast.innerText = text;
  toast.classList.add('snackbar');
  toast.setAttribute('role', 'status');
  return toast;
};

// Main function to show a toast
const showSnackbar = (text, duration = 10000) => {
  const container = document.querySelector('.snackbar-container') || initSnackbarContainer();
  const toast = createSnackbar(text);
  container.appendChild(toast);

  return new Promise((resolve) => {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => {
        container.removeChild(toast);
        resolve();
      });
    }, duration);
  });
};

const checkSections = () => {
  targetNode.querySelectorAll(':scope > main > .section').forEach((section) => {
    const sectionClasses = Array.from(section.classList);

    const checkList = isV2 ? v1SectionClasses : v2SectionClasses;

    const matchingClasses = sectionClasses.filter((className) => checkList.includes(className));

    const cleanedMatchingClasses = matchingClasses.map((className) => {
      if (className.startsWith('section--')) {
        return className.replace('section--', '');
      }
      return className;
    });

    if (matchingClasses.length > 0) {
      showSnackbar(`Section with unsupported classes on ${pageText}: ${cleanedMatchingClasses.join(', ')}`);
    }
  });
};

const checkBlocks = () => {
  const blocks = document.querySelectorAll('[data-block-name]');

  blocks.forEach((block) => {
    const blockName = block.getAttribute('data-block-name');

    if (isV2) {
      if (!blockName.startsWith('v2-') && !v2AllowedBlocks.includes(blockName)) {
        showSnackbar(`Non-redesign block being used on ${pageText}: ${blockName}`);
      }
    } else if (blockName.startsWith('v2-') && !v1AllowedBlocks.includes(blockName)) {
      showSnackbar(`Redesign block being used on ${pageText}: ${blockName}`);
    }
  });
};

const performDomCheck = () => {
  checkSections();
  checkBlocks();
};

const existingElement = document.querySelector('body > helix-sidekick');
if (existingElement) {
  performDomCheck();
} else {
  const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName.toLowerCase() === 'helix-sidekick') {
            performDomCheck();
            observer.disconnect();
          }
        });
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}
