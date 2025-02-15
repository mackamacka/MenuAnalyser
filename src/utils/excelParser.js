// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

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

        const venues = [];
        let currentVenue = null;
        let currentScreens = [];
        let currentCategories = {};

        data.forEach((row, rowIndex) => {
            if (!row || !Array.isArray(row)) return;

            // Check for venue header
            if (row[1] === "Food Outlets:" || row[1] === "Coffee Outlets:" || row[1] === "Bar Outlets:") {
                if (currentVenue) {
                    // Process previous venue
                    currentVenue.screens = processScreens(currentScreens, currentCategories);
                    venues.push(currentVenue);
                }
                
                // Start new venue
                currentVenue = {
                    type: row[1].replace(" Outlets:", ""),
                    number: row[2],
                    isClosed: String(row[2]).toLowerCase().includes('closed'),
                    screens: []
                };
                currentScreens = [];
                currentCategories = {};
                return;
            }

            // If we're in a venue
            if (currentVenue) {
                // Check for screen headers
                if (row[1] && row[1].toString().toLowerCase().includes('screen')) {
                    currentScreens = row.filter(cell => cell !== null && cell.toString().trim() !== '');
                }
                // Check for categories
                else if (row[1] && (row[1] === 'Hot Food' || row[1] === 'Cold Food' || 
                         row[1] === 'Drinks' || row[1] === 'Snacks' || row[1] === 'CARD ONLY')) {
                    row.forEach((cell, index) => {
                        if (cell) currentCategories[index] = cell;
                    });
                }
                // Check for menu items
                else if (row[1] && !row[1].includes('Outlets:')) {
                    for (let i = 1; i < row.length; i += 2) {
                        if (row[i] && row[i + 1]) {
                            const screenIndex = Math.floor(i / 2);
                            if (currentScreens[screenIndex]) {
                                const screenName = currentScreens[screenIndex];
                                if (!currentVenue.screens.find(s => s.name === screenName)) {
                                    currentVenue.screens.push({
                                        name: screenName,
                                        category: currentCategories[i] || 'Other',
                                        items: []
                                    });
                                }
                                
                                const screen = currentVenue.screens.find(s => s.name === screenName);
                                screen.items.push({
                                    name: row[i],
                                    price: row[i + 1]
                                });
                            }
                        }
                    }
                }
            }
        });

        // Don't forget to add the last venue
        if (currentVenue) {
            currentVenue.screens = processScreens(currentScreens, currentCategories);
            venues.push(currentVenue);
        }

        return venues;
    } catch (error) {
        console.error('Excel parsing error:', error);
        throw new Error(`Excel parsing failed: ${error.message}`);
    }
};

const processScreens = (screens, categories) => {
    return screens.map(screen => ({
        name: screen,
        category: categories[screen] || 'Other',
        items: []
    }));
};

export const analyzeVenues = (venues) => {
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

    const patterns = screens.map(screen => ({
        name: screen.name,
        pattern: screen.items.map(item => `${item.name}-${item.price}`).join('|')
    }));

    const standardPattern = _.chain(patterns)
        .countBy('pattern')
        .toPairs()
        .maxBy('[1]')
        .value()?.[0];

    if (!standardPattern) return null;

    const matching = patterns.filter(p => p.pattern === standardPattern);
    const discrepancies = patterns.filter(p => p.pattern !== standardPattern)
        .map(p => ({
            screen: p.name,
            differences: findDifferences(standardPattern, p.pattern)
        }));

    return {
        total: screens.length,
        matching,
        discrepancies,
        items: standardPattern.split('|').map(item => {
            const [name, price] = item.split('-');
            return { name, price };
        })
    };
};

const findDifferences = (standard, current) => {
    const standardItems = standard.split('|');
    const currentItems = current.split('|');
    
    return {
        missing: standardItems.filter(item => !currentItems.includes(item)),
        extra: currentItems.filter(item => !standardItems.includes(item))
    };
};