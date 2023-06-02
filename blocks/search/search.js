import { getTargetParentElement } from '../../scripts/scripts.js';

// Implementation based on searchtax documentation https://www.searchstax.com/docs/searchstudio/searchstax-studio-searchjs-module/
export default function decorate(block) {
  const section = getTargetParentElement(block, { className: 'section' });
  // check if the closest default content wrapper is inside the same section element
  const siblingDefaultSection = section.querySelector('.default-content-wrapper');
  const popularSearchWrapper = siblingDefaultSection || section.nextElementSibling;
  popularSearchWrapper.classList.add('popular-search');

  block.innerHTML = `
  <div class="search-input-wrapper">
    <div id="searchInput"></div>
  </div>

  <div class="search-results-summary-options-wrapper">
    <div id="searchResultSummarySection"></div>
    <div id="searchOptionsSection"></div>
  </div>

  <div class="search-results-wrapper">
    <div class="facet-container-wrapper">
      <div id="searchFacetSection"></div>
    </div>
    <div class="result-container-wrapper">
      <div id="external-search-result-container"></div>
      <div id="searchResultsSection"></div>
      <div id="relatedSearchesSection"></div>
      <div id="paginationSection"></div>
    </div>
  </div>
  `;

  async function fetchResults() {
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
        q: 'trucks',
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
      console.log(JSON.stringify(json.errors));
    } else {
      console.log((json.data));
    }
  }

  fetchResults();
}
