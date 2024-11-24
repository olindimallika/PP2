import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
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
          
        </ul>
      </nav>
    </header>
  );
};

export default Header;
