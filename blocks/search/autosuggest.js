import { createElement } from '../../scripts/scripts.js';
import { autosuggestQuery, fetchData } from './search-api.js';

export default function fetchAutosuggest(term, autosuggestEle, rowEle, onclickHanlder) {
  const fragmentRange = document.createRange();

  fetchData({
    query: autosuggestQuery(),
    variables: {
      term,
      locale: 'EN',
      sizeSuggestions: 5,
    },
  }).then(({ errors, data }) => {
    if (errors) {
      // eslint-disable-next-line no-console
      console.log('%cSomething went wrong', errors);
    } else {
      const {
        macktrucksuggest: {
          terms,
        } = {},
      } = data;
      autosuggestEle.textContent = '';
      if (terms.length) {
        terms.forEach((val) => {
          const row = createElement(rowEle.tag, rowEle.class, rowEle.props);
          const suggestFragment = fragmentRange
            .createContextualFragment(`<b>
            ${val}
          </b>`);
          row.appendChild(suggestFragment);

          row.onclick = () => onclickHanlder();

          autosuggestEle.appendChild(row);
          autosuggestEle.classList.add('show');
        });
      }
    }
  });
}
