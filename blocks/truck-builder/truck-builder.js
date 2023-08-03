import { createElement, getTextLabel } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const placeholderTexts = getTextLabel('truck builder text');

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const [title, subtitle, ctaText, bodyOptions, colors] = Object.values(blockConfig);
  const imageNodes = block.querySelectorAll('picture');
  const [bodyLabel, colorLabel] = placeholderTexts.split('[/]');

  const truckBuilderSection = createElement('div', 'truck-builder-section');

  if (imageNodes.length === 1) truckBuilderSection.appendChild(imageNodes[0]);

  const bodySelectSection = createElement('div', 'body-select-section');
  const bodyFieldset = createElement('fieldset', 'body-fieldset');
  const bodyTitle = createElement('legend', 'body-legend');
  bodyTitle.textContent = bodyLabel;
  bodyFieldset.appendChild(bodyTitle);

  const bodyOptionsArray = bodyOptions.split(',');
  bodyOptionsArray.forEach((body) => {
    const item = createElement('div', 'body-option');
    const input = createElement('input', 'body-input');
    input.type = 'radio';
    const label = createElement('label', 'body-label');
    label.textContent = body;
    item.append(input, label);
    bodyFieldset.appendChild(item);
  });
  bodySelectSection.appendChild(bodyFieldset);

  const colorSelectSection = createElement('div', 'color-select-section');
  const colorFieldset = createElement('fieldset', 'color-fieldset');
  const colorTitle = createElement('legend', 'color-legend');
  colorTitle.textContent = colorLabel;
  colorFieldset.appendChild(colorTitle);

  const colorOptionsArray = colors.split(',');
  colorOptionsArray.forEach((color) => {
    const item = createElement('div', 'color-option');
    const button = createElement('button', 'color-btn');
    button.type = 'button';
    button.style.backgroundColor = color;
    item.append(button);
    colorFieldset.appendChild(item);
  });
  colorSelectSection.appendChild(colorFieldset);

  const ctaSection = createElement('div', 'cta-section');
  const ctaTitle = createElement('h3', 'cta-title');
  ctaTitle.textContent = title;
  const ctaSubtitle = createElement('p', 'cta-subtitle');
  ctaSubtitle.textContent = subtitle;
  const ctaButton = createElement('button', 'cta-button');
  ctaButton.textContent = ctaText;
  ctaSection.append(ctaTitle, ctaSubtitle, ctaButton);

  truckBuilderSection.append(bodySelectSection, colorSelectSection, ctaSection);

  block.textContent = '';
  block.append(truckBuilderSection);
}
