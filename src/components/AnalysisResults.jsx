// /src/components/AnalysisResults.jsx
import React from 'react';

const AnalysisResults = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">
        Analyzed {analysis.totalScreens} screens
      </div>
      
      {analysis.discrepancies.length === 0 ? (
        <div className="text-green-600">All screens follow the standard layout</div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-2">Discrepancies Found:</h3>
          {analysis.discrepancies.map((disc, index) => (
            <div key={index} className="mb-4 p-4 bg-red-50 rounded">
              <div className="font-medium">{disc.screen}</div>
              <ul className="mt-2 space-y-1">
                {disc.differences.map((diff, idx) => (
                  <li key={idx} className="text-sm">
                    Expected: {diff.expected || 'none'} | 
                    Found: {diff.found || 'none'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;