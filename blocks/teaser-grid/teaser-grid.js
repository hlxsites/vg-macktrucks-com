export default function decorate(block) {
  const children = [...block.children];

  const teaserGridList = document.createElement('ul');
  teaserGridList.classList.add('teaser-grid-list');

  children.forEach((e, idx) => {
    const teaserGridItem = document.createElement('li');
    teaserGridItem.classList.add('teaser-grid-item', `teaser-grid-item-${idx + 1}`);

    const image = e.querySelector('picture').innerHTML;
    const link = e.querySelector('u').innerText;
    const texts = e.querySelectorAll('li');

    const buttonText = texts[0].innerText;
    const title = texts[1].innerText;
    let subtitle = texts[2].innerText;
    subtitle = `${subtitle} >`;

    let url = buttonText.replaceAll(' ', '-').toLowerCase();
    url = `${window.location.href}/categories/${url}`;

    teaserGridItem.innerHTML = `
      <div class='teaser-card teaser-card-${idx + 1}'>
        <a class='teaser-button teaser-button-${idx + 1}' href=${url}>
          ${buttonText}
        </a>
        <div class='teaser-image'>
          <picture>
            ${image}
          </picture>
        </div>
        <a class='teaser-link' href="${link}">
          <h3 class='teaser-title'>
            ${title}
          </h3>
          <h4 class='teaser-subtitle'>
            ${subtitle}
          </h4>
        </a>
      </div>`;
    teaserGridList.append(teaserGridItem);
  });

  block.textContent = '';
  block.append(teaserGridList);
}
