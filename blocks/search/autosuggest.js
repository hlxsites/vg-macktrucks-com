import { createElement } from '../../scripts/scripts.js';
import { autosuggestQuery, fetchData } from './search-api.js';

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  }
}

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className = className;
  }
}

export function fetchAutosuggest(term, autosuggestEle, rowEle, func) {
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
      autosuggestEle.classList.remove('show');

      if (terms.length) {
        terms.forEach((val) => {
          const row = createElement(rowEle.tag, rowEle.class, rowEle.props);
          const suggestFragment = fragmentRange
            .createContextualFragment(`<b>
            ${val}
          </b>`);
          row.appendChild(suggestFragment);

          row.onclick = () => func(val);

          autosuggestEle.appendChild(row);
          autosuggestEle.classList.add('show');
        });
      }
    }
  });
}

export function handleArrowUp(props) {
  let { liSelected, next, index } = props;
  const { list } = props;
  const listLen = list.length - 1;

  if (liSelected) {
    removeClass(liSelected, 'autosuggest-results-item-highlighted');
    index -= 1;

    next = list[index];
    if (next && index >= 0) {
      liSelected = next;
    } else {
      index = list.length - 1;
      liSelected = list[index];
    }
  } else {
    index = 0;
    liSelected = list[listLen];
  }
  addClass(liSelected, 'autosuggest-results-item-highlighted');
  return { liSelected, index, next };
}

export function handleArrowDown(props) {
  let { index, liSelected, next } = props;
  const { list } = props;

  index += 1;

  if (liSelected) {
    removeClass(liSelected, 'autosuggest-results-item-highlighted');
    next = list[index];
    if (next && index < list.length) {
      liSelected = next;
    } else {
      index = 0;
      [liSelected] = list;
    }
  } else {
    index = 0;
    [liSelected] = list;
  }

  addClass(liSelected, 'autosuggest-results-item-highlighted');
  return { index, liSelected, next };
}
