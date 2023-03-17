function prependTabTitle(tab) {
  const tabTitle = tab.querySelector('h4');
  tabTitle.className = 'tab-title';
  tabTitle.setAttribute('tabindex', 0);
  tab.prepend(tabTitle);
}

function addTitlesListener(block) {
  const tabTitles = block.querySelectorAll('h4');
  block.onclick = (e) => {
    const { target } = e;
    if (target.localName !== 'h4') return;
    const tabContainer = target.parentElement;
    const tabContent = tabContainer.querySelector('.tab-content');
    const contentWrapper = tabContainer.querySelector('.content-wrapper');
    const isActive = tabContainer.classList.contains('active');
    [...tabTitles].forEach((tabTitle) => tabTitle.parentElement.classList.remove('active'));
    tabContainer.classList.toggle('active', !isActive);
    // tab fold/unfold animation
    tabContent.style.height = tabContent.clientHeight ? 0 : `${contentWrapper.clientHeight}px`;
    const otherTitles = [...tabTitles].filter((title) => title !== target);
    otherTitles.forEach((title) => {
      title.nextElementSibling.style.height = 0;
    });
  };
}

function isOutOfRange(isNext, movement, lastSlide) {
  const isFirstSlide = !isNext && movement > 0;
  const isLastSlide = isNext && movement < lastSlide;
  return isFirstSlide || isLastSlide;
}

function addClickListener(block) {
  const slideControls = block.querySelector('.slide-controls');
  const slidesContainer = block.querySelector('.slides-container');
  const arrows = slideControls.querySelectorAll('.slide-control');
  const previousBtn = slideControls.querySelector('.btn-previous');
  const nextBtn = slideControls.querySelector('.btn-next');
  const paginationBtns = slideControls.querySelectorAll('.pagination-link');
  const { length } = slidesContainer.children;
  slideControls.onclick = (e) => {
    const { target } = e;
    e.preventDefault();
    if (target.localName !== 'a') return;
    const activeSlide = slidesContainer.querySelector('.active');
    const isArrow = target.classList.contains('slide-control');
    let movement; let targetSlide; let targetArrow;
    if (isArrow) {
      const isNext = target.classList.contains('btn-next');
      const lastSlide = (length - 1) * -100;
      const sum = isNext ? -100 : 100;
      const slideIndex = activeSlide.dataset.value;

      targetArrow = target;
      targetSlide = isNext ? +slideIndex + 1 : +slideIndex - 1;
      movement = slideIndex * -100 + sum;
      if (isOutOfRange(isNext, movement, lastSlide)) return;
    } else {
      targetSlide = +target.dataset.value;
      movement = targetSlide * -100;
      if (targetSlide === length - 1) targetArrow = nextBtn;
      else if (targetSlide === 0) targetArrow = previousBtn;
    }
    slidesContainer.style = `translate: ${movement}%`;
    activeSlide.classList.remove('active');
    slidesContainer.querySelector(`[data-value="${targetSlide}"]`).classList.add('active');
    [...arrows].forEach((arrow) => arrow.classList.remove('disabled'));
    if (targetSlide === length - 1 || targetSlide === 0) targetArrow.classList.add('disabled');
    [...paginationBtns].forEach((btn) => btn.classList.remove('active'));
    slideControls.querySelector(`[data-value="${targetSlide}"]`).classList.add('active');
  };
}

function addSliderControls(tabContent, slidesLength) {
  const tabBody = tabContent.querySelector('.description');
  const slideControls = document.createElement('div');
  const previousBtn = document.createElement('a');
  const nextBtn = document.createElement('a');
  const pagination = document.createElement('div');
  const navList = document.createElement('ul');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < slidesLength; i++) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = `${i}`;
    a.dataset.value = `${i}`;
    a.className = i !== 0 ? 'pagination-link' : 'pagination-link active';
    li.appendChild(a);
    navList.appendChild(li);
  }
  previousBtn.href = '#';
  nextBtn.href = '#';
  slideControls.className = 'slide-controls';
  previousBtn.className = 'slide-control btn-previous disabled';
  nextBtn.className = 'slide-control btn-next';
  pagination.className = 'pagination';
  previousBtn.textContent = 'PREVIOUS';
  nextBtn.textContent = 'NEXT';
  pagination.appendChild(navList);
  slideControls.append(pagination, previousBtn, nextBtn);
  tabContent.insertBefore(slideControls, tabBody);
}

function decorateSlider(block) {
  const sliderTabContainer = block.querySelector('.tab-container:has(#explore-trucks)');
  const sliderWrapper = sliderTabContainer.querySelector('.content-wrapper > div'); // div with data-align center
  const tabContent = sliderWrapper.parentElement;
  const imageContainers = sliderWrapper.querySelectorAll('p');
  const titles = sliderWrapper.querySelectorAll('h2');
  const newSliderWrapper = document.createElement('div');
  const slidesContainer = document.createElement('div');
  newSliderWrapper.className = 'slider-wrapper';
  slidesContainer.className = 'slides-container';

  [...imageContainers].forEach((p, i) => {
    const div = document.createElement('div');
    const imgLink = document.createElement('a');
    const picture = p.children[0];
    imgLink.href = titles[i].querySelector('a').href;
    div.className = i !== 0 ? 'slide' : 'slide active';
    div.dataset.value = i;
    imgLink.appendChild(picture);
    p.prepend(imgLink);
    div.append(p, titles[i]);
    slidesContainer.appendChild(div);
  });

  newSliderWrapper.appendChild(slidesContainer);
  tabContent.prepend(newSliderWrapper);
  sliderWrapper.remove();

  // add slider controls
  addSliderControls(tabContent, titles.length);
  addClickListener(block);
}

function setupInitialStyles(block) {
  const tabContainer = block.children[0];
  const tabContent = tabContainer.children[1];
  const contentWrapper = tabContent.children[0];
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const { target } = entry;
      if (entry.contentRect.height > 0) {
        tabContent.style.height = `${target.clientHeight}px`;
        resizeObserver.disconnect();
      }
    });
  });
  resizeObserver.observe(contentWrapper);
  tabContainer.classList.add('active');
}

export default function decorate(block) {
  const tabContainers = block.children;
  [...tabContainers].forEach((tab) => {
    const tabContent = document.createElement('div');
    const contentWrapper = document.createElement('div');
    const content = [...tab.children];
    const ctas = tab.querySelector('.button-container');
    // relocate content to the new container
    content.forEach((node) => {
      contentWrapper.appendChild(node);
    });
    // add again the content and the title
    tabContent.appendChild(contentWrapper);
    tab.append(tabContent);
    prependTabTitle(tab);
    // add proper class names for styling
    tabContent.style.height = 0;
    ctas.classList.add('cta');
    tabContent.className = 'tab-content';
    contentWrapper.className = 'content-wrapper';
    tab.className = 'tab-container';
    contentWrapper.children[0].className = 'tab-image';
    contentWrapper.children[1].className = 'description';
  });

  addTitlesListener(block);
  decorateSlider(block);
  setupInitialStyles(block);
}
