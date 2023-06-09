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

  // check if url has query params
  const urlParams = new URLSearchParams(window.location.search);
  let searchTerm = urlParams.get('q');
  let offset = urlParams.get('start');
  offset = offset ? Number(offset) : 1;
  const limit = 25;

  block.textContent = '';
  const mainTemplate = getMainTemplate(PLACEHOLDERS.searchFor);
  const mainFragment = document.createRange().createContextualFragment(mainTemplate);
  block.appendChild(mainFragment);

  // after insert the main template, both elements are present then
  const searchBtn = block.querySelector('.sf-form > span');
  const input = document.getElementById('searchTerm');

  function searchResults() {
    insertUrlParam('q', input.value);
    fetchResults(offset, input.value);
  }

  searchBtn.onclick = () => searchResults();
  input.onkeyup = (e) => e.key === 'Enter' && searchResults;

  const paginationConatiner = block.querySelector('.search-pagination-container');

  const nextBtn = paginationConatiner.querySelector('.next');
  nextBtn.onclick = () => pagination('next');

  const prevBtn = paginationConatiner.querySelector('.prev');
  prevBtn.onclick = () => pagination('prev');

  const countSpan = paginationConatiner.querySelector('.count');
  const resRange = paginationConatiner.querySelector('.page-range');

  function showResults(data) {
    const { items } = data;
    const resultsWrapper = document.getElementById('searchResultsSection');
    const summary = document.getElementById('searchResultSummarySection');
    // TODO const sortBy = document.getElementById('searchOptionsSection');
    const queryTerm = searchTerm || input.value;
    let resultsText = '';
    let hasResults = true;
    if (items.length > 0) {
      paginationConatiner.classList.add('show');
      summary.parentElement.classList.remove('no-results');
      resultsText = getResultsItemsTemplate({ items, queryTerm });
    } else {
      const noResults = PLACEHOLDERS.noResults.replace('$0', `"${
        queryTerm.trim() === '' ? ' ' : queryTerm}"`);
      summary.parentElement.classList.add('no-results');
      resultsText = getNoResultsTemplate({ noResults, refine: PLACEHOLDERS.refine });
      hasResults = false;
    }

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

  function insertUrlParam(key, value) {
    if (window.history.pushState) {
      const searchUrl = new URL(window.location.href);
      searchUrl.searchParams.set(key, value);
      window.history.pushState({}, '', searchUrl.toString());
    }
  }

  function updatePaginationDOM(data) {
    let isPrevDisabled = false;
    let isNextDisabled = false;
    const rangeText = `${(limit * (offset - 1)) + 1}-${(limit * (offset - 1)) + data.items.length}`;

    // disable the prev , next buttons
    if (offset === 1) {
      isPrevDisabled = 'disabled';
    }
    if ((offset + 1) * limit > data.count) {
      isNextDisabled = 'disabled';
    }
    prevBtn.setAttribute('disabled', isPrevDisabled);
    nextBtn.setAttribute('disabled', isNextDisabled);
    resRange.innerText = rangeText;
  }

  async function fetchResults(offsetVal, queryTerm) {
    searchTerm = queryTerm;
    const isProd = !window.location.host.includes('hlx.page') && !window.location.host.includes('localhost');
    const SEARCH_LINK = !isProd ? 'https://search-api-dev.aws.43636.vnonprod.com/search' : '';

    const queryObj = {
      query: `
      query MacTrucksQuery($q: String, $limit: Int, $offset: Int, $language: MackLocaleEnum!, $facets: [MackFacet]) {
        macktrucksearch(q: $q, limit: $limit, offset: $offset, language: $language, facets: $facets) {
          count
          items {
            metadata {
              title
              description
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
        facets: [{
          field: 'TAGS',
        }, {
          field: 'CATEGORY',
        }],
        offset: offsetVal,
        limit,
        language: 'EN',
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

    const {
      errors,
      data: {
        macktrucksearch,
      } = {},
    } = await response.json();
    if (errors) {
      // eslint-disable-next-line no-console
      console.log('%cSomething went wrong', 'color:red');
    } else {
      countSpan.innerText = macktrucksearch.count;
      showResults(macktrucksearch);
      updatePaginationDOM(macktrucksearch);
    }
  }

  function pagination(type) {
    offset = type === 'next' ? offset + 1 : offset - 1;
    insertUrlParam('start', offset);
    fetchResults(offset, searchTerm);
  }

  if (searchTerm) fetchResults(offset, searchTerm);
}
