import React from 'react';
import { AppProps } from 'next/app';
import '../styles/styles.css';
import '../styles/globals.css';
import Header from './header'; // Ensure this path is correct
import { AuthProvider } from './auth-context'; // Update the path to your AuthContext file
import Input from './frontend/code-writing-and-execution/input'; 
import ModifyTemplate from './frontend/code-templates/modify-template';
import { useRouter } from 'next/router';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
    const [darkMode, setDarkMode] = React.useState(false);

    const router = useRouter();
    
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

  return (
        <div className={`${darkMode && "dark"}`}>
            <AuthProvider>
                <div>
                    {/* Persistent Header */}
                    <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode}/>
                    
                    {/* Conditionally Render Input */}
                    {router.pathname === "/frontend/code-writing-and-execution/input" ? (
                        <Input darkMode={darkMode} />
                    ) : router.pathname === "/frontend/code-templates/modify-template" ? (
                        <ModifyTemplate darkMode={darkMode}/>
                    ) : (   
                        <Component {...pageProps} darkMode={darkMode} />
                    )}
                </div>
            </AuthProvider>
        </div>
    );
};

export default MyApp;
