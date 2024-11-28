import React, { useState } from 'react';
import SearchBlogPosts from './frontend/blog-posts/search-blog'; 
import SearchTemplates from './frontend/code-templates/search-templates';
import SortedBlog from './frontend/blog-posts/sorted';

const Home: React.FC = () => {
  const [showViewAllBlogs, setShowViewAllBlogs] = useState(true); // State to control visibility of ViewAllBlogs

  const handleSearchTrigger = () => {
    setShowViewAllBlogs(false); // Hide ViewAllBlogs when search is triggered
  };

  return (
    <div>
      {/* Page Content */}
      <main
        className="dark:bg-black dark:text-white"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          backgroundSize: '100% 100%',  // Stretches the image exactly to fit the container
          color: '#333',
          fontFamily: 'Arial, sans-serif',
          backgroundImage: 'url(/scriptorium.png)', // Path to your image in the public folder
          backgroundPosition: 'center', // Centers the image
          backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        }}
      >
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>
          Welcome to Scriptorium
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>
          Dive into the world of coding! Use our tools to execute and test your
          scripts.
        </p>

        {/* Flex container for side-by-side layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            marginTop: '40px',
            gap: '20px',
          }}
        >
          {/* Search Blog Posts */}
          <div style={{ flex: 1, maxWidth: '48%' }}>
            <SearchBlogPosts  /> {/* Pass the handler */}
          </div>

          {/* Search Templates */}
          <div style={{ flex: 1, maxWidth: '48%' }}>
            <SearchTemplates />
          </div>
        </div>

        {/* Sorted Blog Posts */}
        <div style={{ flex: 1, maxWidth: '48%', marginTop: '40px' }}>
          <SortedBlog />
        </div>

        
      </main>
    </div>
  );
};

export default Home;

