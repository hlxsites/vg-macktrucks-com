// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// if (document.getElementById('div-widget-id') && !document.querySelector('.studio-widget-autosuggest-results')) {
//   window.initiateSearchWidget();
// }
// add more delayed functionality here
