import {
  loadBlock, sampleRUM,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/common.js';

const blockName = 'v2-newsletter';
export const logResults = {
  success: 'success',
  error: 'error',
};

function updateForm(result) {
  const newsText = document.querySelector(`.${blockName}__text`);
  const formContainer = document.querySelector(`.${blockName}__form-container`);
  if (result === logResults.success) {
    newsText.classList.remove('hidden');
    formContainer.classList.add('hidden');
  } else if (result === logResults.error) {
    newsText.classList.add('hidden');
    formContainer.classList.remove('hidden');
  }
}

//* init response handling *
async function submissionSuccess() {
  sampleRUM('form:submit');
  updateForm(logResults.success);
}

async function submissionFailure() {
  const form = document.querySelector('form[data-submitting=true]');
  form.setAttribute('data-submitting', 'false');
  updateForm(logResults.error);
}
//* end response handling *

window.logResult = function logResult(json) {
  if (json.result === logResults.success) {
    submissionSuccess();
  } else if (json.result === logResults.error) {
    submissionFailure();
  }
};

export default async function decorate(block) {
  const formLink = block.firstElementChild.innerText.trim();
  const html = block.firstElementChild.nextElementSibling.firstElementChild.innerHTML;

  const container = createElement('div', { classes: `${blockName}__container` });

  const textContainer = createElement('div', { classes: [`${blockName}__text`, 'hidden'] });
  textContainer.innerHTML = html;

  const headings = textContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((heading) => heading.classList.add(`${blockName}__title`));

  const formContainer = createElement('div', { classes: `${blockName}__form-container` });
  const form = document.createRange().createContextualFragment(`
    <div class="v2-forms block" data-block-name="v2-forms" data-block-status="">
      <div>
        <div>subscribe</div>
      </div>
      <div>
        <div>${formLink}</div>
      </div>
    </div>`);

  formContainer.append(...form.children);
  container.append(textContainer, formContainer);

  block.replaceWith(container);

  await loadBlock(formContainer.firstElementChild);
}

// Same form in page is not working.
