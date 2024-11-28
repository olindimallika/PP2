import React from 'react';
import { AppProps } from 'next/app';
import '../styles/globals.css';
import Header from './header'; // Ensure this path is correct
import { AuthProvider } from './auth-context'; // Update the path to your AuthContext file

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
    const [darkMode, setDarkMode] = React.useState(false);
    
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

  return (
        <div className={`${darkMode && "dark"}`}>
            <AuthProvider>
                <div>
                    {/* Persistent Header */}
                    <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode}/>
                    
                    {/* Dynamic Page Content */}
                    <Component {...pageProps} />
                </div>
            </AuthProvider>
        </div>
    );
};

export default MyApp;
