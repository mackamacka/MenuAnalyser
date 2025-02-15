// src/components/AnalysisResults.jsx
import React, { useState } from 'react';

const CategoryAnalysis = ({ category, analysis }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="mb-8 border rounded-lg p-4">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-xl font-bold">{category}</h2>
                <span>{isExpanded ? '▼' : '▶'}</span>
            </div>

            {isExpanded && (
                <div className="mt-4">
                    {/* Standard Menu Layout */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Standard Menu Layout:</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            {analysis.standardItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1">
                                    <span>{item.name}</span>
                                    <span>${item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Matching Screens */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-green-600 mb-2">
                            Screens Following Standard Layout ({analysis.matching.length}):
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysis.matching.map((screen, idx) => (
                                <div key={idx} className="bg-green-50 p-3 rounded">
                                    <p>Outlet {screen.outlet}</p>
                                    <p className="text-sm text-gray-600">{screen.screen}</p>
                                    {screen.isRotating && (
                                        <span className="text-xs bg-blue-100 px-2 py-1 rounded">Rotating</span>
                                    )}
                                    {screen.isExternal && (
                                        <span className="text-xs bg-purple-100 px-2 py-1 rounded ml-1">External</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discrepancies */}
                    {analysis.discrepancies.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">
                                Screens with Different Layouts ({analysis.discrepancies.length}):
                            </h3>
                            <div className="space-y-4">
                                {analysis.discrepancies.map((disc, idx) => (
                                    <div key={idx} className="bg-red-50 p-4 rounded">
                                        <div className="mb-2">
                                            <p className="font-medium">Outlet {disc.outlet}</p>
                                            <p className="text-sm text-gray-600">{disc.screen}</p>
                                            {disc.isRotating && (
                                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Rotating</span>
                                            )}
                                            {disc.isExternal && (
                                                <span className="text-xs bg-purple-100 px-2 py-1 rounded ml-1">External</span>
                                            )}
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="text-left">Expected</th>
                                                    <th className="text-left">Found</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {disc.differences.map((diff, i) => (
                                                    <tr key={i}>
                                                        <td className="pr-4">{diff.expected}</td>
                                                        <td>{diff.found}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

const AnalysisResults = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="p-4">
            {Object.entries(analysis).map(([category, categoryAnalysis]) => (
                <CategoryAnalysis 
                    key={category} 
                    category={category} 
                    analysis={categoryAnalysis} 
                />
            ))}
        </div>
    );
};

export default AnalysisResults;