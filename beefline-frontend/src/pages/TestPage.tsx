import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'red', fontSize: '32px', marginBottom: '20px' }}>
        CSS Test Page
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'blue', fontSize: '24px' }}>Inline Styles (Should Work)</h2>
        <div style={{ 
          backgroundColor: 'lightblue', 
          padding: '10px', 
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          This box uses inline styles
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'green', fontSize: '24px' }}>Tailwind Classes (Testing)</h2>
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          This should be RED with white text if Tailwind works
        </div>
        <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
          This should be BLUE with white text if Tailwind works
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg">
          This should be GREEN with white text if Tailwind works
        </div>
      </div>

      <div>
        <h2 style={{ color: 'purple', fontSize: '24px' }}>Gradient Test</h2>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
          This should be a purple to pink gradient if Tailwind works
        </div>
      </div>
    </div>
  );
};

export default TestPage;