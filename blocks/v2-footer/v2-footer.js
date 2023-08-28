import { readBlockConfig, decorateIcons, loadBlocks } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

const addClassToTitle = (block, className) => {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((h) => h.classList.add(className));
};

const blockName = 'v2-footer';
const blockNamePrefooter = 'v2-prefooter';
const blockNameTruckList = 'v2-footer-truck-list';
const blockNameMenu = 'v2-footer-menu';
const blockNameNewsletter = 'v2-footer-newsletter';
const blockNameLegal = 'v2-footer-legal';

function displayScrollToTop(buttonEl) {
  const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  buttonEl.style.display = scrollTop > 160 ? 'block' : 'none';
}

function goToTopFunction() {
  const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  let timeOut;

  if (scrollTop !== 0) {
    window.scrollBy(0, -50);
    timeOut = setTimeout(goToTopFunction, 10);
    return;
  }

  clearTimeout(timeOut);
}

function addScrollToTopButton(mainEl) {
  const scrollToTopButton = createElement('button', ['v2-scroll-to-top'], { title: 'Go to the top of the page' });
  const svgIcon = document.createRange().createContextualFragment(`
  <svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-arrow-right"></use></svg>`);
  scrollToTopButton.append(...svgIcon.children);

  scrollToTopButton.addEventListener('click', goToTopFunction);
  window.addEventListener('scroll', () => displayScrollToTop(scrollToTopButton));
  mainEl.append(scrollToTopButton);
}

function findList(ele) {
  if (ele.classList.contains(blockNameTruckList)) {
    return ele;
  }
  return findList(ele.parentElement);
}

function toggleExpand(targetH3) {
  const clickedColumn = findList(targetH3);
  const isExpanded = clickedColumn.classList.contains('expand');
  const wrapper = targetH3.closest(`.${blockNameTruckList}`);
  const content = wrapper.querySelector(`.${blockNameTruckList}__items`);
  if (wrapper === clickedColumn && !isExpanded) {
    wrapper.classList.add('expand');
    content.style.maxHeight = `${content.scrollHeight}px`;
  } else {
    wrapper.classList.remove('expand');
    content.style.maxHeight = null;
  }
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();

  block.innerHTML = html;

  // Eloqua form necessary variables
  let observer = null;
  let submitButtonFixed = false;
  let checkboxFixed = false;

  const footerItems = block.querySelectorAll(`:scope > div .${blockName} > div`);

  const prefooter = footerItems?.[0].querySelector(':scope > div');
  const truckList = footerItems?.[1].querySelector(':scope > div');
  const footerMenu = footerItems?.[2];
  const footerLegal = footerItems?.[3].querySelector(':scope > div');

  const newFooter = createElement('div');

  // Prefooter
  if (prefooter) {
    prefooter.classList.add(blockNamePrefooter);
    newFooter.append(prefooter);
  }

  // Truck list
  if (truckList) {
    truckList.classList.add(`${blockNameTruckList}__wrapper`);
    truckList.querySelector('ul')?.classList.add(`${blockNameTruckList}__items`);
    addClassToTitle(truckList, `${blockNameTruckList}__title`);
    const truckListContent = createElement('div', blockNameTruckList);
    truckListContent.appendChild(truckList);

    newFooter.append(truckListContent);
  }

  // Menu: social media + logo + menu list + newsletter form
  if (footerMenu) {
    const newMenu = createElement('div', blockNameMenu);

    // Logo
    const logo = footerMenu.querySelector('picture');
    logo.classList.add(`${blockNameMenu}__logo`);
    newMenu.appendChild(logo);

    // Social media
    const socialMedia = footerMenu.querySelector(':scope > div ul');
    socialMedia.classList.add(`${blockNameMenu}__socialmedia`);
    const socialLinks = socialMedia.querySelectorAll('a');
    [...socialLinks].forEach((a) => { a.target = '_blank'; });
    newMenu.appendChild(socialMedia);

    // remove div which contained logo and social media
    footerMenu.firstElementChild.remove();

    // Menu Columns: Newsletter form
    const newsletter = createElement('div', blockNameNewsletter);
    const oldNews = footerMenu.querySelector(':scope > div:last-child');
    newsletter.appendChild(oldNews);

    const eloquaForm = block.querySelector('.eloqua-form');
    eloquaForm?.setAttribute('data-block-name', 'eloqua-form');
    newsletter.append(eloquaForm);
    addClassToTitle(newsletter, `${blockNameNewsletter}__title`);

    // Menu Columns: menu
    const menu = createElement('div', `${blockNameMenu}__columns`);
    menu.innerHTML = footerMenu.innerHTML;
    const menuList = menu.querySelectorAll(':scope > div');
    menuList.forEach((item) => item.classList.add(`${blockNameMenu}__column`));

    newMenu.appendChild(menu);
    newMenu.appendChild(newsletter);
    newFooter.append(newMenu);
  }

  if (footerLegal) {
    footerLegal.classList.add(blockNameLegal);

    newFooter.append(footerLegal);
  }

  block.innerHTML = newFooter.innerHTML;

  await decorateIcons(block);
  await loadBlocks(block);

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
          submitButton.value = '';
          emailAndSubmitContainer.append(emailInput, submitButton);
          parent.append(emailAndSubmitContainer);

          if (label) {
            emailInput.setAttribute('placeholder', label.innerText.replace('*', '').trim());
            label.remove();
          }

          submitButtonFixed = true;
        }

        const checkbox = block.querySelector('.checkbox-span input[type="checkbox"]');
        const checkboxLabel = block.querySelector('.checkbox-span .checkbox-label');
        // customization of the checkbox
        if (checkbox && checkboxLabel) {
          const checkboxId = 'footer-subscribe-checkbox';
          const checkboxParent = checkbox.parentElement;
          checkbox.setAttribute('id', checkboxId);
          checkboxLabel.setAttribute('for', checkboxId);
          checkboxParent.classList.add('confirm-checkbox');

          if (emailInput) {
            // showing the checkbox only when the user start typing
            emailInput.addEventListener('input', () => { checkboxParent.classList.add('show'); }, { once: true });
          }

          checkboxFixed = true;
        }
      }
    }
  };

  const eloquaForm = block.querySelector('.eloqua-form');
  observer = new MutationObserver(onFormLoaded);
  observer.observe(eloquaForm, {
    childList: true,
    attributes: false,
    subtree: true,
  });

  block.addEventListener('click', (e) => {
    if (e.target.classList.contains(`${blockNameTruckList}__title`)) {
      toggleExpand(e.target);
    }
  });

  addScrollToTopButton(block);
}
