// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

export const parseExcelFile = async (file) => {
  try {
    console.log('Starting Excel parsing...');
    
    const workbook = XLSX.read(file, {
      cellStyles: true,
      cellFormulas: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true
    });
    
    console.log('Workbook read successfully');
    console.log('Available sheets:', workbook.SheetNames);

    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in the workbook');
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log('Sheet range:', sheet['!ref']);

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    console.log('Rows extracted:', data.length);

    const screens = {};
    let currentScreen = null;

    data.forEach((row, rowIndex) => {
      if (!row || !Array.isArray(row)) {
        console.log(`Skipping invalid row at index ${rowIndex}`);
        return;
      }

      if (row[1] && row[1].toString().toLowerCase().includes('screen')) {
        currentScreen = row[1];
        screens[currentScreen] = [];
        console.log(`Found screen: ${currentScreen}`);
      } else if (currentScreen && row[1]) {
        screens[currentScreen].push({
          item: row[1],
          price: row[2],
          rowIndex
        });
      }
    });

    console.log('Screens extracted:', Object.keys(screens));
    return screens;
  } catch (error) {
    console.error('Excel parsing error:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

export const findDiscrepancies = (screens) => {
  try {
    if (!screens || Object.keys(screens).length === 0) {
      throw new Error('No screen data provided');
    }

    const layoutPatterns = Object.values(screens).map(screen => 
      screen.map(item => `${item.item}-${item.price}`).join('|')
    );

    console.log('Layout patterns created');

    const standardLayout = _.chain(layoutPatterns)
      .countBy()
      .toPairs()
      .maxBy('[1]')[0]
      .value();

    console.log('Standard layout identified');

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
  } catch (error) {
    console.error('Discrepancy analysis error:', {
      message: error.message,
      stack: error.stack,
      type: error.name
    });
    throw new Error(`Analysis failed: ${error.message}`);
  }
};