export default function decorate(block) {
  const breadcrumbItems = document.createElement('ul');
  breadcrumbItems.classList.add('breadcrumb-list');

  const articleUrl = (window.location.href).split('/').pop();
  const articleName = articleUrl.replaceAll('-', ' ').toLowerCase();
  const homeUrl = 'https://www.macktrucks.com/magazine/';

  breadcrumbItems.innerHTML = `
    <li class="breadcrumb breadcrumb-home">
      <a href='${homeUrl}'>
        Home
      </a>
    </li>
    <li class="breadcrumb breadcrumb-current">
      ${articleName}
    </li>`;

  block.textContent = '';
  block.append(breadcrumbItems);
}
