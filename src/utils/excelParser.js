// src/utils/excelParser.js
import * as XLSX from 'xlsx';
import _ from 'lodash';

const SCREEN_TYPES = {
    OPERATIONAL: 'operational',
    MENU: 'menu',
    ROTATING: 'rotating'
};

const MENU_CATEGORIES = {
    'Hot Food': ['chips', 'burger', 'hot dog', 'pie', 'chicken', 'fish', 'nachos', 'donut', 'croquettes'],
    'Cold Food': ['sandwich', 'wrap', 'sushi', 'salad', 'poke'],
    'Drinks': ['water', 'coca cola', 'juice', 'powerade'],
    'Snacks': ['ice cream', 'chocolate', 'crisps', 'lollies', 'frosty fruit', 'connoisseur']
};

const determineScreenType = (screenName, content) => {
    if (!screenName || !content) return null;
    
    const screenNameLower = screenName.toLowerCase();
    const contentLower = content.toLowerCase();

    if (contentLower === 'card only') {
        return {
            type: SCREEN_TYPES.OPERATIONAL,
            category: 'Payment Info'
        };
    }

    if (screenNameLower.includes('rotating') || screenNameLower.includes('rotate')) {
        return {
            type: SCREEN_TYPES.ROTATING,
            category: 'Rotating Display'
        };
    }

    // Determine menu category
    for (const [category, keywords] of Object.entries(MENU_CATEGORIES)) {
        if (keywords.some(keyword => contentLower.includes(keyword))) {
            return {
                type: SCREEN_TYPES.MENU,
                category
            };
        }
    }

    return {
        type: SCREEN_TYPES.MENU,
        category: 'Other'
    };
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

        const venues = [];
        let currentVenue = null;
        let screenHeaders = null;

        data.forEach((row, rowIndex) => {
            if (!row || !Array.isArray(row)) return;

            // Check for venue header
            if (row[1] === "Food Outlets:" || row[1] === "Coffee Outlets:" || row[1] === "Bar Outlets:") {
                if (currentVenue) {
                    venues.push(currentVenue);
                }
                
                currentVenue = {
                    type: row[1].replace(" Outlets:", ""),
                    number: row[2],
                    isClosed: String(row[2]).toLowerCase().includes('closed'),
                    screens: [],
                    screenCategories: {
                        operational: [],
                        menu: [],
                        rotating: []
                    }
                };
                screenHeaders = null;
                return;
            }

            // Check for screen headers
            if (currentVenue && row[1] && row[1].toString().toLowerCase().includes('screen')) {
                screenHeaders = row.filter(cell => cell !== null);
                return;
            }

            // Process menu items if we have headers and content
            if (currentVenue && screenHeaders && row[1]) {
                screenHeaders.forEach((header, index) => {
                    const columnIndex = row.findIndex((cell, i) => i > 0 && cell !== null);
                    if (columnIndex === -1) return;

                    const content = row[columnIndex];
                    const price = row[columnIndex + 1];

                    const screenInfo = determineScreenType(header, content);
                    
                    if (screenInfo) {
                        const screen = currentVenue.screens.find(s => s.name === header);
                        
                        if (!screen) {
                            const newScreen = {
                                name: header,
                                type: screenInfo.type,
                                category: screenInfo.category,
                                items: []
                            };

                            if (content && content !== "CARD ONLY") {
                                newScreen.items.push({
                                    name: content,
                                    price: price
                                });
                            }

                            currentVenue.screens.push(newScreen);
                            currentVenue.screenCategories[screenInfo.type].push(newScreen);
                        } else if (content && content !== "CARD ONLY") {
                            screen.items.push({
                                name: content,
                                price: price
                            });
                        }
                    }
                });
            }
        });

        // Don't forget to add the last venue
        if (currentVenue) {
            venues.push(currentVenue);
        }

        return venues;
    } catch (error) {
        console.error('Excel parsing error:', error);
        throw new Error(`Excel parsing failed: ${error.message}`);
    }
};

export const analyzeVenues = (venues) => {
    return venues.map(venue => {
        const analysis = {
            type: venue.type,
            number: venue.number,
            isClosed: venue.isClosed,
            screenAnalysis: {
                operational: analyzeScreenGroup(venue.screenCategories.operational),
                menu: analyzeScreenGroup(venue.screenCategories.menu),
                rotating: analyzeScreenGroup(venue.screenCategories.rotating)
            }
        };
        return analysis;
    });
};

const analyzeScreenGroup = (screens) => {
    if (!screens || screens.length === 0) return null;

    // Group screens by their menu patterns
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
    const discrepancies = patterns.filter(p => p.pattern !== standardPattern);

    return {
        total: screens.length,
        matching,
        discrepancies: discrepancies.map(d => ({
            screen: d.name,
            differences: findDifferences(standardPattern, d.pattern)
        }))
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