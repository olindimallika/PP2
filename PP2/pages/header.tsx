import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './auth-context'; // Update the path to your AuthContext

const Header: React.FC = () => {
  const { isLoggedIn, logout } = useAuth(); // Use global authentication state
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '25px 20px',
        backgroundColor: 'lavender',
        color: '#fff',
      }}
    >
      {/* Logo or Title */}
      <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Scriptorium</h1>

      {/* Navigation Links */}
      <nav>
        <ul
          style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '15px',
          }}
        >
          <li>
            <Link
              href="/"
              style={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '1rem',
                padding: '5px 10px',
                borderRadius: '5px',
                transition: 'background-color 0.3s',
              }}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/create-template"
              style={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '1rem',
                padding: '5px 10px',
                borderRadius: '5px',
                transition: 'background-color 0.3s',
              }}
            >
              Create Template
            </Link>
          </li>
          <li>
            <Link
              href="/input"
              style={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '1rem',
                padding: '5px 10px',
                borderRadius: '5px',
                transition: 'background-color 0.3s',
              }}
            >
              Code Execution
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              style={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '1rem',
                padding: '5px 10px',
                borderRadius: '5px',
                transition: 'background-color 0.3s',
              }}
            >
              About
            </Link>
          </li>

          {/* Conditional Rendering Based on Login Status */}
          {isLoggedIn ? (
            <li
              style={{
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'gray',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                U
              </div>
              {showDropdown && (
                <ul
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    backgroundColor: 'white',
                    color: 'black',
                    listStyle: 'none',
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <li style={{ marginBottom: '10px' }}>
                    <Link href="/profile" style={{ textDecoration: 'none', color: 'black' }}>
                      Profile
                    </Link>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <Link href="/manage-posts" style={{ textDecoration: 'none', color: 'black' }}>
                      Manage Posts
                    </Link>
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <Link href="/manage-templates" style={{ textDecoration: 'none', color: 'black' }}>
                      Manage Templates
                    </Link>
                  </li>
                  <li
                    style={{
                      cursor: 'pointer',
                      color: 'red',
                    }}
                    onClick={logout} // Call the logout function
                  >
                    Logout
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <Link
                href="/log-in"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  padding: '5px 20px',
                  backgroundColor: 'black',
                  borderRadius: '5px',
                  border: 'none',
                  display: 'inline-block',
                  cursor: 'pointer',
                  verticalAlign: 'middle',
                  lineHeight: '1.5',
                  marginTop: '-7px',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#2980b9'; // Darker hover color
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'black'; // Original color on mouse leave
                }}
              >
                Log in
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
