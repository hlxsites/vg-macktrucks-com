// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// Prevent the cookie banner from loading when running in library
if (!window.location.pathname.includes('srcdoc') && (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost'))) {
  loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
    type: 'text/javascript',
    charset: 'UTF-8',
    'data-domain-script': 'bf50d0a6-e209-4fd4-ad2c-17da5f9e66a5',
  });
}

// Google Analytics
const gaId0 = 'GTM-TRCGW9';
const gaId1 = 'G-7ZGJPBTFYW';
window.dataLayer = window.dataLayer || [];

function gtag(...args) {
  window.dataLayer.push(args);
}

gtag('js', new Date());
gtag('config', `${gaId0}`);
gtag('config', `${gaId1}`);

loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId0}`, {
  type: 'text/javascript',
  charset: 'UTF-8',
  async: true,
});
