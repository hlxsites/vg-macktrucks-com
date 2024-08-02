import { getTextLabel } from '../../scripts/common.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const blockName = 'v2-country-check';
// TODO this 2 values could come from constants file
const apiKey = 'AIzaSyAP8IewqHuU8SMz_6tNiIUlbU_l0GFOd1w';
const languageCode = 'en';
// TODO replace for page in main directory
const errorPage = '/drafts/shomps/country-error';

const url = window.location.origin + errorPage;

const splitString = (str) => str.split(',').map((item) => item.trim());

const getUserCountryName = async (lat, lng) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${languageCode}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const locationObj = await response.json();
  const locationString = locationObj.plus_code.compound_code;

  return locationString;
};

export default async function decorate(block) {
  const container = block.parentElement.parentElement;
  container.innerHTML = '';
  container.textContent = getTextLabel('loading');
  container.classList.add('h2');

  const countryList = readBlockConfig(block);
  const allowedCountries = splitString(countryList.countries);

  const locationSuccess = async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await getUserCountryName(latitude, longitude);
    const country = (splitString(response).reverse())[0];

    // If user country is not in the allowed countries array it will redirect to the set url
    if (!allowedCountries.includes(country)) window.location.replace(url);

    document.querySelector(`.${blockName}-container`).remove();
  };
  const locationError = (error) => {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
  };

  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
}
