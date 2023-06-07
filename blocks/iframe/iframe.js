export default async function decorate(block) {
  const iframe = document.createElement('iframe');
  const link = block.querySelector('a')?.getAttribute('href');
  const fixedHeightClass = [...block.classList].find((el) => /[0-9]+px/.test(el));
  const maxWidthClass = [...block.classList].find((el) => /width-[0-9]+px/.test(el));

  if (fixedHeightClass) {
    iframe.height = fixedHeightClass;
  }
  if (maxWidthClass) {
    const maxWidht = maxWidthClass.split('width-')[1];
    iframe.style.maxWidth = maxWidht;
  }
  iframe.src = link;
  iframe.setAttribute('frameborder', 0);
  block.replaceChildren(iframe);
}
