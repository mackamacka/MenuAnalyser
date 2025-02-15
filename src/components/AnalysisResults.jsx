// src/components/AnalysisResults.jsx
import React from 'react';

const CategorySection = ({ category, data }) => {
  if (!data) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 bg-gray-100 p-3 rounded">{category}</h2>
      
      <div className="mb-4">
        <p className="text-gray-700">
          Total {category} Screens: {data.totalScreens}
        </p>
        <p className="text-gray-700">
          Screens with Discrepancies: {data.discrepancies.length}
        </p>
      </div>

      {data.discrepancies.length === 0 ? (
        <div className="bg-green-50 p-4 rounded">
          <p className="text-green-700">✓ All {category.toLowerCase()} screens match the standard layout</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.discrepancies.map((disc, index) => (
            <div key={index} className="border rounded p-4">
              <h3 className="font-semibold text-red-600 mb-2">{disc.screen}</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Expected</th>
                    <th className="px-4 py-2 text-left">Found</th>
                  </tr>
                </thead>
                <tbody>
                  {disc.differences.map((diff, idx) => {
                    const [expectedItem, expectedPrice] = (diff.expected || '').split('-');
                    const [foundItem, foundPrice] = (diff.found || '').split('-');
                    
                    return (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">Item {idx + 1}</td>
                        <td className="px-4 py-2">
                          {diff.expected === 'missing' ? (
                            <span className="text-red-600">Missing</span>
                          ) : (
                            <div>
                              <div>{expectedItem}</div>
                              {expectedPrice && <div className="text-sm text-gray-600">${expectedPrice}</div>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {diff.found === 'missing' ? (
                            <span className="text-red-600">Missing</span>
                          ) : (
                            <div>
                              <div>{foundItem}</div>
                              {foundPrice && <div className="text-sm text-gray-600">${foundPrice}</div>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AnalysisResults = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-8">
      {['FOOD', 'COFFEE', 'BAR'].map(category => (
        <CategorySection 
          key={category} 
          category={category} 
          data={analysis[category]}
        />
      ))}
    </div>
  );
};

export default AnalysisResults;