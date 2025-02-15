// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

const OUTLET_TYPES = {
    FOOD: 'Food Outlets:',
    COFFEE: 'Coffee Outlets:',
    BAR: 'Bar Outlets:'
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

        // Initialize outlet structure
        const venues = {
            FOOD: [],
            COFFEE: [],
            BAR: []
        };

        let currentType = null;
        let currentOutlet = null;
        let currentScreens = [];

        data.forEach((row, rowIndex) => {
            if (!row || !Array.isArray(row)) return;

            // Check for outlet type header
            Object.entries(OUTLET_TYPES).forEach(([key, value]) => {
                if (row[1] === value) {
                    currentType = key;
                }
            });

            // Check for outlet number
            if (row[1] === OUTLET_TYPES[currentType]) {
                // Save previous outlet if exists
                if (currentOutlet) {
                    venues[currentType].push({
                        ...currentOutlet,
                        screens: currentScreens
                    });
                }

                // Start new outlet
                currentOutlet = {
                    outletNumber: row[2],
                    isClosed: String(row[2]).toLowerCase().includes('closed'),
                    isSpecial: String(row[2]).toLowerCase().includes('pines'), // for 4 pines bar
                    internal: [],
                    external: [],
                    rotating: []
                };
                currentScreens = [];
            }

            // Check for screen information
            if (currentOutlet && row[1] && row[1].toString().toLowerCase().includes('screen')) {
                let screenType = 'internal';
                if (row[1].toString().toLowerCase().includes('outside') || 
                    row[1].toString().toLowerCase().includes('external')) {
                    screenType = 'external';
                }
                if (row[1].toString().toLowerCase().includes('rotat')) {
                    screenType = 'rotating';
                }

                // Get next few rows for menu items
                const menuItems = [];
                for (let i = 1; i <= 10; i++) {
                    if (data[rowIndex + i] && data[rowIndex + i][1]) {
                        menuItems.push({
                            item: data[rowIndex + i][1].trim(),
                            price: data[rowIndex + i][2]
                        });
                    }
                }

                const screen = {
                    name: row[1].trim(),
                    type: screenType,
                    menuItems
                };

                currentScreens.push(screen);
                currentOutlet[screenType].push(screen);
            }
        });

        // Don't forget to add the last outlet
        if (currentOutlet && currentType) {
            venues[currentType].push({
                ...currentOutlet,
                screens: currentScreens
            });
        }

        return venues;
    } catch (error) {
        console.error('Excel parsing error:', error);
        throw new Error(`Excel parsing failed: ${error.message}`);
    }
};

export const findDiscrepancies = (venues) => {
    const results = {};

    // Analyze each venue type
    Object.entries(venues).forEach(([venueType, outlets]) => {
        results[venueType] = outlets.map(outlet => {
            const analysis = {
                outletNumber: outlet.outletNumber,
                isClosed: outlet.isClosed,
                isSpecial: outlet.isSpecial,
                internal: analyzeScreenGroup(outlet.internal),
                external: analyzeScreenGroup(outlet.external),
                rotating: analyzeScreenGroup(outlet.rotating)
            };
            return analysis;
        });
    });

    return results;
};

const analyzeScreenGroup = (screens) => {
    if (!screens || screens.length === 0) return null;

    const layoutPatterns = screens.map(screen => ({
        screenName: screen.name,
        pattern: screen.menuItems.map(item => `${item.item}-${item.price}`).join('|')
    }));

    // Find the most common pattern
    const patternCounts = _.countBy(layoutPatterns, 'pattern');
    const mostCommonPattern = _.maxBy(Object.entries(patternCounts), ([, count]) => count)?.[0];

    if (!mostCommonPattern) return null;

    // Find discrepancies
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
        totalScreens: screens.length,
        standardPattern: mostCommonPattern,
        discrepancies
    };
};