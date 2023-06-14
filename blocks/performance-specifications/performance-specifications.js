import { button, div, domEl } from '../../scripts/scripts.js';
import { loadScript } from '../../scripts/lib-franklin.js';

const engineData = new Map();

function initView(block) {
  const selectedCategory = block.querySelector('.category-tablist button[aria-selected="true"]').dataset.categoryId;

  // update engine selection
  const tabList = block.querySelector('.engine-tablist');
  [...engineData.keys()]
    .filter((key) => key[0] === selectedCategory)
    .forEach((key, index) => {
      const engineTab = button({
        role: 'tab', 'aria-selected': index === 0,
      }, key[1]);
      tabList.append(engineTab);
    });

  const selectedEngine = tabList.querySelector('[aria-selected="true"]').textContent;
  // TODO: use string keys instead of array keys
  const key = [...engineData.keys()].find((aKey) => aKey[0] === selectedCategory && aKey[1] === selectedEngine);
  // update performance data
  const { facts, performanceData } = engineData.get(key);
  const keySpecs = block.querySelector('.key-specs');
  // keySpecs.innerHTML = '';
  facts.forEach((row) => {
    keySpecs.append(
      domEl('dt', row[0]),
      domEl('dd', row[1]),
    );
  });

  const diagram = block.querySelector('.performance-chart');
  // noinspection JSIgnoredPromiseFromCall
  drawChart(diagram, performanceData);
  console.log({ diagram, performanceData });
}

export default async function decorate(block) {
  const rawCategories = [...block.children];

  const tabList = div({ role: 'tablist', class: 'category-tablist' });
  rawCategories.forEach((rawTabHeader) => {
    const tabHeaderButton = button({ class: 'tab' });
    tabHeaderButton.append(...rawTabHeader.children);
    tabHeaderButton.children[0].classList.add('name');
    tabHeaderButton.children[1].classList.add('description');
    const categoryKey = getCategoryKey(tabHeaderButton.children[0]);
    tabHeaderButton.setAttribute('data-category-id', categoryKey);
    tabHeaderButton.setAttribute('role', 'tab');
    const isFirstTab = tabList.children.length === 0;
    tabHeaderButton.setAttribute('aria-selected', isFirstTab);

    tabList.append(tabHeaderButton);
  });
  block.append(tabList);
  handleKeyboardNavigation(tabList);

  const engineSelection = div({ class: 'engine-navigation' });
  engineSelection.innerHTML = `
    <p class="engine-tab-header">Engine Ratings</p>
                <div class="engine-tablist " role="tablist" arialabel="Engine Ratings">
                
<!--             e.g.   <button role="tab" aria-selected="true" aria-controls="panel-3" id="tab-3" tabindex="0">425 HP </button>-->
                
                </div>
            `;

  block.append(engineSelection);

  const detailPanel = div({ class: 'details-panel' });
  detailPanel.innerHTML = `<dl class="key-specs">
<!--  e.g.    <dt>Peak Power</dt>-->
<!--      <dd>425 HP</dd>-->
<!--      <dt>Peak Power RPM</dt>-->
<!--      <dd>1500-1700</dd>-->
<!--      <dt>Peak Torque</dt>-->
<!--      <dd>1560 lb-ft</dd>-->
<!--      <dt>Peak Torque RPM</dt>-->
<!--      <dd>1000-1300</dd>-->
    </dl>
    <div class="performance-chart">
        <div class="loading-spinner"></div>
    </div>
`;

  block.append(detailPanel);

  getPerformanceDataFromDataBlocks(block);
  initView(block);
  console.log(engineData);
}

function getColor(title, index) {
  return ['#85764d', '#808285', '#275fa6'][index];
}

async function drawChart(diagram, performanceData) {
  await loadScript('../../common/echarts-5.4.2/echarts.simple.min.js');

  // eslint-disable-next-line no-undef
  const myChart = echarts.init(diagram);

  const titles = performanceData[0].slice(1)
    .map((title) => title.toUpperCase());

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
    animation: true,
    animationDuration: 500,
  };

  // Display the chart using the configuration items and data just specified.
  myChart.setOption(option);
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

function getCategoryKey(el) {
  return el.textContent.replaceAll('®', '')
    .toLowerCase()
    .trim();
}

function getPerformanceDataFromDataBlocks(block) {
  block.closest('.performance-specifications-container')
    .querySelectorAll('.performance-data')
    .forEach((dataBlock) => {
      const tableData = deconstructBlockIntoArray(dataBlock)
        .filter((cols) => cols.length > 0 && cols[0] !== '');
      const indexOfRpm = tableData.findIndex((row) => row[0] === 'RPM');
      // rows until RPM are facts, after is performance data
      const facts = tableData.slice(0, indexOfRpm);
      const performanceData = tableData.slice(indexOfRpm);

      const categoryKey = [...dataBlock.classList].find((c) => c !== 'performance-data' && !c.toLowerCase().endsWith('-hp') && c !== 'block');
      const horsepower = [...dataBlock.classList].find((c) => c.toLowerCase().endsWith('-hp'));

      // TODO: support multiple blocks
      engineData.set([categoryKey, horsepower.replace('-', ' ').toUpperCase()], { facts, performanceData });
    });
}

// let tabId = 0;
// function addTab(tabHeader, tabPanel, tabList, tabsContents) {
//   tabId += 1;
//   const isFirstTab = tabList.children.length === 0;
//   tabHeader.setAttribute('role', 'tab');
//   tabHeader.setAttribute('aria-selected', isFirstTab);
//   tabHeader.setAttribute('aria-controls', `panel-${tabId}`);
//   tabHeader.setAttribute('id', `tab-${tabId}`);
//   tabHeader.setAttribute('tabindex', '0'); // TODO: fix tabindex
//   tabList.append(tabHeader);
//
//   tabPanel.setAttribute('id', `panel-${tabId}`);
//   tabPanel.setAttribute('role', 'tabpanel');
//   tabPanel.setAttribute('tabindex', '0'); // TODO: fix tabindex
//   tabPanel.setAttribute('aria-labelledby', `tab-${tabId}`);
//   if (!isFirstTab) {
//     tabPanel.setAttribute('hidden', '');
//   }
//
//   tabsContents.append(tabPanel);
//
//   tabHeader.addEventListener('click', changeTabs);
// }

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

function changeTabs(e) {
  const { target } = e;

  // ignore click if already selected
  if (target.getAttribute('aria-selected') === 'true') {
    return;
  }

  const tabHeader = target.closest('[role="tab"]');
  const tabList = target.closest('[role="tablist"]');
  const grandparent = tabList.parentElement;
  const tabPanels = grandparent.querySelector('.tab-panels') || grandparent.parentElement.querySelector('.tab-panels');

  // Remove all current selected tabs
  tabList
    .querySelectorAll('[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));

  // Set this tab as selected
  tabHeader.setAttribute('aria-selected', true);

  // Hide all tab panels
  tabPanels
    .querySelectorAll(':scope > [role="tabpanel"]')
    .forEach((panel) => panel.setAttribute('hidden', ''));

  // Show the selected panel
  document.getElementById(tabHeader.getAttribute('aria-controls'))
    .removeAttribute('hidden');
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
