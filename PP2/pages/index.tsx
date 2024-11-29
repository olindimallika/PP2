import React, { useState } from 'react';
import SearchBlogPosts from './frontend/blog-posts/search-blog';
import SearchTemplates from './frontend/code-templates/search-templates';
import SortedBlog from './frontend/blog-posts/sorted';
import TopTemplates from './frontend/code-templates/top-templates';

const Home: React.FC = () => {
  const [showViewAllBlogs, setShowViewAllBlogs] = useState(true);

  const handleSearchTrigger = () => {
    setShowViewAllBlogs(false);
  };

  return (
    <div>
      <main
        className="dark:bg-black dark:text-white"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', textAlign: 'center'}}>
          Welcome to Scriptorium
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', textAlign: 'center'}}>
          Dive into the world of coding! Use our tools to execute and test your scripts.
        </p>

        {/* Flex container for layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start', // Ensures independent column alignment
            gap: '20px',
            marginTop: '40px',
          }}
        >
          {/* Left Column: SearchBlogPosts and SortedBlog */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '100%' }}>
              <SearchBlogPosts />
            </div>
            <div style={{ width: '100%' }}>
              <SortedBlog />
            </div>
          </div>

          {/* Right Column: SearchTemplates, Top 3 Templates */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '100%' }}>
              <SearchTemplates />
            </div>
            <div style={{ width: '100%' }}>
              <TopTemplates />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
