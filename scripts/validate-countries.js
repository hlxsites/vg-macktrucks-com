// TODO this 2 values could come from constants file
const apiKey = 'AIzaSyAP8IewqHuU8SMz_6tNiIUlbU_l0GFOd1w';
const languageCode = 'en';

export const splitString = (str) => str.split(',').map((item) => item.trim());

export const getUserCountryName = async (lat, lng) => {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${languageCode}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const locationObj = await response.json();
  const locationString = locationObj.plus_code.compound_code;

  return locationString;
};

export const validateCountries = async (countries = []) => {
  const allowedCountries = splitString(countries);

  const locationSuccess = async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await getUserCountryName(latitude, longitude);
    const country = (splitString(response).reverse())[0];

    // Check if country is included in the list that comes from the metadata
    if (!allowedCountries.includes(country)) {
      // TODO replace for page in main directory
      const errorPage = '/drafts/shomps/country-error';
      const completeUrl = window.location.origin + errorPage;

      // If user country is not in the allowed countries array it will redirect to the set url
      window.location.replace(completeUrl);
    }
  };
  const locationError = (error) => {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
  };
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
};
