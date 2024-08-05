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
  let isAllowed;
  const allowedCountries = splitString(countries);

  const locationSuccess = async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await getUserCountryName(latitude, longitude);
    const country = (splitString(response).reverse())[0];

    if (allowedCountries.includes(country)) isAllowed = true;
  };
  const locationError = (error) => {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
    isAllowed = false;
  };

  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

  return isAllowed;
};
