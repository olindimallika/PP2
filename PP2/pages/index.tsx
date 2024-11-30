import React from 'react';
import SearchBlogPosts from './frontend/blog-posts/search-blog';
import SearchTemplates from './frontend/code-templates/search-templates';
import SortedBlog from './frontend/blog-posts/sorted';

const Home: React.FC<{ darkMode: boolean }> = () => {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-200 dark:bg-black dark:text-white">
      <main className="flex flex-col p-5">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
          Welcome to Scriptorium
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300">
          Dive into the world of coding! Use our tools to execute and test your scripts.
        </p>

        {/* Flex container for layout */}
        <div className="flex flex-col md:flex-row justify-between gap-10 mt-10">
          {/* Left Column: SearchBlogPosts and SortedBlog */}
          <div className="flex flex-col gap-5 w-full md:w-1/2">
            <SearchBlogPosts />
            <SortedBlog />
          </div>

          {/* Right Column: SearchTemplates, Top 3 Templates */}
          <div className="flex flex-col gap-5 w-full md:w-1/2">
            <SearchTemplates />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
