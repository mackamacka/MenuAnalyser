// src/components/AnalysisResults.jsx
import React, { useState } from 'react';

const StandardLayout = ({ analysis }) => {
    // Find the standard layouts for each category
    const standardLayouts = {};
    
    // Loop through all venues to find the most common layouts
    analysis.forEach(venue => {
        Object.entries(venue.categories || {}).forEach(([category, categoryData]) => {
            if (categoryData?.standardItems) {
                if (!standardLayouts[category]) {
                    standardLayouts[category] = {
                        items: categoryData.standardItems,
                        count: 1
                    };
                } else {
                    standardLayouts[category].count++;
                }
            }
        });
    });

    return (
        <div className="mb-8 bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Standard Layout Reference</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(standardLayouts).map(([category, data]) => (
                    <div key={category} className="bg-white p-4 rounded shadow">
                        <h3 className="font-semibold text-lg mb-2">{category}</h3>
                        <div className="space-y-1">
                            {data.items.map((item, idx) => (
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

const CategoryAnalysis = ({ category, analysis }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    if (!analysis) return null;

    return (
        <div className="mb-6 border rounded-lg p-4">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-semibold">{category}</h3>
                <span>{isExpanded ? '▼' : '▶'}</span>
            </div>

            {isExpanded && (
                <div className="mt-4">
                    {/* Standard Menu */}
                    {analysis.standardItems && (
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Standard Menu:</h4>
                            <div className="bg-gray-50 p-3 rounded">
                                {analysis.standardItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between py-1">
                                        <span>{item.name}</span>
                                        <span>${item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matching Screens */}
                    {analysis.matching && analysis.matching.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-green-600 mb-2">
                                Screens Following Standard Layout ({analysis.matching.length}):
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {analysis.matching.map((screen, idx) => (
                                    <div key={idx} className="bg-green-50 p-2 rounded text-sm">
                                        {screen.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discrepancies */}
                    {analysis.discrepancies && analysis.discrepancies.length > 0 && (
                        <div>
                            <h4 className="font-medium text-red-600 mb-2">
                                Screens with Different Layout ({analysis.discrepancies.length}):
                            </h4>
                            <div className="space-y-4">
                                {analysis.discrepancies.map((disc, idx) => (
                                    <div key={idx} className="bg-red-50 p-3 rounded">
                                        <p className="font-medium">{disc.screen}</p>
                                        {disc.differences.missing.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">Missing Items:</p>
                                                <ul className="list-disc ml-5 text-sm">
                                                    {disc.differences.missing.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {disc.differences.extra.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">Extra Items:</p>
                                                <ul className="list-disc ml-5 text-sm">
                                                    {disc.differences.extra.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const VenueAnalysis = ({ venue }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-6 bg-white rounded-lg shadow-sm">
            <div 
                className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-xl font-bold">
                    {venue.type} Outlet {venue.number}
                    {venue.isClosed && (
                        <span className="ml-2 text-red-600">(CLOSED)</span>
                    )}
                </h2>
                <span>{isExpanded ? '▼' : '▶'}</span>
            </div>

            {isExpanded && (
                <div className="p-4">
                    {Object.entries(venue.categories || {}).map(([category, analysis]) => (
                        <CategoryAnalysis 
                            key={category}
                            category={category}
                            analysis={analysis}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const AnalysisResults = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="p-4">
            <StandardLayout analysis={analysis} />
            {analysis.map((venue, index) => (
                <VenueAnalysis key={index} venue={venue} />
            ))}
        </div>
    );
};

export default AnalysisResults;