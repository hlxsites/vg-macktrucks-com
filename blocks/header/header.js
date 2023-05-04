import { readBlockConfig, decorateIcons, loadScript } from '../../scripts/lib-franklin.js';

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

function loadSearchWidget() {
  loadScript('https://static.searchstax.com/studio-js/v3/js/search-widget.min.js', { type: 'text/javascript', charset: 'UTF-8' })
    .then(() => {
      function initiateSearchWidget() {
        // eslint-disable-next-line no-new, no-undef
        new SearchstudioWidget(
          'c2ltYWNrdm9sdm86V2VsY29tZUAxMjM=',
          'https://ss705916-dy2uj8v7-us-east-1-aws.searchstax.com/solr/productionmacktrucks-1158-suggester/emsuggest',
          `${window.location.origin}/search`,
          3,
          'searchStudioQuery',
          'div-widget-id',
          'en',
        );
      }
      setTimeout(() => initiateSearchWidget(), 3000);
    });
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
    const span = document.createElement('span');
    const br = document.createElement('br');
    span.className = 'nav-label';
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

  // fetch nav content
  const navPath = config.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (!resp.ok) return;
  const html = await resp.text();

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
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
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
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
    const searchIcon = navSearch.querySelector('.icon-search');
    const searchIconWrapper = searchIcon.parentElement;
    const navSearchWrapper = document.createElement('div');
    const searchWidgetDiv = document.createElement('div');
    const searchIconLink = document.createElement('a');
    const closeBtnWrapper = document.createElement('div');
    const closeBtn = document.createElement('button');
    const closeBtnIcon = document.createElement('span');
    let isShown = false;

    searchWidgetDiv.id = 'div-widget-id';
    searchWidgetDiv.className = 'studio-search-widget';

    searchIconLink.className = 'search-icon';

    navSearchWrapper.className = 'nav-search-wrapper';
    closeBtnWrapper.className = 'search-close';
    closeBtn.type = 'button';
    closeBtnIcon.className = 'search-close-icon';

    navSearch.prepend(navSearchWrapper);
    navSearchWrapper.appendChild(searchIconLink);
    navSearchWrapper.appendChild(searchWidgetDiv);
    navSearchWrapper.appendChild(closeBtnWrapper);
    searchIconLink.appendChild(searchIconWrapper);
    closeBtnWrapper.appendChild(closeBtn);
    closeBtn.appendChild(closeBtnIcon);

    navSearchBtn.onclick = (e) => {
      e.preventDefault();
      isShown = !isShown;
      navSearch.classList.toggle('show', isShown);
    };

    closeBtn.onclick = () => {
      isShown = false;
      navSearch.classList.remove('show');
    };

    searchIconLink.onclick = (e) => {
      e.preventDefault();
      const searchTerm = document.getElementById('div-widget-id-search-input').value;
      if (searchTerm) {
        window.location.href = `${window.location.origin}/search?searchStudioQuery=${searchTerm}`;
      }
    };
  }

  decorateIcons(nav);
  block.append(nav);
  loadSearchWidget();
}
