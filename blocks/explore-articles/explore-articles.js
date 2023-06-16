import { createElement, getTextLabel } from '../../scripts/scripts.js';
import { getAllArticles } from '../recent-articles/recent-articles.js';

const allArticles = await getAllArticles();
const allCategories = [...new Set(allArticles.map((article) => article.category))];
const allTrucks = [...new Set(allArticles.map((article) => article.truck))];

const [categoryPlaceholder, truckPlaceholder] = getTextLabel('Article filter placeholder').split(',');

const articlesPerChunk = 4;
let counter = 1;

const divideArray = (mainArray, perChunk) => {
  const dividedArrays = mainArray.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/perChunk);
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [])
  return dividedArrays
}

const getOptions = (list, placeholder) => {
  const options = [];
  list.unshift(placeholder);
  list.forEach((value) => {
    if (value.length === 0) return null;
    const option = createElement('option', '', { value: value });
    option.innerText = value;
    options.push(option);
  });
  return options;
};

const buildSelect = (type, array, text) => {
  const select = createElement('select', ['input-field', `${type}-input`], { id: type, name: type });
  const options = getOptions(array, text);
  options.forEach((option) => {
    select.append(option);
  });
  return select;
};

const buildArticle = (e) => {
  const article = createElement('div', ['article']);
  const articleImage = createElement('div', 'article-image');
  const articleContent = createElement('div', 'article-content');

  const linkUrl = new URL(e.path, window.location.origin);

  const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
  const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, window.location.origin);

  const image = createElement('img', 'image', { src: e.image });
  articleImage.append(image);

  const category = createElement('a', 'article-category', { href: categoryUrl });
  category.innerText = e.category;

  const title = createElement('h3', 'article-title', { href: linkUrl });
  title.innerText = e.title;

  const truck = createElement('div', 'article-truck');

  articleContent.append(category, title);

  if (e.subtitle.length !== 0) {
    const subtitle = createElement('p', 'article-subtitle', { href: linkUrl });
    subtitle.innerText = e.subtitle;
    articleContent.append(subtitle);
  }

  if (e.truck.length !== 0) {
    const truckText = createElement('p', 'article-truck-text');
    truckText.innerText = e.truck;
    const truckIcon = createElement('img', 'article-truck-icon', { src: '/icons/Truck_Key_icon.svg', alt: 'truck icon' });
    truck.append(truckIcon, truckText);
    articleContent.append(truck);
  }

  article.append(articleImage, articleContent);
  return article;
};

const loadMoreArticles = (evt, articleGroups, totalAmount, amountOfGroups) => {
  evt.preventDefault();
  const activeButton = evt.srcElement
  const allShownArticles = document.querySelectorAll('.article');
  const lastShownArticle = allShownArticles[allShownArticles.length - 1]
  const lastShownId = +(lastShownArticle.id.split('-').pop())
  const nextArticleGroup = articleGroups[lastShownId + 1]

  nextArticleGroup.forEach((e, idx) => {
    if (idx != 0) lastShownArticle.insertAdjacentElement('afterend', e)
  });

  console.warn(amountOfGroups)
  console.warn(counter)
  
  if ((amountOfGroups - 1) <= counter) {
    console.log(amountOfGroups)
    console.log(counter)
    activeButton.remove()
  }
  
  counter = counter + 1;

  // console.log(allShownArticles.length, totalAmount)
  // if (allShownArticles.length <= totalAmount) activeButton.remove()
  // if (allShownArticles.length !<= totalAmount) activeButton.remove()
}

const addAllArrays = (array) => {
  let initialValue = 0
  const totalArticles = array.reduce(
    (acc, curr) => acc + curr.length,
    initialValue
  );
  return totalArticles
}

const getArticleGroups = (artGroup) => {
  const groups = []
    artGroup.forEach((articleGroup, idx) => {
      const group = [idx]
      articleGroup.forEach((el) => {
        const article = buildArticle(el);
        article.id = `group-${idx}`
        group.push(article)
      });
      groups.push(group)
    });
  return groups
}

const buildFirstArticles = (art, section) => {
  const firstArticles = art[0]
  firstArticles.forEach((e, idx) => {
    if (idx != 0) section.append(e)
  });
}

const buildArticleList = (articles) => {
  const groupedArticles = divideArray(articles, articlesPerChunk)
  const articleGroups = getArticleGroups(groupedArticles)
  const totalArticlesNumber = addAllArrays(groupedArticles)
  const amountOfGroups = articleGroups.length

  const paginationSection = createElement('div', 'pagination-section');
  const articlesSection = createElement('div', 'explore-articles-articles');

  const amountOfArticles = createElement('p', 'article-amount');
  amountOfArticles.textContent = (totalArticlesNumber != 0) ?  `${totalArticlesNumber} articles` : getTextLabel('No article Message')

  paginationSection.append(amountOfArticles)
  articlesSection.append(paginationSection);

  const moreSection = createElement('div', 'explore-articles-more');
  const moreButton = createElement('button', 'more-btn');
  moreButton.textContent = getTextLabel('Load more articles button');
  moreButton.addEventListener('click', (evt) => loadMoreArticles(evt, articleGroups, totalArticlesNumber, amountOfGroups))
  if (totalArticlesNumber > articlesPerChunk) moreSection.append(moreButton);

  if (articleGroups.length != 0) {
    const articleListSection = createElement('div', 'article-list');
    buildFirstArticles(articleGroups, articleListSection);
    articlesSection.append(articleListSection, moreSection);
  }
  return articlesSection;
};

const handleForm = (event) => {
  // const fieldset = event.srcElement.parentNode.parentNode;
  event.preventDefault();
  counter = 1;
  const fieldset = document.querySelector('#explore-magazine-fieldset');
  const selects = fieldset.querySelectorAll('select');
  const [category, truck] = selects;

  const filteredList = allArticles.filter((article) => {
    const criteria = [
      category.value === categoryPlaceholder && truck.value === truckPlaceholder,
      category.value === categoryPlaceholder && truck.value === article.truck,
      category.value === article.category && truck.value === truckPlaceholder,
      category.value === article.category && truck.value === article.truck,
    ];
    const [criteria1, criteria2, criteria3, criteria4] = criteria;

    if (criteria1 || criteria2 || criteria3 || criteria4) {
      return article;
    }
    return null;
  });

  const articleList = document.querySelector('.explore-articles-articles');

  articleList.textContent = '';
  //add grouped articles
  const filteredArticles = buildArticleList(filteredList, 0);
  // if (filteredList.length != 0) articleList.append(filteredArticles);
  articleList.append(filteredArticles);
};

const buildFieldset = () => {
  const formSection = createElement('div', 'explore-articles-fieldset');
  const form = createElement('form', ['form', 'filter-list'], { method: 'get', name: 'article-fieldset' });
  form.addEventListener('change', handleForm);

  const fieldset = createElement('fieldset', ['fieldset', 'filter-list'], { method: 'get', name: 'article-fieldset', id: 'explore-magazine-fieldset' });

  const categoryField = createElement('div', 'category-field');
  const trucksField = createElement('div', 'trucks-field');

  categoryField.append(buildSelect('categories', allCategories, categoryPlaceholder));
  trucksField.append(buildSelect('trucks', allTrucks, truckPlaceholder));

  fieldset.append(categoryField, trucksField);

  form.append(fieldset);
  formSection.append(form);

  return formSection;
};


export default async function decorate(block) {
  const children = block.querySelectorAll('p');
  const [title, text] = children;

  const generalSection = createElement('div', 'explore-articles-section');

  const headingSection = createElement('div', 'explore-articles-heading');
  const contentSection = createElement('div', 'explore-articles-content');

  const h4Element = createElement('h4', 'explore-articles-title');
  h4Element.innerText = title.innerText;
  text.classList.add('explore-articles-text');

  headingSection.append(h4Element, text);
  contentSection.append(buildFieldset());

  contentSection.append(buildArticleList(allArticles, 0));

  generalSection.append(headingSection, contentSection);

  block.textContent = '';
  block.append(generalSection);
}
