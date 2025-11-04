import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#EBF8FF', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1F2937', 
          marginBottom: '1rem' 
        }}>
          🎉 CustodyX.AI - SaaS Testing
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
          Application is loading successfully!
        </p>
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#D1FAE5', 
          borderRadius: '6px' 
        }}>
          <p style={{ color: '#047857', fontSize: '0.875rem' }}>
            ✅ React is working<br/>
            ✅ Vite is working<br/>
            ✅ TypeScript is working<br/>
            ✅ Server is running on localhost:3001
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;