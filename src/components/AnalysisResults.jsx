// src/components/AnalysisResults.jsx
import React, { useState } from 'react';

const ScreenGroupAnalysis = ({ groupName, analysis }) => {
    if (!analysis) return null;

    return (
        <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">{groupName} Screens</h4>
            <div className="pl-4">
                <p>Total Screens: {analysis.totalScreens}</p>
                {analysis.discrepancies.length === 0 ? (
                    <p className="text-green-600">✓ All screens match the standard layout</p>
                ) : (
                    <div className="mt-2">
                        <p className="text-red-600">Found {analysis.discrepancies.length} discrepancies:</p>
                        {analysis.discrepancies.map((disc, idx) => (
                            <div key={idx} className="mt-2 pl-4">
                                <p className="font-medium">{disc.screen}</p>
                                <table className="mt-1 w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-sm">Expected</th>
                                            <th className="text-left text-sm">Found</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {disc.differences.map((diff, i) => (
                                            <tr key={i} className="text-sm">
                                                <td className="pr-4">{diff.expected}</td>
                                                <td>{diff.found}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const OutletAnalysis = ({ outlet }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border rounded-lg p-4 mb-4">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-xl font-bold">
                    Outlet {outlet.outletNumber}
                    {outlet.isClosed && <span className="text-red-600 ml-2">(CLOSED)</span>}
                    {outlet.isSpecial && <span className="text-blue-600 ml-2">(4 Pines)</span>}
                </h3>
                <button className="text-gray-600">
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4">
                    <ScreenGroupAnalysis groupName="Internal" analysis={outlet.internal} />
                    <ScreenGroupAnalysis groupName="External" analysis={outlet.external} />
                    <ScreenGroupAnalysis groupName="Rotating" analysis={outlet.rotating} />
                </div>
            )}
        </div>
    );
};

const VenueTypeSection = ({ type, outlets }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="mb-8">
            <div 
                className="bg-gray-100 p-4 rounded-lg flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-2xl font-bold">{type} Outlets</h2>
                <button className="text-gray-600">
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4">
                    {outlets.map((outlet, index) => (
                        <OutletAnalysis key={index} outlet={outlet} />
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
            <VenueTypeSection type="Food" outlets={analysis.FOOD} />
            <VenueTypeSection type="Coffee" outlets={analysis.COFFEE} />
            <VenueTypeSection type="Bar" outlets={analysis.BAR} />
        </div>
    );
};

export default AnalysisResults;