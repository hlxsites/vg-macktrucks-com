import { decorateButtons } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

let fullHeight = 0;

function toggleHeightList(ul) {
  const isOpen = ul.classList.contains('open');
  if (ul.offsetHeight >= fullHeight) fullHeight = ul.offsetHeight;
  ul.style.maxHeight = `${isOpen ? fullHeight : 0}px`;
}

function setDefaultHeight(ul) {
  fullHeight = ul.offsetHeight;
  ul.style.maxHeight = 0;
}

async function createSubNav(block, ref) {
  const resp = await fetch(`${ref}.plain.html`);
  if (!resp.ok) return;
  const MQ = window.matchMedia('(min-width: 1140px)');
  const currentUrl = new URL(window.location);
  const { pathname } = currentUrl;
  const text = await resp.text();
  const fragment = document.createRange().createContextualFragment(text);
  const title = fragment.querySelector('p');
  const ul = fragment.querySelector('ul');
  const overview = createElement('li', '');
  const overviewLink = createElement('a', '', { href: currentUrl.toString() });
  const subNavWrapper = createElement('div', 'sub-nav-container');
  const buttons = [...fragment.querySelectorAll('p:has(em), p:has(strong)')];
  const ctasWrapper = buttons.length > 0 && createElement('li', 'sub-nav-cta-wrapper');
  // add a caret arrow for mobile version
  const caretIcon = createElement('div', ['fa', 'fa-caret-down', 'icon']);
  // set the active link, if is not found then use overview as default
  const activeLink = [...ul.querySelectorAll('li a')].find((a) => new URL(a.href).pathname === pathname);
  const activeLi = activeLink ? activeLink.closest('li') : overview;

  title.className = 'sub-nav-title';
  activeLi.className = 'active';
  overviewLink.textContent = 'Overview';
  overview.appendChild(overviewLink);
  ul.prepend(overview);
  if (ctasWrapper) {
    buttons.forEach((btn) => {
      ctasWrapper.appendChild(btn);
    });
    ul.appendChild(ctasWrapper);
    decorateButtons(ctasWrapper);
  }
  subNavWrapper.append(caretIcon, title, ul);
  block.appendChild(subNavWrapper);
  if (!MQ.matches) setDefaultHeight(ul);

  window.onresize = () => {
    const isDesktop = MQ.matches;
    if (isDesktop) {
      caretIcon.classList.remove('fa-caret-up');
      ul.classList.remove('open');
      ul.style.maxHeight = null;
    } else if (ul.style.maxHeight === '') {
      setDefaultHeight(ul);
    }
  };

  caretIcon.onclick = () => {
    caretIcon.classList.toggle('fa-caret-up');
    ul.classList.toggle('open');
    toggleHeightList(ul);
  };
}

export default async function decorate(block) {
  const { content } = document.head.querySelector('meta[name="sub-navigation"]');
  createSubNav(block, content);
}
