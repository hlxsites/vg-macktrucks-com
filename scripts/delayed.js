// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './lib-franklin.js';

const COOKIES = {
  performance: 'C0002:1',
};

// Core Web Vitals RUM collection
sampleRUM('cwv');

const cookieSetting = decodeURIComponent(document.cookie.split(';')
  .find((cookie) => cookie.trim().startsWith('OptanonConsent=')));
const isPerformanceAllowed = cookieSetting.includes(COOKIES.performance);

if (isPerformanceAllowed) {
  loadGoogleTagManager();
}

// add more delayed functionality here

// Prevent the cookie banner from loading when running in library
if (!window.location.pathname.includes('srcdoc')
  && !['localhost', 'hlx.page'].some((url) => window.location.host.includes(url))) {
  loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
    type: 'text/javascript',
    charset: 'UTF-8',
    'data-domain-script': '29528458-0dec-41ae-acf7-5a5960790e7c',
  });
}

window.OptanonWrapper = () => {
  const currentOnetrustActiveGroups = window.OnetrustActiveGroups;

  function isSameGroups(groups1, groups2) {
    const s1 = JSON.stringify(groups1.split(',').sort());
    const s2 = JSON.stringify(groups2.split(',').sort());

    return s1 === s2;
  }

  window.OneTrust.OnConsentChanged(() => {
    // reloading the page only when the active group has changed
    if (!isSameGroups(currentOnetrustActiveGroups, window.OnetrustActiveGroups)) {
      window.location.reload();
    }
  });
};

// Google Analytics
async function loadGoogleTagManager() {
  // google tag manager
  // eslint-disable-next-line func-names
  (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' }); const f = d.getElementsByTagName(s)[0]; const j = d.createElement(s); const
      dl = l !== 'dataLayer' ? `&l=${l}` : ''; j.async = true; j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`; f.parentNode.insertBefore(j, f);
  }(window, document, 'script', 'dataLayer', 'GTM-5DKKVHFL'));
}
