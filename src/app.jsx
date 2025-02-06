import React from 'react';
import MenuAnalyzer from './components/MenuAnalyzer';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Menu Layout Analyzer</h1>
        <MenuAnalyzer />
      </div>
    </div>
  );
}

export default App;