import { readBlockConfig } from '../../scripts/lib-franklin.js';

/**
 * content of the tabs for the performance-specifications block.
 * @param block {HTMLDivElement}
 * @return {Promise<void>}
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
}
