import { loadScript, loadCSS } from '../../scripts/lib-franklin.js';
import { TOOLS_CONFIGS } from '../../scripts/common.js';
import template from './shared/template.js';

const { GOOGLE_API_KEY } = TOOLS_CONFIGS;

function escapeHTML(input) {
  return input.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function decorate(block) {
  const searchParams = new URLSearchParams(window.location.search);
  const hasZipLocation = searchParams.has('l');
  const MQ = window.matchMedia('(max-width: 992px)');
  const isMobile = MQ.matches;
  // add the zip code to the input search, if it is present
  const zipCode = hasZipLocation ? escapeHTML(searchParams.get('l')) : null;
  const datasource = block.textContent.trim();
  window.locatorConfig = {
    asist: false,
    showAsistDialog: true,
    consolidateFilters: true,
    selectedBrand: 'mack',
    dataSource: datasource,
    apiKey: GOOGLE_API_KEY,
    // These need to come from a config:
    vervion: 'la', // 'default' or 'la'
    country: 'Chile',
    amenities: ['Appointments Accepted', 'Bilingual Service', 'Driver Lounge', 'Free Pickup and Delivery', 'Hotel Shuttle', 'Internet Service', 'Laundry', 'Showers', 'Telephones', 'Trailer Parking', 'Video Games'],
  };
  const isLAMarket = window.locatorConfig.vervion === 'la';
  const sharedTemplate = template({ zipCode, isMobile, isLAMarket });

  if (window.locatorConfig.vervion === 'la') {
    loadCSS('/blocks/v2-dealer-locator/la/dealer-locator.css');
  }

  block.innerHTML = sharedTemplate;

  loadScript('/blocks/v2-dealer-locator/shared/vendor/jquery.min.js', { type: 'text/javascript', charset: 'UTF-8' })
    .then(() => {
      // these scripts depend on jquery:
      if (window.locatorConfig.vervion === 'la') {
        loadScript('/blocks/v2-dealer-locator/la/sidebar-maps.js', { type: 'text/javascript', charset: 'UTF-8' });
      } else {
        loadScript('/blocks/v2-dealer-locator/default/sidebar-maps.js', { type: 'text/javascript', charset: 'UTF-8' });
      }

      loadScript('/blocks/v2-dealer-locator/default/my-dealer.js', { type: 'text/javascript', charset: 'UTF-8' });
    });

  loadScript('/blocks/dealer-locator/shared/vendor/moment.js', { type: 'text/javascript', charset: 'UTF-8' })
    .then(() => {
      loadScript('/blocks/dealer-locator/shared/vendor/moment-timezone.min.js', { type: 'text/javascript', charset: 'UTF-8' });
    });
}
