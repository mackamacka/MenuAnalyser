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

// ... Rest of your existing AnalysisResults components ...

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