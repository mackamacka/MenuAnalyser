// src/components/MenuAnalyzer.jsx
import React, { useState } from 'react';
import { parseExcelFile, findDiscrepancies } from '../utils/excelParser';
import AnalysisResults from './AnalysisResults';

const MenuAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null); // Clear any previous errors
  };

  const analyzeMenus = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          console.log('File loaded, starting analysis...');
          const data = new Uint8Array(e.target.result);
          console.log('File converted to Uint8Array');
          
          const screens = await parseExcelFile(data);
          console.log('Screens parsed:', Object.keys(screens).length);
          
          const results = findDiscrepancies(screens);
          console.log('Analysis complete:', results);
          
          setAnalysis(results);
        } catch (error) {
          console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            type: error.name
          });
          setError(`Error processing file: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setError('Error reading file');
        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Top level error:', error);
      setError(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
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

          <button
            onClick={analyzeMenus}
            disabled={loading || !file}
            className={`px-4 py-2 rounded text-white ${
              loading || !file ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Menus'}
          </button>

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