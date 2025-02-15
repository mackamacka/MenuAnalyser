// src/components/AnalysisResults.jsx
import React, { useState } from 'react';

const ScreenTypeAnalysis = ({ type, analysis }) => {
    if (!analysis) return null;

    return (
        <div className="mt-4 bg-white rounded-lg p-4 border">
            <h4 className="text-lg font-medium mb-2">{type} Screens</h4>
            <div className="space-y-2">
                <p>Total Screens: {analysis.total}</p>
                
                {analysis.matching.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-green-600 font-medium">Standard Layout ({analysis.matching.length} screens):</h5>
                        <ul className="list-disc pl-5 mt-2">
                            {analysis.matching.map((screen, idx) => (
                                <li key={idx}>{screen.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {analysis.discrepancies.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-red-600 font-medium">Discrepancies Found ({analysis.discrepancies.length} screens):</h5>
                        {analysis.discrepancies.map((disc, idx) => (
                            <div key={idx} className="mt-2 pl-4 border-l-2 border-red-200">
                                <p className="font-medium">{disc.screen}</p>
                                {disc.differences.missing.length > 0 && (
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-600">Missing Items:</p>
                                        <ul className="list-disc pl-5 text-sm">
                                            {disc.differences.missing.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {disc.differences.extra.length > 0 && (
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-600">Extra Items:</p>
                                        <ul className="list-disc pl-5 text-sm">
                                            {disc.differences.extra.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
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

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    <ScreenTypeAnalysis type="Operational" analysis={venue.screenAnalysis.operational} />
                    <ScreenTypeAnalysis type="Menu" analysis={venue.screenAnalysis.menu} />
                    <ScreenTypeAnalysis type="Rotating" analysis={venue.screenAnalysis.rotating} />
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