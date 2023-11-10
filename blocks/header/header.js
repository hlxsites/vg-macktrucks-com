import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { debounce } from '../../scripts/scripts.js';
import { fetchAutosuggest, handleArrowDown, handleArrowUp } from '../search/autosuggest.js';
import { createElement } from '../../scripts/common.js';
// media query match that indicates mobile/tablet width
const MQ = window.matchMedia('(min-width: 1140px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && MQ.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!MQ.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function addLinkToLogo(navBrand) {
  const picture = navBrand.querySelector('picture');
  const link = navBrand.querySelector('a');
  if (!picture) return;
  const pictureWrapper = picture.parentElement;
  pictureWrapper.insertBefore(link, picture);
  link.textContent = '';
  link.appendChild(picture);
  if (navBrand.children[1].childNodes.length < 1) navBrand.removeChild(navBrand.children[1]);
}

function addLabelsToIcons(navTools) {
  const pictures = navTools.querySelectorAll('picture');
  const links = navTools.querySelectorAll('a');
  if (!pictures) return;
  const picturesWrappers = [...pictures].map((pic) => pic.parentElement);
  picturesWrappers.forEach((p, i) => {
    const span = createElement('span', { classes: 'nav-label' });
    const br = createElement('br');
    span.textContent = links[i].textContent;
    links[i].textContent = '';
    p.prepend(links[i]);
    links[i].append(pictures[i], br, span);
  });
  // clean the empty wrappers
  const pWrappers = navTools.querySelectorAll('p');
  [...pWrappers].forEach((p) => {
    if (p.childNodes.length < 1) p.parentElement.removeChild(p);
  });
}

function setupKeyboardAttributes(navDrops) {
  if (!MQ.matches) {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
    return;
  }

  navDrops.forEach((drop) => {
    if (!drop.hasAttribute('tabindex')) {
      drop.setAttribute('role', 'button');
      drop.setAttribute('tabindex', 0);
      drop.addEventListener('focus', focusNavSection);
    }
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || MQ.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  setupKeyboardAttributes(navDrops);
  // enable menu collapse on escape keypress
  const { addEventListener: add, removeEventListener: remove } = window;
  const listener = (!expanded || MQ.matches ? add : remove).bind(window);
  // collapse menu on escape press
  listener('keydown', closeOnEscape);
}

function addMQListener(nav, navSection, navSections) {
  navSection.addEventListener('click', () => {
    if (!MQ.matches) {
      const expanded = navSection.getAttribute('aria-expanded') === 'true';
      toggleAllNavSections(navSections);
      navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    }
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  const subnav = block.closest('header').querySelector('.sub-nav');

  // fetch nav content
  const navPath = config.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (!resp.ok) return;
  const html = await resp.text();

  // decorate nav DOM
  const nav = createElement('nav', { props: { id: 'nav' } });
  nav.innerHTML = html;

  const classes = ['brand', 'sections', 'mobile', 'tools', 'search'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // decorate Brand
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    addLinkToLogo(navBrand);
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const navLis = navSections.querySelectorAll(':scope > ul > li');
    navLis.forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      addMQListener(nav, navSection, navSections);
    });

    // hamburger for mobile
    const hamburger = createElement('div', { classes: 'nav-hamburger' });
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, MQ.matches);
    MQ.addEventListener('change', () => toggleMenu(nav, navSections, MQ.matches));

    // Decorate extra mobile sections
    const navMobile = nav.querySelector('.nav-mobile');
    if (navMobile) navSections.appendChild(navMobile);
  }

  // Decorate tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) addLabelsToIcons(navTools);

  // decorate & setup search
  const navSearch = nav.querySelector('.nav-search');
  if (navTools && navSearch) {
    const navSearchBtn = [...navTools.children].at(-1);
    const navSearchLinkHref = navSearchBtn.children[0].href;
    const searchIcon = navSearch.querySelector('.icon-search');
    searchIcon.classList.remove('icon-search', 'icon');
    searchIcon.classList.add('fa', 'fa-search');
    const searchIconWrapper = searchIcon.parentElement;
    searchIconWrapper.classList.add('search-icon-wrapper');
    const navSearchWrapper = createElement('div', { classes: 'nav-search-wrapper' });
    const searchIconLink = createElement('a', { props: { href: navSearchLinkHref } });
    const searchWrapper = createElement('div', { classes: 'search-wrapper' });
    const input = createElement('input', { props: { type: 'search', placeholder: 'Search Mack Trucks' } });
    const autosuggestWrapper = createElement('div', { classes: 'autosuggest-results' });
    const closeBtnWrapper = createElement('div', { classes: 'search-close' });
    const closeBtn = createElement('button', { props: { type: 'button' } });
    const closeBtnIcon = createElement('span', { classes: 'search-close-icon' });
    let isShown = false;

    searchWrapper.appendChild(input);
    searchWrapper.appendChild(autosuggestWrapper);

    navSearch.prepend(navSearchWrapper);
    navSearchWrapper.appendChild(searchIconLink);
    navSearchWrapper.appendChild(searchWrapper);
    navSearchWrapper.appendChild(closeBtnWrapper);

    searchIconLink.appendChild(searchIconWrapper);
    closeBtnWrapper.appendChild(closeBtn);
    closeBtn.appendChild(closeBtnIcon);

    const navigateToSearch = (e = null) => {
      if (e) e.preventDefault();
      if (input.value) {
        const searchUrl = new URL('/search', window.location.origin);
        searchUrl.searchParams.set('q', input.value);
        window.location.assign(searchUrl);
      }
    };

    // SEARCH INPUT
    const onclickHandler = (val) => {
      input.value = val;
      navigateToSearch();
      autosuggestWrapper.textContent = '';
      autosuggestWrapper.classList.remove('show');
    };

    const delayFetchData = debounce((term) => fetchAutosuggest(term, autosuggestWrapper, {
      tag: 'div',
      class: 'result-row',
      props: {},
    }, onclickHandler));

    let liSelected;
    let next;
    let index = -1;

    input.onkeyup = (e) => {
      const term = e.target.value;
      const list = autosuggestWrapper.getElementsByTagName('div');

      if (e.key === 'Enter') {
        navigateToSearch(e);
      } else if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        let returnObj;

        if (e.key === 'ArrowUp') {
          returnObj = handleArrowUp({
            list,
            liSelected,
            index,
            next,
          });
        } else {
          returnObj = handleArrowDown({
            list,
            liSelected,
            index,
            next,
          });
        }
        liSelected = returnObj.liSelected;
        index = returnObj.index;
        next = returnObj.next;
        input.value = liSelected.firstElementChild.textContent.replace(/[ ]{2,}/g, '');
      } else {
        delayFetchData(term);
      }
    };

    searchIconLink.onclick = (e) => {
      navigateToSearch(e);
    };

    navSearchBtn.onclick = (e) => {
      e.preventDefault();
      isShown = !isShown;
      navSearch.classList.toggle('show', isShown);
      if (subnav) subnav.classList.toggle('search-open', isShown);

      if (!isShown) {
        autosuggestWrapper.classList.remove('show');
      }
    };

    closeBtn.onclick = () => {
      isShown = false;
      navSearch.classList.remove('show');
      autosuggestWrapper.classList.remove('show');
      if (subnav) subnav.classList.remove('search-open');
    };

    // hide autocomplete, click was outside container
    document.body.addEventListener('click', (event) => {
      if (!searchWrapper.contains(event.target)) {
        autosuggestWrapper.textContent = '';
        autosuggestWrapper.classList.remove('show');
      }
    });
  }

  decorateIcons(nav);
  block.append(nav);
}
