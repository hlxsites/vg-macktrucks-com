import { createElement, loadScriptIfNotLoadedYet } from '../../scripts/scripts.js';

// eslint-disable no-console
const addForm = async (block) => {
  // hiding till ready to display
  const displayValue = block.style.display;
  block.style.display = 'none';

  const formName = block.firstElementChild.innerText.trim();
  const thankYou = block.firstElementChild.nextElementSibling;
  const data = await fetch(`${window.hlx.codeBasePath}/blocks/eloqua-form/forms/${formName}.html`);

  if (!data.ok) {
    // eslint-disable-next-line no-console
    console.error(`failed to load form: ${formName}`);
    block.innerHTML = '';
    return;
  }

  const text = await data.text();
  block.innerHTML = text;

  if (thankYou) {
    const form = block.querySelector('form');
    const oldSubmit = form.onsubmit;
    form.onsubmit = function handleSubmit() {
      if (oldSubmit.call(this)) {
        const body = new FormData(this);
        const { action, method } = this;
        fetch(action, { method, body, redirect: 'manual' }).then((resp) => {
          // eslint-disable-next-line no-console
          if (!resp.ok) console.error(`form submission failed: ${resp.status} / ${resp.statusText}`);
          const firstContent = thankYou.firstElementChild.firstElementChild;
          if (firstContent.tagName === 'A') {
            // redirect to thank you page
            window.location.href = firstContent.href;
          } else {
            // show thank you content
            block.replaceChildren(thankYou);
          }
        });
      }
      return false;
    };
  }

  const styles = block.querySelectorAll('style');

  styles.forEach((styleSheet) => {
    document.head.appendChild(styleSheet);
  });

  // loading scripts one by one to prevent inappropriate script execution order.
  // eslint-disable-next-line no-restricted-syntax
  for (const script of [...block.querySelectorAll('script')]) {
    let waitForLoad = Promise.resolve();
    const scriptAttrs = {};

    // coping all script attribute to the new one
    // eslint-disable-next-line no-loop-func
    script.getAttributeNames().forEach((attrName) => {
      const attrValue = script.getAttribute(attrName);
      scriptAttrs[attrName] = attrValue;
    });

    // script with external script link
    if (script.getAttribute('src')) {
      waitForLoad = loadScriptIfNotLoadedYet(script.getAttribute('src'), scriptAttrs);
    } else {
      // scripts with inline code

      // the script element added by innerHTML is NOT executed
      // the workaround is to create the new script tag, copy attibutes and content
      const newScript = createElement('script', '', { type: 'text/javascript' });

      newScript.innerHTML = script.innerHTML;
      document.body.append(newScript);
    }

    script.remove();
    // eslint-disable-next-line no-await-in-loop
    await waitForLoad;
  }

  block.querySelectorAll('.form-element-layout').forEach((el) => {
    // displaying label content as input placeholder
    const input = el.querySelector('input[type="text"], select');
    const label = el.querySelector('label');

    if (input && label) {
      input.setAttribute('placeholder', label.innerText.replace(/\s+/g, ' ').trim());
      label.remove();
    }
  });

  // adding class to the select parent element, so the select's arrow could be displayed.
  block.querySelectorAll('select').forEach((el) => {
    el.parentElement.classList.add('eloqua-select-wrapper');
  });

  // replacing eloqua default values
  block.querySelectorAll('[value^="~~"]').forEach((el) => {
    el.setAttribute('value', '');
  });
  block.querySelectorAll('input').forEach((el) => {
    if (el.value.trim().startsWith('<eloqua')) {
      el.value = '';
    }
  });

  block.style.display = displayValue;
};

export default async function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      addForm(block);
    }
  }, {
    rootMargin: '300px',
  });
  observer.observe(block);
}
