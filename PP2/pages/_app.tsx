import React from 'react';
import { AppProps } from 'next/app';
import '../styles/globals.css';
import Header from './header'; // Ensure this path is correct
import { AuthProvider } from './auth-context'; // Update the path to your AuthContext file

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <div>
        {/* Persistent Header */}
        <Header />
        
        {/* Dynamic Page Content */}
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
};

export default MyApp;
