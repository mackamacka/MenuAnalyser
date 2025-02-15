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
        currentScreen = row[1].trim();
        screens[currentScreen] = [];
        console.log(`Found screen: ${currentScreen}`);
      } else if (currentScreen && row[1]) {
        screens[currentScreen].push({
          item: row[1].trim(),
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

    // Create layout patterns with better error handling
    const layoutPatterns = Object.entries(screens).map(([screenName, items]) => ({
      screenName,
      pattern: items.map(item => `${item.item}-${item.price}`).join('|')
    }));

    console.log('Layout patterns created:', layoutPatterns.length);

    // Find the most common pattern
    const patternCounts = _.countBy(layoutPatterns, 'pattern');
    const mostCommonPattern = _.maxBy(Object.entries(patternCounts), ([, count]) => count)?.[0];

    if (!mostCommonPattern) {
      throw new Error('Could not determine a standard layout pattern');
    }

    console.log('Standard layout identified');

    // Find screens that don't match the most common pattern
    const discrepancies = layoutPatterns
      .filter(({ pattern }) => pattern !== mostCommonPattern)
      .map(({ screenName, pattern }) => {
        const currentItems = pattern.split('|');
        const standardItems = mostCommonPattern.split('|');
        
        const differences = [];
        const maxLength = Math.max(currentItems.length, standardItems.length);
        
        for (let i = 0; i < maxLength; i++) {
          if (currentItems[i] !== standardItems[i]) {
            differences.push({
              expected: standardItems[i] || 'missing',
              found: currentItems[i] || 'missing'
            });
          }
        }

        return {
          screen: screenName,
          differences
        };
      });

    return {
      totalScreens: Object.keys(screens).length,
      standardPattern: mostCommonPattern,
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