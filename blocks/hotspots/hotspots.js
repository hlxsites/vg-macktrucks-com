import { decorateIcons } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const firstImage = block.querySelector('img');
  const title = block.querySelector('h1, h2');
  title.remove();

  const description = block.querySelector('p');
  description.remove();

  const hotspotLinks = [

    {
      id: 1,
      left: '72%',
      top: '74%',
      alt: 'Detail view of the Anthem air dam',
    },

    {
      id: 2,
      left: '75%',
      top: '68%',
      alt: 'Closeup shot of the Anthem bumper and covered tow loops',
    },

    {
      id: 3,
      left: '64%',
      top: '73%',
      alt: 'Detail view of the Anthem\'s close-out flange',
    },

    {
      id: 4,
      left: '51%',
      top: '35%',
      alt: 'Lineart illustration of the multiple roof offerings and fairings',
    },

    {
      id: 5,
      left: '70%',
      top: '51%',
      alt: 'Aerial view depiction of the Anthem\'s 3-piece hood and bumper',
    },
  ];
  // TODO: set data-hotspot="1" data-fade-object="true"  style="opacity: 1;"
  block.innerHTML = `<div class="hotspot animated" data-hotspot="1" data-fade-object="true" style="opacity: 1;">

<!-- TODO: set stand="" up="" sleeper="" -->
    <img class="hotspot-bg-img desktop" alt="Three-quarter view of a black Mack Anthem 70" stand="" up="" sleeper="" src="">
    <!--    TODO: mobile image-->
    <img class="hotspot-bg-img mobile" alt="Three-quarter view of a black Mack Anthem 70" stand="" up="" sleeper="" src="">

    <div class="hotspot-content content-wrapper ">
        <h1 class="hotspot-header"></h1>
        <p class="hotspot-text reduced-width"></p>
    </div>

    <div class="hotspot-icon-set">
        <a href="#" class="hotspot-icon" style="left: 0; top: 0;" data-spot="0">
            <img src="../../icons/hotspot.png" alt="Detail view of the Anthem air dam" />
        </a>
       
    </div>
</div>`;

  block.querySelector('.hotspot-bg-img.desktop').src = firstImage.src;
  block.querySelector('.hotspot-header').append(...title.childNodes);
  block.querySelector('.hotspot-text').append(...description.childNodes);

  const iconSet = block.querySelector('.hotspot-icon-set');
  const iconTemplate = iconSet.firstElementChild;
  iconTemplate.remove();
  hotspotLinks.forEach((hotspot) => {
    const iconLink = iconTemplate.cloneNode(true);
    iconLink.style.left = hotspot.left;
    iconLink.style.top = hotspot.top;
    iconLink.dataset.spot = hotspot.id;
    iconLink.firstElementChild.alt = hotspot.alt;

    iconSet.append(iconLink);
  });

  decorateIcons(block);
}
