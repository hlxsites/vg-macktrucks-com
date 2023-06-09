import { getTargetParentElement, getTextLabel } from '../../scripts/scripts.js';
import {
  getFacetsTemplate,
  getNoResultsTemplate,
  getMainTemplate,
  getResultsItemsTemplate,
  getShowingResultsTemplate,
} from './templates.js';

const PLACEHOLDERS = {
  searchFor: getTextLabel('Search For'),
  noResults: getTextLabel('no results'),
  refine: getTextLabel('refine'),
  showingResults: getTextLabel('Showing results for'), // searchResultSummarySection
  sortBy: getTextLabel('Sort By'), // searchOptionsSection
  sortFilter: getTextLabel('Sort Filter'),
};

export default function decorate(block) {
  const section = getTargetParentElement(block, { className: 'section' });
  // check if the closest default content wrapper is inside the same section element
  const siblingDefaultSection = section.querySelector('.default-content-wrapper');
  const popularSearchWrapper = siblingDefaultSection || section.nextElementSibling;
  const fragmentRange = document.createRange();
  popularSearchWrapper.classList.add('popular-search');
  let searchTerm = null;
  const offset = 0; // TODO has to be let and be updated in pagination

  block.textContent = '';
  const mainTemplate = getMainTemplate(PLACEHOLDERS);
  const mainFragment = fragmentRange.createContextualFragment(mainTemplate);
  block.appendChild(mainFragment);

  // after insert the main template, both elements are present then
  const searchBtn = block.querySelector('.sf-form > span');
  const input = document.getElementById('searchTerm');
  const resultsWrapper = document.getElementById('searchResultsSection');
  const summary = document.getElementById('searchResultSummarySection');
  const sortBy = document.getElementById('searchOptionsSection');

  searchBtn.onclick = () => fetchResults(input.value);
  input.onkeyup = (e) => e.key === 'Enter' && fetchResults(input.value);

  function showResults(data) {
    const { items, count, facets } = data.macktrucksearch;
    const queryTerm = searchTerm || input.value;
    let resultsText = '';
    let hasResults = true;
    let facetsText = null;
    if (items.length > 0) { // items by query: 20, count has the total
      summary.parentElement.classList.remove('no-results');
      resultsText = getResultsItemsTemplate({ items, queryTerm });
      facetsText = getFacetsTemplate(facets);
      console.log({facetsText});
    } else {
      const noResults = PLACEHOLDERS.noResults.replace('$0', `"${
        queryTerm.trim() === '' ? ' ' : queryTerm}"`);
      summary.parentElement.classList.add('no-results');
      resultsText = getNoResultsTemplate({ noResults, refine: PLACEHOLDERS.refine });
      hasResults = false;
    }
    searchTerm = null;
    const fragment = fragmentRange.createContextualFragment(resultsText);
    summary.textContent = '';
    resultsWrapper.textContent = '';
    if (hasResults) {
      const showingResults = PLACEHOLDERS.showingResults.replace('$0', `${offset + 1}`)
        .replace('$1', items.length).replace('$2', count).replace('$3', queryTerm);
      const showingResultsText = getShowingResultsTemplate(showingResults);
      const summaryFragment = fragmentRange.createContextualFragment(showingResultsText);
      resultsWrapper.appendChild(fragment);
      summary.appendChild(summaryFragment);
    } else {
      summary.appendChild(fragment);
    }
    sortBy.classList.toggle('hide', !hasResults);
  }

  async function fetchResults(queryTerm = '') {
    const isProd = !window.location.host.includes('hlx.page') && !window.location.host.includes('localhost');
    const SEARCH_LINK = !isProd ? 'https://search-api-dev.aws.43636.vnonprod.com/search' : '';

    const queryObj = {
      query: `
      query MacTrucksQuery($q: String, $offset: Int, $limit: Int, $language: MackLocaleEnum!, $facets: [MackFacet], $sort: [MackSortOptionsEnum]) {
        macktrucksearch(q: $q, offset: $offset, limit: $limit, language: $language, facets: $facets, sort: $sort) {
          count
          items {
            uuid
            score
            metadata {
              title
              description
              url
              lastModified
            }
          }
          facets {
            field
            items {
              value
              count
            }
          }
        }
      }
      `,
      variables: {
        q: queryTerm,
        language: 'EN',
        facets: [
          { field: 'TAGS' },
          { field: 'CATEGORY' },
        ],
        offset,
        limit: 20,
        sort: 'BEST_MATCH',
      },
    };

    const response = await fetch(
      SEARCH_LINK,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': queryObj.length,
        },
        body: JSON.stringify(queryObj),
      },
    );

    const json = await response.json();
    if (json.errors) {
      // eslint-disable-next-line no-console
      console.log('%cSomething went wrong', 'color:red');
    } else {
      showResults(json.data);
    }
  }

  // check if url has query params
  const urlParams = new URLSearchParams(window.location.search);
  searchTerm = urlParams.get('q');
  if (searchTerm) fetchResults(searchTerm);
}
