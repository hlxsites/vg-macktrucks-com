import { getMetadata } from './lib-franklin.js';

// check if an active campaign is running or OneTrust needs scan the active scripts
export const COOKIE_CHECK = false;

// ONE TRUST COOKIE CONSENT
export const DATA_DOMAIN_SCRIPT = 'bf50d0a6-e209-4fd4-ad2c-17da5f9e66a5';

// GOOGLE TAG MANAGER ID
export const GTM_ID = 'GTM-NDMV8BN';

// HOTJAR ID
export const HOTJAR_ID = 597204;

// COOKIE Constants
export const COOKIE_VALUES = {
  performance: 'C0002',
  targeting: 'C0004',
  social: 'C0005',
};

// ACCOUNT ENGAGEMENT TRACKING Constants
export const ACCOUNT_ENGAGEMENT_TRACKING_CONSTANTS = {
  piAId: 1039343,
  piCId: 122594,
  piHostname: 'pi.pardot.com',
};

export const FORM_MAGAZINE_SUBSCRIBE = {
  href: 'https://go.pardot.com/l/1038343/2023-12-12/3m4w2c',
  iframeSize: '900px',
};

// videoURLRegex: verify if a given string follows a specific pattern indicating it is a video URL
// videoIdRegex: extract the video ID from the URL
export const AEM_ASSETS = {
  aemCloudDomain: '.adobeaemcloud.com',
  videoURLRegex: /\/assets\/urn:aaid:aem:[\w-]+\/play/,
  videoIdRegex: /urn:aaid:aem:[0-9a-fA-F-]+/,
};

// check if the header has to have a login and/or a search button
const isLoginDomain = getMetadata('login') !== '';
const isSearchDomain = getMetadata('search') !== '';
export const HEADER_BUTTONS = {
  login: isLoginDomain,
  search: isSearchDomain,
};
