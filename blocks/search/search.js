import { getTargetParentElement, getTextLabel } from '../../scripts/scripts.js';
import { getMainTemplate, getNoResultsTemplate, getResultsItemsTemplate } from './templates.js';

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
  popularSearchWrapper.classList.add('popular-search');
  let searchTerm = null;

  block.textContent = '';
  const mainTemplate = getMainTemplate(PLACEHOLDERS.searchFor);
  const mainFragment = document.createRange().createContextualFragment(mainTemplate);
  block.appendChild(mainFragment);

  // after insert the main template, both elements are present then
  const searchBtn = block.querySelector('.sf-form > span');
  const input = document.getElementById('searchTerm');

  searchBtn.onclick = () => fetchResults(input.value);
  input.onkeyup = (e) => e.key === 'Enter' && fetchResults(input.value);

  function showResults(data) {
    const { items } = data.macktrucksearch;
    const resultsWrapper = document.getElementById('searchResultsSection');
    const summary = document.getElementById('searchResultSummarySection');
    // TODO const sortBy = document.getElementById('searchOptionsSection');
    const queryTerm = searchTerm || input.value;
    let resultsText = '';
    let hasResults = true;
    if (items.length > 0) {
      summary.parentElement.classList.remove('no-results');
      resultsText = getResultsItemsTemplate({ items, queryTerm });
    } else {
      const noResults = PLACEHOLDERS.noResults.replace('$0', `"${
        queryTerm.trim() === '' ? ' ' : queryTerm}"`);
      summary.parentElement.classList.add('no-results');
      resultsText = getNoResultsTemplate({ noResults, refine: PLACEHOLDERS.refine });
      hasResults = false;
    }
    searchTerm = null;
    const fragment = document.createRange().createContextualFragment(resultsText);
    summary.textContent = '';
    resultsWrapper.textContent = '';
    if (hasResults) {
      resultsWrapper.appendChild(fragment);
      // TODO show sort by
    } else {
      summary.appendChild(fragment);
      // TODO hide sort by
    }
  }

  async function fetchResults(queryTerm = '') {
    const isProd = !window.location.host.includes('hlx.page') && !window.location.host.includes('localhost');
    const SEARCH_LINK = !isProd ? 'https://search-api-dev.aws.43636.vnonprod.com/search' : '';

    const queryObj = {
      query: `
      query MacTrucksQuery($q: String, $locale: LocaleEnum!, $facets: [Facet]) {
        macktrucksearch(q: $q, locale: $locale, facets: $facets) {
          count
          items {
            metadata {
              title
              description
              url
            }
          }
          facets {
            items {
              value
            }
          }
        }
      }
      `,
      variables: {
        q: queryTerm,
        locale: 'EN',
        facets: [{
          field: 'TAGS',
        }, {
          field: 'CATEGORY',
        }],
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
