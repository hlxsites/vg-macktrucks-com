/* eslint-disable no-plusplus */

import { loadScript } from '../../scripts/lib-franklin.js';
import { addPerformanceData } from '../performance-specifications/performance-specifications.js';
import { div, domEl } from '../../scripts/scripts.js';

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

  // TODO: only draw chart when visible.
  setTimeout(() => {
    loadScript('../../common/echarts/echarts.custom.min.js')
      .then(() => {
        // eslint-disable-next-line no-undef
        const myChart = echarts.init(diagram);

        const titles = performanceData[0].slice(1).map((title) => title.toUpperCase());

        const series = titles.map((title, index) => ({
          name: title,
          data: performanceData.slice(1)
            .map((row) => [row[0], row[index + 1]]),
          type: 'line',
          symbol: 'none',
          color: getColor(title, index),
        }));

        series[0].markArea = {
          silent: true,
          itemStyle: {
            color: 'rgb(198 214 235 / 50%)',
          },
          data: [[{ xAxis: 1300 }, { xAxis: 1700 }]],
        };

        // Specify the configuration items and data for the chart
        const option = {
          tooltip: null,
          legend: {
            data: titles,
            icon: 'rect',
            top: 'bottom',
          },
          grid: {
            //  reduce space around the chart
            top: '10',
            left: '50',
          },
          xAxis: {
            type: 'value',
            name: 'RPM',
            nameTextStyle: {
              borderType: 'solid',
              verticalAlign: 'top',
              lineHeight: 30,
              fontWeight: 'bold',
            },
            nameLocation: 'start',
            min: performanceData[1][0],
            max: performanceData.at(-1)[0],
            axisLine: {
              onZero: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#d3d3d3',
                width: 1,
              },
            },
            minorTick: {
              show: true,
              splitNumber: 3,
            },
            minorSplitLine: {
              show: true,
              lineStyle: {
                color: '#d3d3d3',
                width: 1,
              },
            },
            axisLabel: {
              show: true,
              interval: 0,
              showMinLabel: false,
              showMaxLabel: false,
              color: '#767676',
              fontWeight: 'bold',
            },
          },
          yAxis: {
            type: 'value',
          },
          series,
          animation: false,
          animationDuration: 500,
        };

        // Display the chart using the configuration items and data just specified.
        myChart.setOption(option);
      });
  }, 0);
  const parent = block.parentElement;
  addPerformanceData(block);
  parent.remove();
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

function getColor(title, index) {
  return ['#85764d', '#808285', '#275fa6'][index];
}
