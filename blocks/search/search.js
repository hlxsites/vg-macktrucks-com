import { getTargetParentElement, getTextLabel } from '../../scripts/scripts.js';

const PLACEHOLDERS = {
  searchFor: getTextLabel('Search For'),
};

// Implementation based on searchtax documentation https://www.searchstax.com/docs/searchstudio/searchstax-studio-searchjs-module/
export default function decorate(block) {
  const section = getTargetParentElement(block, { className: 'section' });
  // check if the closest default content wrapper is inside the same section element
  const siblingDefaultSection = section.querySelector('.default-content-wrapper');
  const popularSearchWrapper = siblingDefaultSection || section.nextElementSibling;
  popularSearchWrapper.classList.add('popular-search');

  block.innerHTML = `
  <div class="search-input-wrapper">
    <div id="searchInput" class="input-container-custom">
      <div class="sf-header-searchstudio-js mb-5">
        <div class="sf-form">
          <div class="form-group">
            <div id="autosuggest" class="form-control-suggest">
              <div role="combobox" aria-expanded="false" aria-haspopup="listbox"
                aria-owns="autosuggest-autosuggest__results">
                <input type="text" autocomplete="off" aria-autocomplete="list" id="searchTerm"
                  aria-controls="autosuggest-autosuggest__results"
                  placeholder="${PLACEHOLDERS.searchFor}..." autofocus="autofocus">
              </div>
              <div id="autosuggest-autosuggest__results" class="autosuggest__results-container"></div>
            </div>
            <span>
              <button type="submit" class="btn text-primary search-close-button">
                <span class="fa fa-search search-icon"></span>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
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

  const searchBtn = block.querySelector('.form-group > span');
  searchBtn.onclick = () => {
    const input = document.getElementById('searchTerm');
    const { value } = input;
    console.log({ value });
    fetchResults(value); // TODO get the input value to be applied in the search
  };

  async function fetchResults(queryTerm) {
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
      console.log(JSON.stringify(json.errors));
    } else {
      console.log((json.data));
    }
  }

  // check if url has query params
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q');
  if (searchTerm) fetchResults(searchTerm);
}
