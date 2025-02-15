// src/components/AnalysisResults.jsx
import React, { useState } from 'react';

const BaselineOutlet = ({ outlet }) => {
    return (
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Baseline Menu - Food Outlet 104</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(outlet.categories || {}).map(([category, analysis]) => (
                    <div key={category} className="bg-white p-4 rounded shadow">
                        <h3 className="font-semibold text-lg mb-2">{category}</h3>
                        <div className="space-y-1">
                            {analysis.standardItems?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.name}</span>
                                    <span className="text-gray-600">${item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OutletComparison = ({ venue, baselineVenue }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const compareMenus = (baselineItems, currentItems) => {
        const missing = [];
        const extra = [];
        const priceDifferences = [];

        // Create maps for easier comparison
        const baselineMap = new Map(baselineItems.map(item => [item.name, item.price]));
        const currentMap = new Map(currentItems.map(item => [item.name, item.price]));

        // Find missing and price differences
        baselineMap.forEach((baselinePrice, itemName) => {
            if (!currentMap.has(itemName)) {
                missing.push(itemName);
            } else if (currentMap.get(itemName) !== baselinePrice) {
                priceDifferences.push({
                    item: itemName,
                    baseline: baselinePrice,
                    current: currentMap.get(itemName)
                });
            }
        });

        // Find extra items
        currentMap.forEach((_, itemName) => {
            if (!baselineMap.has(itemName)) {
                extra.push(itemName);
            }
        });

        return { missing, extra, priceDifferences };
    };

    return (
        <div className="mb-4 bg-white rounded-lg shadow-sm">
            <div 
                className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-xl font-bold">
                    Food Outlet {venue.number}
                    {venue.isClosed && <span className="ml-2 text-red-600">(CLOSED)</span>}
                </h2>
                <span>{isExpanded ? '▼' : '▶'}</span>
            </div>

            {isExpanded && (
                <div className="p-4">
                    {Object.entries(venue.categories || {}).map(([category, analysis]) => {
                        const baselineCategory = baselineVenue.categories[category];
                        if (!baselineCategory?.standardItems) return null;

                        const comparison = compareMenus(
                            baselineCategory.standardItems,
                            analysis.standardItems || []
                        );

                        const hasDiscrepancies = 
                            comparison.missing.length > 0 || 
                            comparison.extra.length > 0 || 
                            comparison.priceDifferences.length > 0;

                        return (
                            <div key={category} className="mb-4">
                                <h3 className="font-medium text-lg mb-2">{category}</h3>
                                {!hasDiscrepancies ? (
                                    <div className="text-green-600">✓ Matches Outlet 104 menu</div>
                                ) : (
                                    <div className="space-y-2">
                                        {comparison.missing.length > 0 && (
                                            <div className="text-red-600">
                                                <p className="font-medium">Missing Items:</p>
                                                <ul className="list-disc ml-6">
                                                    {comparison.missing.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {comparison.extra.length > 0 && (
                                            <div className="text-blue-600">
                                                <p className="font-medium">Extra Items:</p>
                                                <ul className="list-disc ml-6">
                                                    {comparison.extra.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {comparison.priceDifferences.length > 0 && (
                                            <div className="text-orange-600">
                                                <p className="font-medium">Price Differences:</p>
                                                <ul className="list-disc ml-6">
                                                    {comparison.priceDifferences.map((diff, idx) => (
                                                        <li key={idx}>
                                                            {diff.item}: ${diff.baseline} → ${diff.current}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const AnalysisResults = ({ analysis }) => {
    if (!analysis) return null;

    // Find Outlet 104
    const baselineOutlet = analysis.find(venue => 
        venue.type === "Food" && venue.number === 104
    );

    if (!baselineOutlet) {
        return <div>Error: Outlet 104 not found</div>;
    }

    // Filter other food outlets
    const otherFoodOutlets = analysis.filter(venue => 
        venue.type === "Food" && venue.number !== 104
    );

    return (
        <div className="p-4">
            <BaselineOutlet outlet={baselineOutlet} />
            <h2 className="text-2xl font-bold mb-4">Comparison with Other Outlets</h2>
            {otherFoodOutlets.map((venue, index) => (
                <OutletComparison 
                    key={index} 
                    venue={venue} 
                    baselineVenue={baselineOutlet}
                />
            ))}
        </div>
    );
};

export default AnalysisResults;