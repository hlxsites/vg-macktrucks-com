import { createElement } from '../../scripts/scripts.js';

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
  const subNavList = createElement('div', 'sub-nav-list');
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
  subNavList.appendChild(ul);
  // subNavWrapper.append(caretIcon, title, ul);
  subNavWrapper.append(caretIcon, title, subNavList);
  block.appendChild(subNavWrapper);

  window.onresize = () => {
    if (MQ.matches) {
      ul.classList.remove('open');
      caretIcon.classList.remove('fa-caret-up');
    }
  };

  caretIcon.onclick = () => {
    ul.classList.toggle('open');
    caretIcon.classList.toggle('fa-caret-up');
  };
}

export default async function decorate(block) {
  const { content } = document.head.querySelector('meta[name="sub-navigation"]');
  createSubNav(block, content);
}
