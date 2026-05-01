/// <reference types="chrome" />
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const Popup = () => {
  const [history, setHistory] = useState<any>({});

  useEffect(() => {
    // Grab the data saved by your content.js script
    chrome.storage.local.get(["leetcodeHistory"], (result) => {
      if (result.leetcodeHistory) {
        setHistory(result.leetcodeHistory);
      }
    });
  }, []);

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Orca: Daily Tracker</h2>
      <p style={{ fontSize: '14px', color: 'gray' }}>Data loaded from Chrome Storage:</p>
      
      {/* This prints out the raw JSON data so we can verify the link */}
      <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px', fontSize: '12px', overflowX: 'auto' }}>
        {JSON.stringify(history, null, 2)}
      </pre>
    </div>
  );
};

// Render the React app inside the root div
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}