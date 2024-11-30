import React, { useState } from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import '../styles/globals.css';
import Header from './header'; // Ensure this path is correct
import { AuthProvider } from '../auth-context'; // Update the path to your AuthContext file
import Input from './frontend/code-writing-and-execution/input'; 
import ModifyTemplate from './frontend/code-templates/modify-template';
import { useRouter } from 'next/router';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
    const [darkMode, setDarkMode] = useState(false); // State to track dark mode
    const router = useRouter();

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <div className={`${darkMode ? 'dark' : ''}`}>
            <AuthProvider>
                <div className="transition-colors duration-300 min-h-screen bg-gray-200 dark:bg-gray-900 dark:text-white">
                    {/* Persistent Header */}
                    <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

                    {/* Conditionally Render Specific Components */}
                    {router.pathname === "/frontend/code-writing-and-execution/input" ? (
                        <Input darkMode={darkMode} />
                    ) : router.pathname === "/frontend/code-templates/modify-template" ? (
                        <ModifyTemplate darkMode={darkMode} />
                    ) : (
                        <Component {...pageProps} darkMode={darkMode} />
                    )}
                </div>
            </AuthProvider>
        </div>
    );
};

export default MyApp;
