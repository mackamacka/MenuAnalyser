// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

const categorizeScreen = (screenData) => {
  // Look at the items in the screen to determine its category
  const items = screenData.map(item => item.item.toLowerCase());
  
  if (items.some(item => 
    item.includes('coffee') || 
    item.includes('latte') || 
    item.includes('cappuccino'))) {
    return 'COFFEE';
  }
  
  if (items.some(item => 
    item.includes('beer') || 
    item.includes('wine') || 
    item.includes('spirits'))) {
    return 'BAR';
  }
  
  return 'FOOD'; // Default category
};

export const parseExcelFile = async (file) => {
  try {
    const workbook = XLSX.read(file, {
      cellStyles: true,
      cellFormulas: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    const categorizedScreens = {
      FOOD: {},
      COFFEE: {},
      BAR: {}
    };

    let currentScreen = null;
    let currentItems = [];

    data.forEach((row, rowIndex) => {
      if (!row || !Array.isArray(row)) return;

      if (row[1] && row[1].toString().toLowerCase().includes('screen')) {
        // If we were collecting items for a previous screen, categorize and save it
        if (currentScreen && currentItems.length > 0) {
          const category = categorizeScreen(currentItems);
          categorizedScreens[category][currentScreen] = currentItems;
        }
        
        // Start new screen
        currentScreen = row[1].trim();
        currentItems = [];
      } else if (currentScreen && row[1]) {
        currentItems.push({
          item: row[1].trim(),
          price: row[2],
          rowIndex
        });
      }
    });

    // Don't forget to process the last screen
    if (currentScreen && currentItems.length > 0) {
      const category = categorizeScreen(currentItems);
      categorizedScreens[category][currentScreen] = currentItems;
    }

    return categorizedScreens;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

export const findDiscrepancies = (categorizedScreens) => {
  try {
    const results = {};

    // Analyze each category separately
    for (const [category, screens] of Object.entries(categorizedScreens)) {
      const layoutPatterns = Object.entries(screens).map(([screenName, items]) => ({
        screenName,
        pattern: items.map(item => `${item.item}-${item.price}`).join('|')
      }));

      if (layoutPatterns.length === 0) continue;

      // Find the most common pattern in this category
      const patternCounts = _.countBy(layoutPatterns, 'pattern');
      const mostCommonPattern = _.maxBy(Object.entries(patternCounts), ([, count]) => count)?.[0];

      if (!mostCommonPattern) continue;

      // Find discrepancies within this category
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

      results[category] = {
        totalScreens: Object.keys(screens).length,
        standardPattern: mostCommonPattern,
        discrepancies
      };
    }

    return results;
  } catch (error) {
    console.error('Discrepancy analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
};