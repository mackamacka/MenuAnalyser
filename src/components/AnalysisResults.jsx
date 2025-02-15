// src/components/AnalysisResults.jsx
import React, { useState } from 'react';

const MenuCategory = ({ category, analysis }) => {
    if (!analysis) return null;

    return (
        <div className="mt-4 bg-white rounded-lg p-4 border">
            <h4 className="text-lg font-medium mb-2">{category}</h4>
            
            {/* Standard Menu Items */}
            {analysis.items && analysis.items.length > 0 && (
                <div className="mb-4">
                    <h5 className="font-medium">Standard Menu:</h5>
                    <div className="bg-gray-50 p-3 rounded mt-2">
                        {analysis.items.map((item, idx) => (
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
                    <h5 className="text-green-600 font-medium">
                        Screens Following Standard Layout ({analysis.matching.length}):
                    </h5>
                    <div className="mt-2 space-y-1">
                        {analysis.matching.map((screen, idx) => (
                            <div key={idx} className="bg-green-50 p-2 rounded">
                                {screen.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Discrepancies */}
            {analysis.discrepancies && analysis.discrepancies.length > 0 && (
                <div>
                    <h5 className="text-red-600 font-medium">
                        Screens with Different Layout ({analysis.discrepancies.length}):
                    </h5>
                    <div className="mt-2 space-y-2">
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
    );
};

const VenueAnalysis = ({ venue }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-xl font-bold">
                    {venue.type} Outlet {venue.number}
                    {venue.isClosed && <span className="text-red-600 ml-2">(CLOSED)</span>}
                </h3>
                <button className="text-gray-600">
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && venue.categories && (
                <div className="mt-4 space-y-4">
                    {Object.entries(venue.categories).map(([category, analysis]) => (
                        analysis && <MenuCategory 
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
        <div className="p-4 space-y-6">
            {analysis.map((venue, index) => (
                <VenueAnalysis key={index} venue={venue} />
            ))}
        </div>
    );
};

export default AnalysisResults;