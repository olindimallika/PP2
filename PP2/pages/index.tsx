import React from 'react';
import Header from './header'; // Import the Header component

const Home: React.FC = () => {
  return (
    <div>

      {/* Page Content */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>
          Welcome to Scriptorium
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>
          Dive into the world of coding! Use our tools to execute and test your
          scripts.
        </p>
      </main>
    </div>
  );
};

export default Home;
