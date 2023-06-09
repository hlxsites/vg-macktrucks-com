/* eslint-disable no-plusplus */
import { readBlockConfig } from '../../scripts/lib-franklin.js';

/**
 * content of the tabs for the performance-specifications block.
 * @param block {HTMLDivElement}
 * @return {Promise<void>}
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);

  let rpmIndex;
  [...block.children].forEach((row, index) => {
    if (row.firstElementChild.textContent === 'RPM') {
      rpmIndex = index;
    }
  });

  const performanceData = {};
  const titles = [];
  for (let i = 1; i < block.children[rpmIndex].children.length; i++) {
    // skipping the first column, which is the RPM column
    titles[i] = block.children[rpmIndex].children[i].textContent;
    performanceData[titles[i]] = [];
  }
  // starting with RPM, remove all rows until the end of the table
  for (let i = rpmIndex + 1; i < block.children.length; i++) {
    const row = block.children[i];
    const rpm = row.children[0].textContent;
    for (let j = 1; j < row.children.length; j++) {
      const metric = titles[j];
      performanceData[metric].push([rpm, row.children[j].textContent]);
    }
  }
  console.log(performanceData);
  // rpmIndex =
}
