// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

const parseExcelFile = async (file) => {
    const workbook = XLSX.read(file, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    // Parse the data
    let outlets = [];
    let currentOutlet = null;
    let currentScreens = null;
    let menuItems = {};

    data.forEach((row, index) => {
        if (!row || !Array.isArray(row)) return;

        // Check for outlet header
        if (row[1] === "Food Outlets:" || row[1] === "Coffee Outlets:" || row[1] === "Bar Outlets:") {
            // Save previous outlet if exists
            if (currentOutlet) {
                outlets.push({
                    ...currentOutlet,
                    screens: Object.entries(menuItems).map(([name, items]) => ({
                        name,
                        category: items.category || 'Other',
                        items: items.items || []
                    }))
                });
            }

            // Start new outlet
            currentOutlet = {
                type: row[1].replace(" Outlets:", ""),
                number: row[2],
                isClosed: String(row[2]).toLowerCase().includes('closed')
            };
            currentScreens = null;
            menuItems = {};
            return;
        }

        // Process current outlet
        if (currentOutlet) {
            // Check for screen headers
            if (row[1] && row[1].toString().toLowerCase().includes('screen')) {
                currentScreens = row
                    .filter(cell => cell != null && cell !== "")
                    .map(screen => String(screen).trim());
                
                currentScreens.forEach(screen => {
                    if (!menuItems[screen]) {
                        menuItems[screen] = {
                            category: null,
                            items: []
                        };
                    }
                });
                return;
            }

            // Check for categories
            if (row[1] && ['Hot Food', 'Cold Food', 'Drinks', 'Snacks', 'CARD ONLY'].includes(row[1])) {
                row.forEach((cell, index) => {
                    if (cell && currentScreens && currentScreens[index]) {
                        if (menuItems[currentScreens[index]]) {
                            menuItems[currentScreens[index]].category = cell;
                        }
                    }
                });
                return;
            }

            // Check for menu items
            if (currentScreens && row[1] && !row[1].includes('Outlets:')) {
                // Process pairs of cells (item and price)
                for (let i = 1; i < row.length; i += 2) {
                    if (row[i] && row[i + 1] !== null && row[i + 1] !== undefined) {
                        const screenIndex = Math.floor((i - 1) / 2);
                        if (currentScreens && currentScreens[screenIndex]) {
                            const screenName = currentScreens[screenIndex];
                            
                            if (screenName && menuItems[screenName]) {
                                menuItems[screenName].items.push({
                                    name: String(row[i]).trim(),
                                    price: row[i + 1]
                                });
                            }
                        }
                    }
                }
            }
        }
    });

    // Don't forget to add the last outlet
    if (currentOutlet) {
        outlets.push({
            ...currentOutlet,
            screens: Object.entries(menuItems).map(([name, items]) => ({
                name,
                category: items.category || 'Other',
                items: items.items || []
            }))
        });
    }

    return outlets;
};

const analyzeVenues = (venues) => {
    return venues.map(venue => {
        // Group screens by category
        const screensByCategory = _.groupBy(venue.screens, 'category');
        
        // Analyze each category
        const categoryAnalysis = {};
        Object.entries(screensByCategory).forEach(([category, screens]) => {
            categoryAnalysis[category] = analyzeScreenGroup(screens);
        });

        return {
            type: venue.type,
            number: venue.number,
            isClosed: venue.isClosed,
            categories: categoryAnalysis
        };
    });
};

const analyzeScreenGroup = (screens) => {
    if (!screens || screens.length === 0) return null;

    const standardPattern = findStandardPattern(screens);
    if (!standardPattern) return null;

    const matching = screens.filter(screen => 
        isMatchingPattern(screen.items, standardPattern)
    );

    const discrepancies = screens.filter(screen => 
        !isMatchingPattern(screen.items, standardPattern)
    ).map(screen => ({
        screen: screen.name,
        differences: findDifferences(standardPattern, screen.items)
    }));

    return {
        total: screens.length,
        standardItems: standardPattern,
        matching: matching.map(s => ({ name: s.name })),
        discrepancies
    };
};

const findStandardPattern = (screens) => {
    // Find the most common menu pattern
    const patterns = screens.map(screen => ({
        items: screen.items,
        count: 1
    }));

    return _.maxBy(patterns, 'count')?.items || null;
};

const isMatchingPattern = (items1, items2) => {
    if (!items1 || !items2) return false;
    if (items1.length !== items2.length) return false;
    
    return items1.every((item, index) => 
        item.name === items2[index].name && 
        item.price === items2[index].price
    );
};

const findDifferences = (standard, actual) => {
    if (!standard || !actual) return { missing: [], extra: [] };

    const standardNames = standard.map(item => `${item.name} ($${item.price})`);
    const actualNames = actual.map(item => `${item.name} ($${item.price})`);

    return {
        missing: standardNames.filter(item => !actualNames.includes(item)),
        extra: actualNames.filter(item => !standardNames.includes(item))
    };
};

export { parseExcelFile, analyzeVenues };