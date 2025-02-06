import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseExcelFile, findDiscrepancies } from '../utils/excelParser';
import AnalysisResults from './AnalysisResults';

const MenuAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const analyzeMenus = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      // Read the file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const screens = await parseExcelFile(data);
          const results = findDiscrepancies(screens);
          setAnalysis(results);
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error processing file. Please check the console for details.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Menu Layout Analysis</CardTitle>
      </CardHeader>
      <CardContent>
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

          {analysis && <AnalysisResults analysis={analysis} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuAnalyzer;