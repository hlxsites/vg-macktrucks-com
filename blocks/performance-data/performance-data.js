/* eslint-disable no-plusplus */

/**
 * content of the tabs for the performance-specifications block.
 * @param block {HTMLDivElement}
 * @return {Promise<void>}
 */
export default async function decorate(block) {
  block.parentElement.remove();
}
