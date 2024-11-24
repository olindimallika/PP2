import React from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import '.'
import Header from './header'; // Ensure this path is correct

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div>
      {/* Persistent Header */}
      <Header />
      
      {/* Dynamic Page Content */}
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;

