// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

const MENU_CATEGORIES = {
    'Hot Food': ['chips', 'burger', 'hot dog', 'pie', 'chicken', 'fish'],
    'Cold Food': ['sandwich', 'wrap', 'sushi', 'salad'],
    'Drinks': ['water', 'coca cola', 'juice', 'powerade'],
    'Snacks': ['ice cream', 'chocolate', 'chips', 'lollies']
};

const categorizeMenuItem = (item) => {
    const itemLower = item.toLowerCase();
    for (const [category, keywords] of Object.entries(MENU_CATEGORIES)) {
        if (keywords.some(keyword => itemLower.includes(keyword))) {
            return category;
        }
    }
    return 'Other';
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

        // Initialize categories
        const menusByCategory = {
            'Hot Food': [],
            'Cold Food': [],
            'Drinks': [],
            'Snacks': [],
            'Other': []
        };

        let currentOutlet = null;
        let currentScreen = null;

        data.forEach((row, rowIndex) => {
            if (!row || !Array.isArray(row)) return;

            // Check for outlet number
            if (row[1] && row[1].includes('Outlets:')) {
                currentOutlet = {
                    number: row[2],
                    isClosed: String(row[2]).toLowerCase().includes('closed')
                };
            }

            // Check for screen
            if (row[1] && row[1].toString().toLowerCase().includes('screen')) {
                currentScreen = {
                    name: row[1].trim(),
                    isExternal: row[1].toString().toLowerCase().includes('external') || 
                               row[1].toString().toLowerCase().includes('outside'),
                    isRotating: row[1].toString().toLowerCase().includes('rotat')
                };
            }

            // Check for menu item
            if (currentOutlet && currentScreen && row[1] && row[2] && !row[1].toString().toLowerCase().includes('screen')) {
                const item = row[1].trim();
                const price = row[2];
                const category = categorizeMenuItem(item);

                menusByCategory[category].push({
                    outlet: currentOutlet.number,
                    screen: currentScreen.name,
                    isExternal: currentScreen.isExternal,
                    isRotating: currentScreen.isRotating,
                    item,
                    price
                });
            }
        });

        return menusByCategory;
    } catch (error) {
        console.error('Excel parsing error:', error);
        throw new Error(`Excel parsing failed: ${error.message}`);
    }
};

export const analyzeMenus = (menusByCategory) => {
    const analysis = {};

    Object.entries(menusByCategory).forEach(([category, items]) => {
        // Group items by outlet and screen
        const screenMenus = _.groupBy(items, item => `${item.outlet}-${item.screen}`);

        // Create menu patterns for each screen
        const patterns = Object.entries(screenMenus).map(([screenId, items]) => ({
            screenId,
            outlet: items[0].outlet,
            screen: items[0].screen,
            isExternal: items[0].isExternal,
            isRotating: items[0].isRotating,
            pattern: items.map(item => `${item.item}-${item.price}`).join('|')
        }));

        // Find the most common pattern
        const patternCounts = _.countBy(patterns, 'pattern');
        const standardPattern = _.maxBy(Object.entries(patternCounts), '[1]')?.[0];

        if (standardPattern) {
            // Split into matching and non-matching
            const matching = patterns.filter(p => p.pattern === standardPattern);
            const discrepancies = patterns.filter(p => p.pattern !== standardPattern).map(p => {
                const currentItems = p.pattern.split('|');
                const standardItems = standardPattern.split('|');
                
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
                    outlet: p.outlet,
                    screen: p.screen,
                    isExternal: p.isExternal,
                    isRotating: p.isRotating,
                    differences
                };
            });

            analysis[category] = {
                matching,
                discrepancies,
                standardItems: standardPattern.split('|').map(item => {
                    const [name, price] = item.split('-');
                    return { name, price };
                })
            };
        }
    });

    return analysis;
};