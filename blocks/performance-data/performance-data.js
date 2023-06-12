/* eslint-disable no-plusplus */

import { loadScript } from '../../scripts/lib-franklin.js';

/**
 * content of the tabs for the performance-specifications block.
 * @param block {HTMLDivElement}
 * @return {Promise<void>}
 */
export default async function decorate(block) {
  const tableData = deconstructBlockIntoArray(block)
    .filter((cols) => cols.length > 0 && cols[0] !== '');
  const indexOfRpm = tableData.findIndex((row) => row[0] === 'RPM');
  // rows until RPM are facts, after is performance data
  const facts = tableData.slice(0, indexOfRpm);
  const performanceData = tableData.slice(indexOfRpm);
  console.log({
    facts,
    performanceData,
  });

  const keyFacts = domEl('dl', { class: 'key-specs' });
  facts.forEach((row) => {
    keyFacts.appendChild(domEl('dt', row[0]));
    keyFacts.appendChild(domEl('dd', row[1]));
  });

  block.innerText = '';
  block.append(keyFacts);

  const diagram = div({ class: 'performance-chart' });
  diagram.append(div({ class: 'loading-spinner' }));
  block.append(diagram);

  // TODO: https://github.com/adobecom/milo/blob/main/libs/blocks/chart/chart.js
  // https://business.adobe.com/resources/holiday-shopping-report.html

  setTimeout(() => {
    loadScript('../../common/echarts/echarts.custom.min.js')
      .then(() => {
        // eslint-disable-next-line no-undef
        const myChart = echarts.init(diagram);

        const titles = performanceData[0].slice(1);

        const series = titles.map((title, index) => ({
          name: title,
          data: performanceData.slice(1)
            .map((row) => [row[0], row[index + 1]]),
          type: 'line',
          symbol: 'none',
        }));

        series[0].markArea = {
          silent: true,
          itemStyle: {
            color: 'rgb(226 233 243 / 50%)',
          },
          data: [[{ xAxis: 1300 }, { xAxis: 1700 }]],
        };

        // Specify the configuration items and data for the chart
        const option = {
          tooltip: null,
          legend: {
            data: titles,
          },
          xAxis: {
            type: 'value',
            min: performanceData[1][0],
            max: performanceData.at(-1)[0],
            axisLine: {
              lineStyle: {
                // show: false,
              },
              onZero: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: true,
              interval: 0,
              showMinLabel: false,
              showMaxLabel: false,
            },
          },
          yAxis: {
            type: 'value',
          },
          series,
          animation: false,
          animationDuration: 500,
        };

        console.log({ option });
        // Display the chart using the configuration items and data just specified.
        myChart.setOption(option);
      });
  }, 0);
}

export function deconstructBlockIntoArray(blockEl) {
  const array2d = [];
  Array.from(blockEl.children)
    .forEach((rowEl) => {
      const row = [];
      Array.from(rowEl.children)
        .forEach((colEl) => {
          if (colEl.childNodes.length <= 1) {
            row.push(colEl.textContent);
          } else {
            const col = [];
            Array.from(colEl.childNodes)
              .forEach((val) => {
                col.push(val.textContent);
              });
            row.push(col);
          }
        });

      array2d.push(row);
    });

  return array2d;
}

/**
 * Example Usage:
 *
 * domEl('main',
 *  div({ class: 'card' },
 *  a({ href: item.path },
 *    div({ class: 'card-thumb' },
 *     createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]),
 *    ),
 *   div({ class: 'card-caption' },
 *      h3(item.title),
 *      p({ class: 'card-description' }, item.description),
 *      p({ class: 'button-container' },
 *       a({ href: item.path, 'aria-label': 'Read More', class: 'button primary' }, 'Read More'),
 *     ),
 *   ),
 *  ),
 * )
 */

/**
 * Helper for more concisely generating DOM Elements with attributes and children
 * @param {string} tag HTML tag of the desired element
 * @param  {[Object?, ...Element]} items: First item can optionally be an object of attributes,
 *  everything else is a child element
 * @returns {Element} The constructred DOM Element
 */
export function domEl(tag, ...items) {
  const element = document.createElement(tag);

  if (!items || items.length === 0) return element;

  if (!(items[0] instanceof Element || items[0] instanceof HTMLElement) && typeof items[0] === 'object') {
    const [attributes, ...rest] = items;
    // eslint-disable-next-line no-param-reassign
    items = rest;

    Object.entries(attributes).forEach(([key, value]) => {
      if (!key.startsWith('on')) {
        element.setAttribute(key, Array.isArray(value) ? value.join(' ') : value);
      } else {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      }
    });
  }

  items.forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    item = item instanceof Element || item instanceof HTMLElement
      ? item
      : document.createTextNode(item);
    element.appendChild(item);
  });

  return element;
}

/*
    More short hand functions can be added for very common DOM elements below.
    domEl function from above can be used for one off DOM element occurrences.
  */
export function div(...items) { return domEl('div', ...items); }
export function p(...items) { return domEl('p', ...items); }
export function a(...items) { return domEl('a', ...items); }
export function h1(...items) { return domEl('h1', ...items); }
export function h2(...items) { return domEl('h2', ...items); }
export function h3(...items) { return domEl('h3', ...items); }
export function h4(...items) { return domEl('h4', ...items); }
export function h5(...items) { return domEl('h5', ...items); }
export function h6(...items) { return domEl('h6', ...items); }
export function ul(...items) { return domEl('ul', ...items); }
export function li(...items) { return domEl('li', ...items); }
export function i(...items) { return domEl('i', ...items); }
export function img(...items) { return domEl('img', ...items); }
export function span(...items) { return domEl('span', ...items); }
export function input(...items) { return domEl('input', ...items); }
export function form(...items) { return domEl('form', ...items); }
export function button(...items) { return domEl('button', ...items); }
