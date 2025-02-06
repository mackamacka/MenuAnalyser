import * as XLSX from 'xlsx';
import _ from 'lodash';

export const parseExcelFile = async (file) => {
  const workbook = XLSX.read(file, {
    cellStyles: true,
    cellFormulas: true,
    cellDates: true,
    cellNF: true,
    sheetStubs: true
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  const screens = {};
  let currentScreen = null;

  data.forEach((row, rowIndex) => {
    if (row[1] && row[1].toString().toLowerCase().includes('screen')) {
      currentScreen = row[1];
      screens[currentScreen] = [];
    } else if (currentScreen && row[1]) {
      screens[currentScreen].push({
        item: row[1],
        price: row[2],
        rowIndex
      });
    }
  });

  return screens;
};

export const findDiscrepancies = (screens) => {
  const layoutPatterns = Object.values(screens).map(screen => 
    screen.map(item => `${item.item}-${item.price}`).join('|')
  );

  const standardLayout = _.chain(layoutPatterns)
    .countBy()
    .toPairs()
    .maxBy('[1]')[0]
    .value();

  const discrepancies = [];
  
  Object.entries(screens).forEach(([screenName, items]) => {
    const currentLayout = items.map(item => `${item.item}-${item.price}`).join('|');
    if (currentLayout !== standardLayout) {
      const differences = [];
      const standardItems = standardLayout.split('|');
      const currentItems = currentLayout.split('|');
      
      currentItems.forEach((item, index) => {
        if (item !== standardItems[index]) {
          differences.push({
            expected: standardItems[index],
            found: item
          });
        }
      });

      discrepancies.push({
        screen: screenName,
        differences
      });
    }
  });

  return {
    totalScreens: Object.keys(screens).length,
    discrepancies
  };
};
