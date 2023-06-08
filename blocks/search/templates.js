export const getMainTemplate = (placeholder) => `
<div class="search-input-wrapper">
  <div id="searchInput" class="input-container-custom">
    <div class="sf-header-searchstudio-js mb-5">
      <div class="sf-form">
        <div id="autosuggest" class="form-control-suggest">
          <div role="combobox" aria-expanded="false" aria-haspopup="listbox"
            aria-owns="autosuggest-autosuggest__results">
            <input type="text" autocomplete="off" aria-autocomplete="list" id="searchTerm"
              aria-controls="autosuggest-autosuggest__results"
              placeholder="${placeholder}..." autofocus="autofocus">
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

<div class="search-results-summary-options-wrapper">
  <div id="searchResultSummarySection"></div>
  <div id="searchOptionsSection"></div>
</div>

<div class="search-results-wrapper">
  <div class="facet-container-wrapper">
    <div id="searchFacetSection"></div>
  </div>
  <div class="result-container-wrapper">
    <div id="searchResultsSection"></div>
    <div id="paginationSection"></div>
  </div>
</div>
`;

export const getNoResultsTemplate = ({ noResults, refine }) => `
  <div class="search-feedback-filters-wrapper">
    <div className="search-feedback-filters-custom">
      <div className="sf-filter-info-custom">
        <span class="no-result-msg">${noResults}</span>
        <br />
        <span class="no-result-msg2">${refine}</span>
      </div>
    </div>
  </div>
`;

const addEmTag = (text, value) => {
  const words = text.split(' ');
  const result = words.map((word) => (word.toLowerCase() === value.toLowerCase()
    ? `<em>${word}</em>`
    : word));
  return result.join(' ');
};

export const getResultsItemsTemplate = ({ items, queryTerm }) => {
  let result = '';
  items.forEach((item) => {
    const { description, title, url } = item.metadata;
    const emDescription = addEmTag(description, queryTerm);
    const emTitle = addEmTag(title, queryTerm);
    result += `
      <div class="list-wrapper">
        <div class="card-searchstudio-js-custom">
          <div class="card-searchstudio-jsClass">
            <div class="card-searchstudio-js-body p-0">
              <div class="card-searchstudio-js-title">
                <a href="${url}" target="_blank" class="stretched-link">
                  <h4>${emTitle}</h4>
                </a>
              </div>
              <div class="card-searchstudio-js-body p-0">
                <div class="card-searchstudio-js-text article_promo_short_overview_t">
                  <p class="Find">${emDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  return `
    <div id="searchContainer">
      <div class="container">
        <div class="result-edit">
          <div class="sf-lists active layout-list">
            <div class="row reset-row">
              <div class="sf-list w-100 p-0 d-flex flex-wrap position-relative">
                ${result}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
