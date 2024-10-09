/**
 * Get the magazine-article the JSON file at the root folder in sharepoint.
 * Filters out the articles with no image
 * @returns {Object} the object that contains all the magazine articles metadata
 */
export const getAllArticles = async () => {
  const magazineArticlesUrl = '/magazine-articles.json';
  const response = await fetch(magazineArticlesUrl);
  const json = await response.json();
  const filteredArray = json.data.filter((art) => art.image !== '');

  return filteredArray;
};

/**
 * Extracts the values from an array of objects and returns an array of values
 * example: [{ key: 'value' }] => ['value']
 * @param {Array} array - An array of objects
 * @returns {Array} An array of values
 */
function getValuesFromObjectsArray(array = []) {
  if (!Array.isArray(array) || array.length === 0) return [];
  return array.map((item) => Object.values(item)[0]);
}

/**
 * Extracts the matching tags from an array of tags and an array of article tags
 * and returns a string of matching tags
 * @param {Array} tags - An array of tags from the JSON file
 * @param {Array} articleTags - An array of article:tags
 * @returns {string} A string of matching tags
 */
function getMetadataFromTags(tags, articleTags) {
  if (!tags || !articleTags) {
    return '';
  }

  const matchingTags = [...articleTags]
    .filter((tag) => tags.includes(tag.content))
    .map((tag) => tag.content);
  return matchingTags && matchingTags?.length > 0 ? matchingTags.join(', ') : '';
}

/**
 * Get the article tags from the JSON file and the article tags from the document
 * and return the matching tags
 * @param {string} tagType - The type of tag to get such as 'categories', 'topics' or 'trucks'
 * @returns {string} A string of matching tags
 */
export async function getArticleTags(tagType) {
  const articleTags = document.head.querySelectorAll('meta[property="article:tag"]') || [];
  const tagItems = await getAllArticles();
  const tags = tagItems && tagItems[tagType]
    && getValuesFromObjectsArray(tagItems[tagType].data);
  return getMetadataFromTags(tags, articleTags);
}

/**
 * Extract the classes of a block and in case there is a 'limit-X' set, extract it as a number
 * @param {block} block - The block element
 * @returns {number} A number representing the limit
 */
export const getLimit = (block) => {
  const classes = block.classList;
  let limit;
  classes.forEach((e) => {
    const [name, value] = e.split('-');
    if (name === 'limit') limit = Number(value);
  });
  return limit;
};

/**
 * Extract the article that is currently open and delete it from the article list
 * @param {Array} articles - The list of articles
 */
export const deleteCurrentArticle = (articles) => articles.filter((e) => {
  const currentArticlePath = window.location.href.split('/').pop();
  const path = e.path.split('/').pop();
  if (path !== currentArticlePath) return e;
  return null;
});

/**
 * Sorts the article list by the 'lastModified' field in the json
 * @param {Array} articles - The list of article
 * @returns {Array} The same list of articles but sorted by lastModified
 */
export const sortArticlesByLastModified = (articles) => articles.sort((a, b) => {
  a.lastModified = +(a.lastModified);
  b.lastModified = +(b.lastModified);
  return b.lastModified - a.lastModified;
});
