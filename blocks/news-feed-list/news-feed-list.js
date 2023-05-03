export default function decorate(block) {
  const header = document.createElement('h2');
  header.classList.add('news-feed-list-header');
  header.textContent = 'News RSS';
  const icon = document.createElement('span');
  icon.className = 'icon feed-icon';
  header.prepend(icon);
  block.prepend(header);
}
