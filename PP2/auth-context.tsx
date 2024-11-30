import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the type for the user object
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: string;  // Admin or User role
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null; // Include the user object in the context
  login: (accessToken: string) => void;
  logout: () => void;
}

// Create the context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Function to fetch user profile from the backend
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/accounts/fetch-user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData); // Set the user data which includes role
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null); // In case of error, clear the user data
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile(token); // Fetch user data after login
    }
  }, []);

  const login = (accessToken: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('accessToken', accessToken);
    fetchUserProfile(accessToken); // Fetch and set the user profile
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null); // Clear user data on logout
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};