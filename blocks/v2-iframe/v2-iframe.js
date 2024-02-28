import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

function removeDuplicateParams(queryString) {
  const params = new URLSearchParams(queryString);
  const uniqueParams = new URLSearchParams();

  params.forEach((value, key) => {
    if (!uniqueParams.has(key)) {
      uniqueParams.append(key, value);
    }
  });

  return uniqueParams.toString();
}

export default async function decorate(block) {
  const title = block.querySelector('h1, h2, h3, h4, h5, h6').textContent;
  const passURLs = block.classList.contains('pass-urls');
  const fixedHeightClass = [...block.classList].find((el) => /[0-9]+px/.test(el));
  let link = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();

  link += window.location.search ? `#/summary/?${removeDuplicateParams(window.location.search)}` : '';
  if (!window.location.search && window.location.hash) {
    link += window.location.hash;
  }

  const iframe = createElement('iframe', {
    props: {
      src: link, frameborder: 0, title, allow: 'clipboard-write',
    },
  });

  variantsClassesToBEM(block.classList, ['full-viewport'], 'v2-iframe');

  if (passURLs) {
    const referer = document.referrer;
    let messageValue;

    if (referer && new URL(referer).origin === window.location.origin) {
      messageValue = referer;
    } else {
      messageValue = window.location.origin;
    }

    const message = {
      type: 'URL',
      value: messageValue,
    };
    iframe.contentWindow.postMessage(message, '*');
  }

  if (fixedHeightClass) {
    iframe.height = fixedHeightClass;
  }

  block.replaceChildren(iframe);
}
