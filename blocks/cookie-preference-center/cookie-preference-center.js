import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const button = createElement('button', 'cta', { onclick: 'OneTrust.ToggleInfoDisplay();' });
  button.textContent = block.textContent;

  block.textContent = '';
  block.append(button);
}
