import {
  a, button, div, domEl, p,
} from '../../scripts/scripts.js';
import { loadScript } from '../../scripts/lib-franklin.js';

/**
 * as multiple blocks might be on the same page, the data is accessed using they block node as the
 * key.
 *
 * @type {Map<HTMLElement, Record<string, CategoryData>>}>}
 */
const engineData = new Map();

/**
 * @typedef {Object} EngineDetail
 * @property {Array<Array<string>>} facts
 * @property {Object<string, Object<number, number>>} performanceData
 */

export default async function decorate(block) {
  engineData.set(block, {});

  let jsonUrl;
  // load categories  data
  [...block.children].forEach((rawTabHeader) => {
    // any first cell that contains a link is the json url
    if (rawTabHeader.children[0].querySelector('a')) {
      jsonUrl = rawTabHeader.children[0].querySelector('a').getAttribute('href');
      return;
    }
    const categoryId = rawTabHeader.children[0].textContent.replaceAll('®', '').toLowerCase().trim();
    engineData.get(block)[categoryId] = {
      nameHTML: rawTabHeader.children[0].innerHTML,
      descriptionHTML: rawTabHeader.children[1].innerHTML,
      engines: {},
    };
  });
  [...block.children].forEach((node) => node.remove());

  // load data
  const response = await fetch(jsonUrl);
  const result = await response.json();
  parseEngineJsonData(result.data, block);

  const initialCategoryId = Object.keys(engineData.get(block))[0];
  const initialEngineId = Object.keys(engineData.get(block)[initialCategoryId].engines)[0];

  // add tabs
  block.append(renderCategoryTabs(block, engineData.get(block), initialCategoryId));

  // add category details and engine selection ("XY HP")
  block.append(
    renderCategoryDetail(block, engineData.get(block)[initialCategoryId], initialEngineId),
  );

  // Add detail panel with facts and chart
  const engineDetails = engineData.get(block)[initialCategoryId].engines[initialEngineId];
  const detailPanel = div({ class: 'details-panel' },
    renderEngineSpecs(engineDetails),
    div({ class: 'performance-chart' },
      div({ class: 'loading-spinner' }),
    ));
  block.append(detailPanel);

  const chartContainer = block.querySelector('.performance-chart');
  // noinspection JSIgnoredPromiseFromCall,ES6MissingAwait
  updateChart(chartContainer, engineDetails.performanceData);
}

/**
 * @typedef {Object} CategoryData
 * @property {string} nameHTML
 * @property {string} descriptionHTML
 * @property {Object.<string, EngineDetail>} engines
 */

function renderCategoryTabs(block, categoryData, categoryId) {
  const tabList = div({ role: 'tablist', class: 'category-tablist' });
  Object.keys(categoryData)
    .forEach((aCategoryId) => {
      const { nameHTML } = categoryData[aCategoryId];
      const tabButton = button({
        class: 'tab',
        role: 'tab',
        'aria-selected': aCategoryId === categoryId,
        'data-category-id': aCategoryId,
      });
      tabButton.innerHTML = nameHTML;

      tabButton.addEventListener('click', () => {
        if (tabButton.getAttribute('aria-selected') === 'true') {
          // ignore click if already selected
          return;
        }
        // Remove all current selected tabs and set this tab as selected
        tabList.querySelectorAll('[aria-selected="true"]')
          .forEach((tab) => tab.setAttribute('aria-selected', false));
        tabButton.setAttribute('aria-selected', true);

        block.querySelector('.category-detail').replaceWith(
          renderCategoryDetail(block, engineData.get(block)[tabButton.dataset.categoryId]),
        );

        refreshDetailView(block);
      });
      tabList.append(tabButton);
    });
  handleKeyboardNavigation(tabList);
  return tabList;
}

function renderCategoryDetail(block, categoryData, selectEngineId = null) {
  const categoryDetails = div({ class: 'category-detail' });
  categoryDetails.innerHTML = `
    <h3>${categoryData.nameHTML}</h3>
    <p class="category-description">${categoryData.descriptionHTML}</p>
    <div class="engine-navigation">
      <p class="engine-ratings">Engine Ratings</p>
      <div class="engine-tablist" role="tablist" aria-label="Engine Ratings"> </div>
    </div>`;

  const tabList = categoryDetails.querySelector('.engine-tablist');
  handleKeyboardNavigation(tabList);

  Object.keys(categoryData.engines).forEach((engineId, index) => {
    let isSelected;
    if (selectEngineId) {
      isSelected = engineId === selectEngineId;
    } else {
      isSelected = index === 0;
    }

    const engineButton = button({ role: 'tab', 'aria-selected': isSelected }, engineId);

    engineButton.addEventListener('click', () => {
      // ignore click if already selected
      if (engineButton.getAttribute('aria-selected') === 'true') {
        return;
      }

      // Remove selection from currently selected tabs and set this tab as selected
      tabList.querySelectorAll('[aria-selected="true"]')
        .forEach((tab) => tab.setAttribute('aria-selected', false));
      engineButton.setAttribute('aria-selected', true);

      refreshDetailView(block);
    });
    tabList.append(engineButton);
  });

  return categoryDetails;
}

function renderEngineSpecs(engineDetails) {
  // noinspection JSCheckFunctionSignatures
  return div({ class: 'key-specs' },
    domEl('dl', {}, ...engineDetails.facts.map((cells) => [
      domEl('dt', cells[0]),
      domEl('dd', cells[1]),
    ])
      .flat()),
    p({ class: 'button-container' },
      a({ class: 'button secondary download-specs', href: engineDetails['learn more'], target: '_blank' }, 'Learn More')),
  );
}

function refreshDetailView(block) {
  const { categoryId } = block.querySelector('.category-tablist button[aria-selected="true"]').dataset;
  const engineId = block.querySelector('.engine-tablist button[aria-selected="true"]').textContent;
  const engineDetails = engineData.get(block)[categoryId].engines[engineId];

  // replace key specs
  block.querySelector('.key-specs').replaceWith(renderEngineSpecs(engineDetails));

  // update chart
  const chartContainer = block.querySelector('.performance-chart');
  // noinspection JSIgnoredPromiseFromCall
  updateChart(chartContainer, engineDetails.performanceData);
}

function handleKeyboardNavigation(tabList) {
  // from https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
  tabList.addEventListener('keydown', (e) => {
    const tabs = [...tabList.children];
    let tabFocus = tabs.indexOf(e.target);

    // Move right
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      tabs[tabFocus].setAttribute('tabindex', -1);
      if (e.key === 'ArrowRight') {
        // eslint-disable-next-line no-plusplus
        tabFocus++;
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === 'ArrowLeft') {
        // eslint-disable-next-line no-plusplus
        tabFocus--;
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', 0);
      tabs[tabFocus].focus();
    }
  });
}

/**
 * @param chartContainer {HTMLElement}
 * @param performanceData {Array<Array<string>>}
 */
async function updateChart(chartContainer, performanceData) {
  if (!window.echarts) {
    // delay by 3 seconds to ensure a good lighthouse score
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // custom small bundle created on https://echarts.apache.org/en/builder.html
    await loadScript('/common/echarts-5.4.2/echarts.custom.only-linecharts.min.js');
  }

  let myChart = window.echarts.getInstanceByDom(chartContainer);
  if (!myChart) {
    myChart = window.echarts.init(chartContainer, 'dark');
    window.addEventListener('resize', () => {
      if (!myChart.isDisposed()) {
        myChart.resize();
      }
    });
  }

  const firstMetric = Object.values(performanceData)[0];
  const rpmValues = Object.keys(firstMetric).map(Number);

  function getEchartsSeries(sweetSpotStart, sweetSpotEnd) {
    const metrics = Object.keys(performanceData);

    const series = metrics.map((title) => {
      const metricValues = Object.entries(performanceData[title])
        .map(([rpm, value]) => [Number(rpm), Number(value)]);

      return ({
        type: 'line',
        name: title.toUpperCase(),
        symbolSize: 12,
        smooth: true,
        data: metricValues,
      });
    });

    // add mark area to first series
    series[0] = {
      ...series[0],
      markArea: {
        silent: true,
        itemStyle: {
          color: 'rgb(96 96 96 / 50%)',
        },
        data: [[{ xAxis: sweetSpotStart }, { xAxis: sweetSpotEnd }]],
      },
    };

    return series;
  }

  const option = {
    legend: {
      icon: 'circle',
      top: 'top',
      right: 0,
      fontFamily: 'Helvetica Neue LT Pro 55 Roman',
      itemHeight: 25,
      itemGap: 10,
      textStyle: {
        fontSize: 15,
        color: '#ffffff',
      },
    },

    series: getEchartsSeries(1300, 1700),
    // Global palette:
    color: [
      '#ffffff',
      '#b3976b',
      '#275fa6',
    ],
    backgroundColor: '#1d1d1d',

    grid: {
      //  reduce space around the chart
      left: '50',
      right: '5',
      top: '80',
    },
    textStyle: {
      color: '#ffffff',
    },
    xAxis: {
      min: rpmValues.at(0),
      max: rpmValues.at(-1) + 100,
      type: 'value',

      // label center bellow chart
      name: 'RPM',
      nameGap: 40,
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15,
        fontWeight: 'bold',
      },

      // use lines at each 100 RPM
      splitLine: {
        show: true,
        lineStyle: {
          color: '#8e8e8e',
          width: 1,
        },
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: '#8e8e8e',
          width: 1,
        },
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
        splitNumber: 3,
      },
      // unfortunately we can not control which label values are shown
      axisLabel: {
        show: true,
        interval: 0,
        showMinLabel: false,
        showMaxLabel: false,
        formatter(value) {
          // remove thousands separator
          return value;
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter(value) {
          // remove thousands separator
          return value;
        },
      },
      splitLine: {
        lineStyle: {
          color: '#8e8e8e',
        },
      },
    },
    animation: true,
    animationDuration: 400,
  };
  myChart.setOption(option, {
    // https://github.com/apache/echarts/issues/6202
    notMerge: true,
  });
}

function parseEngineJsonData(data, block) {
  // need to convert because the Excel sheet is column based and the JSON API returns rows.
  const rows = transposeTable(data);
  Object.values(rows)
    .forEach((modelArray) => {
      const engine = { facts: [], performanceData: {} };
      let metricName = null;
      // extract RPM data into engine.performanceData. The rows after the key `rpm`
      // are the performance data. They value of the RPM row contains the metric name.
      for (const [key, value] of modelArray) {
        if (key === 'rpm') {
          metricName = value;
        } else if (key === 'model' || key === 'series' || key === 'learn more') {
          engine[key] = value;
        } else if (metricName !== null) {
          // handle performance data
          if (!engine.performanceData[metricName]) {
            engine.performanceData[metricName] = {};
          }
          const rpmValue = Number(key);
          engine.performanceData[metricName][rpmValue] = Number(value);
        } else {
          engine.facts.push([key, value]);
        }
      }

      // remove empty performance data
      Object.keys(engine.performanceData)
        .forEach((key) => {
          if (Object.values(engine.performanceData[key])[0] === 0
          && Object.values(engine.performanceData[key])[1] === 0) {
            delete engine.performanceData[key];
          }
        });

      const categoryId = engine.series.replaceAll('®', '').toLowerCase().trim();
      if (!engineData.get(block)[categoryId]) {
        // eslint-disable-next-line no-console
        console.error(`The engine type ${categoryId} was used in Excel, but the not defined in the Engine-Specifications block. Please update the block used on this page.`);
        // create empty object to prevent errors
        engineData.get(block)[categoryId] = { engines: {}, nameHTML: engine.series, descriptionHTML: '' };
      }
      engineData.get(block)[categoryId].engines[engine.model] = engine;
    });
}

/**
 * converts the rows into columns, and vice versa.
 * @return {Object<string, string[]>}
 */
function transposeTable(data) {
  const newData = {};
  data.forEach((row) => {
    const label = row.ID.toLowerCase().trim();
    for (const modelId in row) {
      if (modelId !== 'ID') {
        if (!newData[modelId]) {
          newData[modelId] = [];
        }
        newData[modelId].push([label, row[modelId]]);
      }
    }
  });
  return newData;
}
