/* eslint-disable no-plusplus */

/**
 * content of the tabs for the performance-specifications block.
 * @param block {HTMLDivElement}
 * @return {Promise<void>}
 */
export default async function decorate(block) {

  // const keyFacts = domEl('dl', { class: 'key-specs' });
  // facts.forEach((row) => {
  //   keyFacts.appendChild(domEl('dt', row[0]));
  //   keyFacts.appendChild(domEl('dd', row[1]));
  // });
  //
  // block.innerText = '';
  // block.append(keyFacts);
  //
  // const diagram = div({ class: 'performance-chart' });
  // diagram.append(div({ class: 'loading-spinner' }));
  // block.append(diagram);
  //
  // // drawing the chart is delayed until the tab is visible. this avoids drawing charts
  // // for tabs that are not visible.
  // const observer = new IntersectionObserver(((entries) => {
  //   entries.forEach((entry) => {
  //     if (entry.isIntersecting) {
  //       drawChart(diagram, performanceData);
  //     }
  //   });
  // }));
  // observer.observe(block);
  //

  // addPerformanceData(block.closest('.performance-specifications-container').querySelector('.performance-specifications'),
  //   facts, performanceData, categoryKey, horsepower);

  const parent = block.parentElement;
  parent.remove();
}





