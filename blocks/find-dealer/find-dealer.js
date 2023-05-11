import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const container = block.querySelector(':scope > div > div');
  const inputContainer = createElement('div', 'find-dealer-input-wrapper');
  const input = createElement('input', 'find-dealer-input', {
    title: 'code',
    type: 'text',
    placeholder: 'Enter Zip',
  });
  container.className = 'find-dealer-form-container';
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const url = new URL('/buy-mack/find-a-dealer/', window.location.href);
      url.searchParams.set('l', e.target.value);
      window.location.href = url.toString();
    }
  };

  inputContainer.appendChild(input);
  container.appendChild(inputContainer);
}
