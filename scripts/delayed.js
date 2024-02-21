// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import { isPerformanceAllowed, isTargetingAllowed } from './common.js';
import {
  ACCOUNT_ENGAGEMENT_TRACKING_CONSTANTS,
  HOTJAR_ID,
  DATA_DOMAIN_SCRIPT,
  GTM_ID,
} from './constants.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// COOKIE ACCEPTANCE CHECKING
if (isPerformanceAllowed()) {
  loadGoogleTagManager();
  loadHotjar();
}

if (isTargetingAllowed()) {
  loadAccountEngagementTracking();
}

// add more delayed functionality here

// Prevent the cookie banner from loading when running in library
if (!window.location.pathname.includes('srcdoc')
  && !['localhost', 'hlx.page'].some((url) => window.location.host.includes(url))) {
  loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
    type: 'text/javascript',
    charset: 'UTF-8',
    'data-domain-script': DATA_DOMAIN_SCRIPT,
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
  }(window, document, 'script', 'dataLayer', GTM_ID));
}

// Hotjar
async function loadHotjar() {
  /* eslint-disable */
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:HOTJAR_ID,hjsv:6}; a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1; r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  /* eslint-enable */
}

// Account Engagement Tracking Code
async function loadAccountEngagementTracking() {
  const body = document.querySelector('body');
  const script = document.createElement('script');
  script.type = 'text/javascript';

  const { piAId, piCId, piHostname } = ACCOUNT_ENGAGEMENT_TRACKING_CONSTANTS;

  script.text = `piAId = '${piAId}'; piCId = '${piCId}'; piHostname = '${piHostname}'; (function() { function async_load(){ var s = document.createElement('script'); s.type = 'text/javascript'; s.src = ('https:' == document.location.protocol ? 'https://pi' : 'http://cdn') + '.pardot.com/pd.js'; var c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c); } if(window.attachEvent) { window.attachEvent('onload', async_load); } else { window.addEventListener('load', async_load, false); } })();`;

  body.append(script);
}
