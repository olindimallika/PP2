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
          minHeight: '100vh',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 className="dark:text-white text-black" style={{ fontSize: '2.5rem'}}>
          Welcome to Scriptorium
        </h1>
        <p className="dark:text-gray-200 text-gray-600" style={{ fontSize: '1.2rem'}}>
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

