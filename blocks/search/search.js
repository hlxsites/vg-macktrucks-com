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
  previous: getTextLabel('Previous'),
  next: getTextLabel('Next'),
};

const SEARCH_URLS = {
  prod: 'https://kb3ko4nzt2.execute-api.eu-west-1.amazonaws.com/prod/search',
  dev: 'https://search-api-dev.aws.43636.vnonprod.com/search',
};

export default function decorate(block) {
  const section = getTargetParentElement(block, { className: 'section' });
  // check if the closest default content wrapper is inside the same section element
  const siblingDefaultSection = section.querySelector('.default-content-wrapper');
  const popularSearchWrapper = siblingDefaultSection || section.nextElementSibling;
  const fragmentRange = document.createRange();
  popularSearchWrapper.classList.add('popular-search');

  // check if url has query params
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q');
  let offset = urlParams.get('start');
  offset = offset ? Number(offset) : 0;
  let resultCount = 0;
  const limit = 25;
  const nextOffset = offset + limit;
  let hasResults = true;
  let facetsFilters = [];

  const mainTemplate = getMainTemplate(PLACEHOLDERS);
  const mainFragment = fragmentRange.createContextualFragment(mainTemplate);
  block.textContent = '';
  block.appendChild(mainFragment);

  // after insert the main template, these elements are present then
  const searchBtn = block.querySelector('.sf-form > span');
  const input = document.getElementById('searchTerm');
  input.value = searchTerm;
  const facetsWrapper = document.getElementById('searchFacetSection');
  const resultsWrapper = document.getElementById('searchResultsSection');
  const summary = document.getElementById('searchResultSummarySection');
  const sortBy = document.getElementById('searchOptionsSection');

  function searchResults() {
    insertUrlParam('q', input.value);
    fetchResults();
  }

  searchBtn.onclick = () => searchResults();
  input.onkeyup = (e) => e.key === 'Enter' && searchResults();

  // pagination events
  const paginationContainer = block.querySelector('.search-pagination-container');
  const countSpan = paginationContainer.querySelector('.count');
  const resRange = paginationContainer.querySelector('.page-range');

  const nextBtn = paginationContainer.querySelector('.next');
  nextBtn.onclick = () => pagination('next');

  const prevBtn = paginationContainer.querySelector('.prev');
  prevBtn.onclick = () => pagination('prev');

  const addMoreBtnToggleEvent = (e) => {
    const facetList = e.target.parentElement.previousElementSibling;
    const isMore = e.target.textContent.toLowerCase() === 'more';
    e.target.textContent = isMore ? 'Less' : 'More';
    [...facetList.children].forEach((li, i) => {
      if (i <= 2) return;
      li.classList.toggle('d-none', !isMore);
    });
  };

  const addFacetTitlesToggleEvent = (e) => {
    const titleList = e.target.closest('.sidebar-heading').nextElementSibling;
    const isShown = titleList.classList.contains('show');
    e.target.classList.toggle('active', !isShown);
    titleList.classList.toggle('show', !isShown);
  };

  const addToggleOverlayEvent = (sidebar, overlay, isOpen = false) => {
    const showClass = 'show-facet-overlay';
    sidebar.classList.toggle(showClass, isOpen);
    overlay.classList.toggle(showClass, isOpen);
  };

  // handle filters
  const addFilterEvent = (e, form) => {
    form.requestSubmit();
  };

  const updateFilterCheckbox = () => {
    // const facetsArr = facets.reduce((acc, curVal) => acc.concat(curVal.items), []);
    const form = block.querySelector('form');
    [...form].forEach((field) => {
      const isChecked = facetsFilters.find(({ value }) => value.includes(field.value));
      if (isChecked) {
        field.checked = true;
      }
    });
  };

  const addFilterSubmitEvent = (e) => {
    e.preventDefault();
    const form = e.target;
    const inputsChecked = [];
    [...form].forEach((field) => {
      inputsChecked.push(field.id);

      const facetIndex = facetsFilters.findIndex((item) => item.field === field.dataset.filter);

      if (facetIndex > -1) {
        facetsFilters[facetIndex].value = facetsFilters[facetIndex].value
          .filter((val) => val !== field.value);

        if (field.checked) {
          facetsFilters[facetIndex].value.push(field.value);
        }
        if (!facetsFilters[facetIndex].value.length) {
          facetsFilters = facetsFilters.filter((item) => item.field !== field.dataset.filter);
        }
      } else if (field.checked) {
        facetsFilters.push({
          field: field.dataset.filter,
          value: [field.value],
        });
      }
    });
    const filterParams = ['tags', 'category'];

    filterParams.forEach((item) => {
      const filter = facetsFilters.find(({ field }) => field.toLowerCase() === item);

      if (filter) {
        insertUrlParam(item, filter.value);
        return;
      }
      insertUrlParam(item, '', true);
    });
    facetsFilters = [];
    fetchResults();
  };

  const addFacetsEvents = (facets) => {
    if (!facets) return;
    const facetSidebar = facets.querySelector('.sf-sidebar-container');
    const facetOverlay = facets.querySelector('.sidebar-background');
    const closeBtns = facets.querySelectorAll('.search-close-button, .close-button');
    const titles = facets.querySelectorAll('.sidebar-heading a');
    const filtersForm = facets.querySelector('#facetsFilters');
    if (titles.length > 0) {
      [...titles].forEach((title) => {
        title.onclick = addFacetTitlesToggleEvent;
      });
    }
    const moreBtns = facets.querySelectorAll('.more-less a');
    if (moreBtns.length > 0) {
      [...moreBtns].forEach((btn) => {
        btn.onclick = addMoreBtnToggleEvent;
      });
    }
    const filterByBtn = facets.querySelector('.pill');
    filterByBtn.onclick = () => {
      addToggleOverlayEvent(facetSidebar, facetOverlay, true);
    };

    [...closeBtns].forEach((btn) => {
      btn.onclick = () => addToggleOverlayEvent(facetSidebar, facetOverlay);
    });

    filtersForm.addEventListener('submit', addFilterSubmitEvent);
    filtersForm.onchange = (e) => addFilterEvent(e, filtersForm);

    if (facetsFilters.length) {
      updateFilterCheckbox();
    }
  };

  // handle sort
  const sortResults = block.querySelector('.custom-select-searchstudio-js');
  const sort = urlParams.get('sort');
  if (sort) sortResults.value = sort;
  sortResults.onchange = (e) => {
    insertUrlParam('sort', e.target.value);
    fetchResults();
  };

  function showResults(data) {
    const { items, count, facets } = data;
    const queryTerm = searchTerm || input.value;
    let resultsText = '';
    let facetsText = null;
    if (items.length > 0) { // items by query: 25, count has the total
      paginationContainer.classList.add('show');
      summary.parentElement.classList.remove('no-results');
      resultsText = getResultsItemsTemplate({ items, queryTerm });
      facetsText = getFacetsTemplate(facets);
      resultCount = count;
      hasResults = true;
    } else {
      const noResults = PLACEHOLDERS.noResults.replace('$0', `"${
        queryTerm.trim() === '' ? ' ' : queryTerm}"`);
      summary.parentElement.classList.add('no-results');
      resultsText = getNoResultsTemplate({ noResults, refine: PLACEHOLDERS.refine });
      hasResults = false;
    }
    const fragment = fragmentRange.createContextualFragment(resultsText);
    summary.textContent = '';
    resultsWrapper.textContent = '';
    facetsWrapper.textContent = '';
    if (hasResults) {
      const newOffset = nextOffset > count ? count : nextOffset;
      const showingResults = PLACEHOLDERS.showingResults.replace('$0', `${offset + 1}`)
        .replace('$1', newOffset).replace('$2', count).replace('$3', queryTerm);
      const showingResultsText = getShowingResultsTemplate(showingResults);
      const summaryFragment = fragmentRange.createContextualFragment(showingResultsText);
      const facetsFragment = fragmentRange.createContextualFragment(facetsText);
      resultsWrapper.appendChild(fragment);
      summary.appendChild(summaryFragment);
      facetsWrapper.appendChild(facetsFragment);
      addFacetsEvents(facetsWrapper);
    } else {
      summary.appendChild(fragment);
    }
    sortBy.classList.toggle('hide', !hasResults);
  }

  function insertUrlParam(key, value = '', isDelete = false) {
    if (window.history.pushState) {
      const searchUrl = new URL(window.location.href);
      if (!isDelete) {
        searchUrl.searchParams.set(key, value);
      } else {
        searchUrl.searchParams.delete(key);
      }
      window.history.pushState({}, '', searchUrl.toString());
    }
  }

  function updatePaginationDOM(data) {
    let isPrevDisabled = false;
    let isNextDisabled = false;
    const rangeText = `${offset + 1}-${nextOffset >= resultCount ? resultCount : nextOffset}`;

    // disable the prev , next buttons
    if (offset === 0) {
      isPrevDisabled = 'disabled';
    }
    if (nextOffset >= data.count) {
      isNextDisabled = 'disabled';
    }
    prevBtn.setAttribute('disabled', isPrevDisabled);
    nextBtn.setAttribute('disabled', isNextDisabled);
    resRange.innerText = rangeText;
  }

  async function fetchResults() {
    const searchParams = new URLSearchParams(window.location.search);
    const queryTerm = searchParams.get('q');
    const offsetVal = Number(searchParams.get('start'));
    const sortVal = searchParams.get('sort') || 'BEST_MATCH';
    const isProd = !window.location.host.includes('hlx.page') && !window.location.host.includes('localhost');
    const SEARCH_LINK = !isProd ? SEARCH_URLS.dev : SEARCH_URLS.prod;

    const tags = searchParams.get('tags');
    const category = searchParams.get('category');

    if (tags) {
      facetsFilters.push({
        field: 'TAGS',
        value: tags.split(','),
      });
    }

    if (category) {
      facetsFilters.push({
        field: 'CATEGORY',
        value: category.split(','),
      });
    }

    const isFilters = facetsFilters.length;

    const queryObj = {
      query: `
      query MacTrucksQuery($q: String, $offset: Int, $limit: Int, $language: MackLocaleEnum!,
      $facets: [MackFacet], $sort: [MackSortOptionsEnum]${isFilters ? ', $filters: [MackFilterItem]' : ''}) {
        macktrucksearch(q: $q, offset: $offset, limit: $limit, language: $language,
      facets: $facets, sort: $sort${isFilters ? ', filters: $filters' : ''}) {
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
        offset: offsetVal,
        limit,
        sort: sortVal,
      },
    };

    if (isFilters) queryObj.variables.filters = facetsFilters;

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
      console.log('%cSomething went wrong');
    } else {
      countSpan.innerText = macktrucksearch.count;
      showResults(macktrucksearch);
      updatePaginationDOM(macktrucksearch);
    }
  }

  function getNextOffset(isNext = false) {
    if (isNext) {
      return nextOffset <= resultCount ? nextOffset : offset + 1;
    }
    const temp = offset - limit;
    return temp > 0 ? temp : 0;
  }

  function pagination(type) {
    offset = getNextOffset(type === 'next');
    insertUrlParam('start', offset);
    fetchResults();
  }

  if (searchTerm) fetchResults();
}
