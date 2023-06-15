import {
  button, div, domEl, h2, p,
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
 * @typedef {Object} CategoryData
 * @property {string} nameHTML
 * @property {string} descriptionHTML
 * @property {Object.<string, EngineDetail>} engines
 */

/**
 * @typedef {Object} EngineDetail
 * @property {Array<Array<string>>} facts
 * @property {Array<Array<string>>} performanceData
 */

export default async function decorate(block) {
  engineData.set(block, {});

  // add categories
  const rawCategories = [...block.children];
  const tabList = div({
    role: 'tablist',
    class: 'category-tablist',
  });
  rawCategories.forEach((rawTabHeader) => {
    const categoryKey = getCategoryKey(rawTabHeader.children[0]);
    engineData.get(block)[categoryKey] = {
      nameHTML: rawTabHeader.children[0].innerHTML,
      descriptionHTML: rawTabHeader.children[1].innerHTML,
      engines: {},
    };
    const isFirstTab = tabList.children.length === 0;
    const tabButton = button({
      class: 'tab',
      role: 'tab',
      'aria-selected': isFirstTab,
      'data-category-id': categoryKey,
    });
    tabButton.append(...rawTabHeader.firstElementChild.childNodes);

    tabButton.addEventListener('click', (event) => {
      handleChangeCategory(event, tabList, block);
    });
    tabList.append(tabButton);
    rawTabHeader.remove();
  });
  block.append(tabList);
  handleKeyboardNavigation(tabList);

  // add engine selection ("XY HP")
  const categoryDetails = div(
    { class: 'category-detail' },
    h2({ class: 'category-name' }),
    p({ class: 'category-description' }),
  );
  const engineSelection = div({ class: 'engine-navigation' });
  engineSelection.innerHTML = `
    <p class="engine-tab-header">Engine Ratings</p>
    <div class="engine-tablist " role="tablist" aria-label="Engine Ratings"></div>`;
  handleKeyboardNavigation(engineSelection.querySelector('.engine-tablist'));
  categoryDetails.append(engineSelection);
  block.append(categoryDetails);

  // Add detail panel with facts and chart
  const detailPanel = div({ class: 'details-panel' });
  detailPanel.innerHTML = `<dl class="key-specs">
    </dl>
    <div class="performance-chart">
        <div class="loading-spinner"></div>
    </div>
`;
  block.append(detailPanel);

  loadPerformanceDataFromDataBlocks(block);
  initView(block);
}

function initView(block) {
  updateCategoryDetailView(block);
  updateDetailView(block);
}

function updateCategoryDetailView(block) {
  const { categoryId } = block.querySelector('.category-tablist button[aria-selected="true"]').dataset;

  block.querySelector('.category-name').innerHTML = engineData.get(block)[categoryId].nameHTML;
  block.querySelector('.category-description').innerHTML = engineData.get(block)[categoryId].descriptionHTML;

  // update engine selection
  const tabList = block.querySelector('.engine-tablist');
  // skip if category is already selected
  tabList.textContent = '';

  Object.keys(engineData.get(block)[categoryId].engines)
    .forEach((engineId, index) => {
      const engineTab = button({
        role: 'tab',
        'aria-selected': index === 0,
      }, engineId);
      engineTab.addEventListener('click', () => {
        handleChangeEngineSelection(engineTab, tabList, block);
      });
      tabList.append(engineTab);
    });

  updateDetailView(block);
}

function updateDetailView(block) {
  const { categoryId } = block.querySelector('.category-tablist button[aria-selected="true"]').dataset;
  const engineId = block.querySelector('.engine-tablist button[aria-selected="true"]').textContent;

  // update performance data
  const {
    facts,
    performanceData,
  } = engineData.get(block)[categoryId].engines[engineId];
  const keySpecs = block.querySelector('.key-specs');
  keySpecs.textContent = '';
  facts.forEach((row) => {
    keySpecs.append(
      domEl('dt', row[0]),
      domEl('dd', row[1]),
    );
  });

  const diagram = block.querySelector('.performance-chart');
  // noinspection JSIgnoredPromiseFromCall
  updateChart(diagram, performanceData);
}

function handleChangeCategory(event, tabList, block) {
  const tabHeader = event.target.closest('[role="tab"]');

  // ignore click if already selected
  if (tabHeader.getAttribute('aria-selected') === 'true') {
    return;
  }

  // Remove all current selected tabs
  tabList.querySelectorAll('[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));

  // Set this tab as selected
  tabHeader.setAttribute('aria-selected', true);

  updateCategoryDetailView(block);
}

function handleChangeEngineSelection(engineTab, tabList, block) {
  // ignore click if already selected
  if (engineTab.getAttribute('aria-selected') === 'true') {
    return;
  }

  // Remove all current selected tabs
  tabList.querySelectorAll('[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));

  // Set this tab as selected
  engineTab.setAttribute('aria-selected', true);

  updateDetailView(block);
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
 * @param diagram {HTMLElement}
 * @param performanceData {Array<Array<string>>}
 */
async function updateChart(diagram, performanceData) {
  if (!window.echarts) {
    // custom small bundle created on https://echarts.apache.org/en/builder.html
    await loadScript('../../common/echarts-5.4.2/echarts.custom.only-linecharts.min.js');
  }

  let myChart = window.echarts.getInstanceByDom(diagram);
  if (!myChart) {
    myChart = window.echarts.init(diagram, 'dark');
    window.addEventListener('resize', () => {
      if (!myChart.isDisposed()) {
        myChart.resize();
      }
    });
  }

  // cast RPM column to numbers
  performanceData.forEach((row) => {
    row[0] = Number(row[0]);
  });

  function getEchartsSeries(sweetSpotStart, sweetSpotEnd) {
    const series = [];

    performanceData[0].slice(1)
      .forEach((title, index) => series.push({
        type: 'line',
        name: title,
        seriesLayoutBy: 'column',
        data: performanceData.slice(1)
          .map((row) => [row[0], row[index + 1]]),
      }));

    // add mark area to first series
    series[0] = {
      ...series[0],
      markArea: {
        silent: true,
        itemStyle: {
          color: 'rgb(198 214 235 / 50%)',
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
    },

    series: getEchartsSeries(1300, 1700),
    // Global palette:
    color: [
      '#85764d',
      '#808285',
      '#275fa6',
      '#c23531',
      '#2f4554',
      '#61a0a8',
      '#d48265',
      '#91c7ae',
      '#749f83',
      '#ca8622',
      '#bda29a',
      '#6e7074',
      '#546570',
      '#c4ccd3',
    ],

    grid: {
      //  reduce space around the chart
      left: '50',
    },
    xAxis: {
      min: performanceData[1][0],
      max: performanceData.at(-1)[0] + 100,
      type: 'value',
      name: 'RPM',
      nameTextStyle: {
        borderType: 'solid',
        verticalAlign: 'top',
        lineHeight: 30,
        fontWeight: 'bold',
      },
      nameLocation: 'start',
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
    animation: true,
    animationDuration: 400,
  };
  myChart.setOption(option, {
    // https://github.com/apache/echarts/issues/6202
    notMerge: true,
  });
}

function getCategoryKey(el) {
  return el.textContent.replaceAll('®', '')
    .toLowerCase()
    .trim();
}

function loadPerformanceDataFromDataBlocks(block) {
  block.closest('.performance-specifications-container')
    .querySelectorAll('.performance-data')
    .forEach((dataBlock) => {
      const tableData = deconstructBlockIntoArray(dataBlock)
        .filter((cols) => cols.length > 0 && cols[0] !== '');
      const indexOfRpm = tableData.findIndex((row) => row[0] === 'RPM');
      // rows until RPM are facts, after is performance data
      const facts = tableData.slice(0, indexOfRpm);
      const performanceData = tableData.slice(indexOfRpm);

      const categoryKey = [...dataBlock.classList].find((c) => c !== 'performance-data' && !c.toLowerCase()
        .endsWith('-hp') && c !== 'block');
      const horsepower = [...dataBlock.classList].find((c) => c.toLowerCase()
        .endsWith('-hp'))
        .replace('-', ' ')
        .toUpperCase();

      if (!engineData.get(block)[categoryKey]) {
        engineData.get(block)[categoryKey] = {};
      }
      engineData.get(block)[categoryKey].engines[horsepower] = {
        facts,
        performanceData,
      };
    });
}

/**
 *  inverse operation of `buildBlock()`.
 *
 * @param blockEl {HTMLDivElement} Franklin row column tree
 * @return {string[][]} 2d array of the block's content
 */
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
