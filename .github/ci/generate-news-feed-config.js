async function getConstantValues() {
  const url = '/constants.json';
  let constants;
  try {
    const response = await fetch(url).then((resp) => resp.json());
    if (!response.ok) {
      constants = response;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error with constants file', error);
  }
  return constants;
}

const formatValues = (values) => {
  const obj = {};
  if (values) {
    /* eslint-disable-next-line */
    values.forEach(({ name, value }) => obj[name] = value);
  } else {
    // eslint-disable-next-line no-console
    console.error('Error with constants file', values);
  }
  return obj;
};

const getConfigs = async () => {
  const { newsFeedConfig, bodyBuilderNewsConfig } = await getConstantValues();
  const NEWS_FEED_CONFIGS = formatValues(newsFeedConfig?.data);
  const BODY_BUILDERS_FEED_CONFIGS = formatValues(bodyBuilderNewsConfig?.data);
  
  return [ NEWS_FEED_CONFIGS, BODY_BUILDERS_FEED_CONFIGS ];
};

export default getConfigs;
