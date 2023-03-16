import { getFragment } from "../../scripts/scripts.js";

export default async function decorate(block) {
  const fragmentUrl = block.querySelector('a').getAttribute('href');
  const fragment = await getFragment(fragmentUrl);
  const htmlDoc = document.createElement('html');

  htmlDoc.innerHTML = fragment;

  const fragmentContent = htmlDoc.querySelector('main');
  const hr = document.createElement('hr');

  block.innerHTML = fragmentContent.innerHTML;
  block.prepend(hr);
}
