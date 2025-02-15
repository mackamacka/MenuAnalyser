// src/components/MenuAnalyzer.jsx
import React, { useState } from 'react';
import { parseExcelFile, analyzeVenues } from '../utils/excelParser';
import AnalysisResults from './AnalysisResults';

const MenuAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      analyzeFile(file);
    }
  };

  const analyzeFile = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const venues = await parseExcelFile(data);
          const results = analyzeVenues(venues);
          setAnalysis(results);
        } catch (error) {
          console.error('Error processing file:', error);
          setError(`Error processing file: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError(`Error reading file: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Menu Layout Analysis</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select Excel File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="border p-2 rounded"
            />
          </div>

          {loading && (
            <div className="text-blue-600">
              Analyzing menu layouts...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
              {error}
            </div>
          )}

          {analysis && <AnalysisResults analysis={analysis} />}
        </div>
      </div>
    </div>
  );
};

export default MenuAnalyzer;