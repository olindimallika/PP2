import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SortedBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState([]); // Store sorted blog posts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [visibleCommentsCount, setVisibleCommentsCount] = useState({}); // Track visible comments per post

  const pageSize = 3; // Number of items per page
  const router = useRouter(); // Initialize router

  // Fetch sorted blog posts
  const fetchSortedBlogPosts = async (page) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/blog-posts/sorted?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sorted blog posts.');
      }
      const data = await response.json();
      setBlogPosts(data.blogPosts);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);

      // Initialize visible comments for each post
      const initialVisibleComments = {};
      data.blogPosts.forEach((post) => {
        initialVisibleComments[post.id] = 3; // Default to showing 3 comments per post
      });
      setVisibleCommentsCount(initialVisibleComments);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching sorted blog posts.');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change for pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchSortedBlogPosts(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchSortedBlogPosts(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchSortedBlogPosts(currentPage);
  }, []);

  const handleBlogClick = (postId) => {
    router.push(`/frontend/blog-posts/view-single-blog?id=${postId}`); // Navigate to the blog post view page
  };

  const handleTemplateClick = (templateId) => {
    router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
  };

  const toggleCommentsVisibility = (postId) => {
    setVisibleCommentsCount((prev) => ({
      ...prev,
      [postId]:
        visibleCommentsCount[postId] === blogPosts.find((post) => post.id === postId).comments.length
          ? 3
          : blogPosts.find((post) => post.id === postId).comments.length,
    }));
  };

  const renderComments = (comments, postId) => {
    const visibleComments = comments.slice(0, visibleCommentsCount[postId] || 3);
    return (
      <div>
        {visibleComments.map((comment) => (
          <div key={comment.id} className="p-4 ml-6 border-l-4 border-gray-200">
            <div className="flex items-center space-x-4">
              <img
                src={comment.user?.avatar || '/default-avatar.png'}
                alt={`${comment.user?.fullName || 'User'}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
              <p className="font-semibold">
                <span className="mt-4 text-sm text-gray-500">Posted by</span> {comment.user?.fullName}
              </p>
            </div>
            <p className="text-gray-800 mt-2">{comment.content}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-blue-500">▲ {comment.upvoteCount}</span>
              <span className="text-red-500">▼ {comment.downvoteCount}</span>
              <span className="text-gray-500">Rating: {comment.ratingScore}</span>
            </div>
          </div>
        ))}
        {comments.length > 2 && (
          <button
            onClick={() => toggleCommentsVisibility(postId)}
            className="text-blue-500 mt-4 underline"
          >
            {visibleCommentsCount[postId] === comments.length ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    );
  };

  const renderTemplates = (templates) => {
    return (
      templates.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Templates:</h3>
          <ul className="list-disc pl-5">
            {templates.map((template) => (
              <li key={template.id}>
                <button
                  onClick={() => handleTemplateClick(template.id)}
                  className="text-blue-500 underline"
                >
                  {template.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Sorted Blog Posts</h1>
        {blogPosts.length === 0 ? (
          <p>No blog posts found.</p>
        ) : (
          <ul className="space-y-4">
            {blogPosts.map((post) => (
              <li
                key={post.id}
                className="p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-100"
                onClick={() => handleBlogClick(post.id)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={post.user?.avatar || '/default-avatar.png'}
                    alt={`${post.user?.fullName || 'User'}'s avatar`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-bold">{post.title}</h3>
                    <p className="text-sm text-gray-600">Posted by {post.user?.fullName}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{post.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-blue-500">▲ {post.upvoteCount}</span>
                  <span className="text-red-500">▼ {post.downvoteCount}</span>
                  <span className="text-gray-500">Rating: {post.ratingScore}</span>
                </div>
                <p className="text-sm mt-2">
                  <strong>Tags:</strong> {post.tags.map((tag) => tag.name).join(', ')}
                </p>
                <div className="mt-2">{renderTemplates(post.templates)}</div>

                {/* Render sorted comments */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Comments</h3>
                  {post.comments.length > 0 ? (
                    renderComments(post.comments, post.id)
                  ) : (
                    <p className="text-gray-500">No comments yet.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-300 rounded-lg ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-gray-300 rounded-lg ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
            }`}
          >
            Next
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
};

export default SortedBlogPosts;




//====================================================  wWORKING VERSION  =====================================================

// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router'; // Import useRouter for navigation

// const SortedBlogPosts = () => {
//   const [blogPosts, setBlogPosts] = useState([]); // Store sorted blog posts
//   const [loading, setLoading] = useState(true); // Loading state
//   const [error, setError] = useState(''); // Error state
//   const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
//   const [totalPages, setTotalPages] = useState(0); // Total number of pages

//   const pageSize = 3; // Number of items per page
//   const router = useRouter(); // Initialize router

//   // Fetch sorted blog posts
//   const fetchSortedBlogPosts = async (page) => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await fetch(`/api/blog-posts/sorted?page=${page}&pageSize=${pageSize}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch sorted blog posts.');
//       }
//       const data = await response.json();
//       setBlogPosts(data.blogPosts);
//       setCurrentPage(data.currentPage);
//       setTotalPages(data.totalPages);
//     } catch (err) {
//       setError(err.message || 'An error occurred while fetching sorted blog posts.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle page change for pagination
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       fetchSortedBlogPosts(currentPage + 1);
//     }
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       fetchSortedBlogPosts(currentPage - 1);
//     }
//   };

//   useEffect(() => {
//     fetchSortedBlogPosts(currentPage);
//   }, []);

//   const renderComments = (comments) => {
//     return comments.map((comment) => (
//       <div key={comment.id} className="p-4 ml-6 border-l-4 border-gray-200">
//         <p className="text-gray-800 lowercase">{comment.content}</p>
//         <div className="flex items-center space-x-4 mt-1">
//           <span className="text-blue-500">▲ {comment.upvoteCount}</span>
//           <span className="text-red-500">▼ {comment.downvoteCount}</span>
//           <span className="text-gray-500">Rating: {comment.ratingScore}</span>
//         </div>
//       </div>
//     ));
//   };

//   const handleTemplateClick = (templateId) => {
//     router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
//   };

//   const renderTemplates = (templates) => {
//     return (
//       templates.length > 0 && (
//         <div className="mt-4">
//           <h3 className="text-sm font-semibold">Templates:</h3>
//           <ul className="list-disc pl-5">
//             {templates.map((template) => (
//               <li key={template.id}>
//                 <button
//                   onClick={() => handleTemplateClick(template.id)}
//                   className="text-blue-500 underline"
//                 >
//                   {template.title}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )
//     );
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
//         <h1 className="text-3xl font-bold mb-4">Sorted Blog Posts</h1>
//         {blogPosts.length === 0 ? (
//           <p>No blog posts found.</p>
//         ) : (
//           blogPosts.map((post) => (
//             <div key={post.id} className="mb-6 border-b pb-4">
//               {/* Blog post header */}
//               <div className="flex items-center space-x-4">
//                 <img
//                   src={post.user?.avatar || '/default-avatar.png'}
//                   alt={`${post.user?.fullName || 'User'}'s avatar`}
//                   className="w-12 h-12 rounded-full"
//                 />
//                 <div>
//                   <h2 className="text-xl font-semibold">{post.title}</h2>
//                   <p className="text-sm text-gray-600">Posted by {post.user?.fullName}</p>
//                 </div>
//               </div>

//               {/* Blog post content */}
//               <p className="text-gray-600 mt-2">{post.description}</p>
//               <div className="flex items-center space-x-4 mt-2">
//                 <span className="text-blue-500">▲ {post.upvoteCount}</span>
//                 <span className="text-red-500">▼ {post.downvoteCount}</span>
//                 <span className="text-gray-500">Rating: {post.ratingScore}</span>
//               </div>

//               {/* Tags */}
//               {post.tags?.length > 0 && (
//                 <div className="mt-4">
//                   <h3 className="text-sm font-semibold">Tags:</h3>
//                   <ul className="flex space-x-2">
//                     {post.tags.map((tag) => (
//                       <li key={tag.id}>
//                         <h3 className="text-black-500">{tag.name}</h3>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Templates */}
//               {renderTemplates(post.templates)}

//               {/* Comments */}
//               <h3 className="mt-4 text-lg font-semibold">Comments</h3>
//               {post.comments.length > 0 ? (
//                 <div className="space-y-4">{renderComments(post.comments)}</div>
//               ) : (
//                 <p className="text-gray-500">No comments yet.</p>
//               )}
//             </div>
//           ))
//         )}

//         {/* Pagination Controls */}
//         <div className="flex justify-center mt-6 space-x-4">
//           <button
//             onClick={handlePreviousPage}
//             disabled={currentPage === 1}
//             className={`px-4 py-2 bg-gray-300 rounded-lg ${
//               currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
//             }`}
//           >
//             Previous
//           </button>
//           <button
//             onClick={handleNextPage}
//             disabled={currentPage === totalPages}
//             className={`px-4 py-2 bg-gray-300 rounded-lg ${
//               currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
//             }`}
//           >
//             Next
//           </button>
//         </div>
//         <p className="text-sm text-gray-500 mt-2 text-center">
//           Page {currentPage} of {totalPages}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SortedBlogPosts;
