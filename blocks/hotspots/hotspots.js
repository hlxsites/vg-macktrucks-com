export default function decorate(block) {
  const firstImage = block.querySelector('img');
  firstImage.parentNode.classList.add('hotspot-bg-img');
}
