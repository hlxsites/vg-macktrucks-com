export default function decorate(block) {
  block.classList.add('features');

  block.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((title) => {
    // convert to h4 because it might be any header level
    const h4 = document.createElement('h4');
    h4.classList.add('feature-title');
    h4.innerHTML = title.innerHTML;
    title.replaceWith(h4);
  });

  block.querySelectorAll(':scope > div').forEach((row) => row.classList.add('row'));
  block.querySelectorAll(':scope > div > div').forEach((cell) => cell.classList.add('feature'));

  // unwrap picture so that text styles are not applied to this paragraph
  block.querySelectorAll('picture').forEach((picture) => picture.closest('p').replaceWith(picture));
}
