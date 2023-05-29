import { readBlockConfig, decorateIcons, loadBlocks } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = createElement('footer', 'footer-content');

  footer.innerHTML = html;

  // adding the 'block' class and 'data-block-name'
  // needed to load blocks
  const eloquaFormEl = footer.querySelector('.eloqua-form');
  eloquaFormEl?.classList.add('block');
  eloquaFormEl?.setAttribute('data-block-name', 'eloqua-form');

  // transforming icons into font-awesome
  footer.querySelectorAll('span.icon').forEach((icon) => {
    const iconClass = icon.getAttribute('class').split(' ').find((el) => el.startsWith('icon-'));

    if (iconClass) {
      const iconName = iconClass.split('icon-')[1];

      icon.classList.remove('icon', iconClass);
      icon.classList.add('fa', iconName, 'footer-social-media');
    }
  });

  const socialMediaSection = footer.querySelector('.fa-twitter, .fa-facebook, .fa-twitter, .fa-linkedin, .fa-instagram, .fa-youtube')?.closest('ul');
  socialMediaSection?.classList.add('footer-social-media-section');

  const [firstHeader, secondHeader] = [...footer.querySelectorAll('h1')];
  const [firstLinks, secondLinks] = [...footer.querySelectorAll('h1 ~ ul')];

  // creating the  logo link
  const picture = footer.querySelector('picture');
  let logoLink = null;

  if (picture) {
    logoLink = picture.closest('div').querySelector('a');
    logoLink?.classList.add('footer-logo-link');
    picture.parentElement.remove();

    logoLink.innerHTML = '';
    logoLink.append(picture);
  }

  const bottomLinksList = [...footer.querySelectorAll('ul')].at(-1);

  const formSection = footer.querySelector('.eloqua-form')?.parentElement;
  formSection?.classList.add('footer-form-section');

  const footerTemplate = `
    <div class="footer-content">
      <div class="footer-main-content">
        <div class="footer-form-and-social-section">
          <div class="footer-form-section">
            <div class="form footer-form">
              ${formSection?.outerHTML}
            </div>
          </div>
          ${socialMediaSection?.outerHTML}
        </div>
        <div class="footer-links-section">
          <div class="footer-links-col-1">
            ${firstHeader?.outerHTML}
            ${firstLinks?.outerHTML}
          </div>
          <div class="footer-links-col-2">
            ${secondHeader?.outerHTML}
            ${secondLinks?.outerHTML}
          </div>
        </div>
      </div>
      <hr />
      <div class="footer-bottom-section">
        ${bottomLinksList?.outerHTML}
        ${logoLink?.outerHTML}
      </div>
    </div>
  `;

  const fragment = document.createRange().createContextualFragment(footerTemplate);
  block.appendChild(fragment);

  // make links to open in another browser tab/window
  const socialLinks = block.querySelectorAll('.footer-social-media-section a');
  [...socialLinks].forEach((a) => { a.target = '_blank'; });

  await decorateIcons(block);
  await loadBlocks(block);

  const targetNode = block.querySelector('.eloqua-form.block');
  const observerOptions = {
    childList: true,
    attributes: false,
    subtree: true,
  };
  let observer = null;
  let submitButtonFixed = false;
  let checkboxFixed = false;
  const onFormLoaded = (mutationList) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const mutation of mutationList) {
      if (submitButtonFixed && checkboxFixed) {
        observer.disconnect();
        return;
      }

      if (mutation.type === 'childList') {
        const submitButton = block.querySelector('input[type="submit"]');
        const emailInput = block.querySelector('input[name="emailAddress"]');
        const label = emailInput.parentElement.querySelector('label');
        const emailAndSubmitContainer = createElement('span', ['email-and-submit-container']);

        // change the submit button to arrow button
        // and display it sticked to the right side of email input
        if (submitButton && emailInput) {
          const parent = emailInput.parentElement;
          submitButton.value = '→';
          emailAndSubmitContainer.append(emailInput, submitButton);
          parent.append(emailAndSubmitContainer);

          if (label) {
            emailInput.setAttribute('placeholder', label.innerText.replace('*', '').trim());
            label.remove();
          }

          submitButtonFixed = true;
        }

        const checkbox = block.querySelector('.checkbox-span input[type="checkbox"]');
        const checkboxLable = block.querySelector('.checkbox-span .checkbox-label');
        // customization of the checkbox
        if (checkbox && checkboxLable) {
          const checkboxId = 'footer-subscribe-checkbox';
          const checkboxParent = checkbox.parentElement;
          checkbox.setAttribute('id', checkboxId);
          checkboxLable.setAttribute('for', checkboxId);
          checkboxParent.classList.add('confirm-checkbox');

          if (emailInput) {
            // showing the checkbox only when the user start typing
            emailInput.addEventListener('input', () => { checkboxParent.classList.add('show'); }, { onece: true });
          }

          checkboxFixed = true;
        }
      }
    }
  };

  observer = new MutationObserver(onFormLoaded);
  observer.observe(targetNode, observerOptions);
}
