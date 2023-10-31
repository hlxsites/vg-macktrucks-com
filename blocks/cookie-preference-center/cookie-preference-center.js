import { createElement } from '../../scripts/common.js';

export default function decorate(block) {
  const button = createElement('button', { classes: 'cta', props: { onclick: 'OneTrust.ToggleInfoDisplay();' } });
  button.textContent = block.textContent;

  block.textContent = '';
  block.append(button);
}
