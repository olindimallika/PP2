//with claude
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AdminSort: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const fetchSortedData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Please log in.');

      const response = await fetch('/api/icr/admin-sort', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sorted data.');
      }

      const data = await response.json();
      console.log('Fetched data:', data);
      setBlogPosts(data.blogPosts || []);
      setComments(data.comments || []);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err.message || 'An error occurred while fetching the data.');
    }
  };

  useEffect(() => {
    fetchSortedData();
  }, []);

  const navigateToBlogPost = (id: number) => {
    console.log('Navigating to blog post:', id);
    router.push(`/frontend/blog-posts/view-single-blog?id=${id}`);
  };

  const navigateToComment = (comment: any) => {
    console.log('Navigating to comment:', comment);
    if (!comment.blogPostId) {
      console.error('No blog post ID for comment:', comment);
      return;
    }
    router.push(`/frontend/blog-posts/view-single-blog?id=${comment.blogPostId}#comment-${comment.id}`);
  };


  // ... rest of your existing code ...

  return (
    <div className="flex flex-col min-h-screen dark:bg-zinc-800 dark:text-white text-black bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Content with the Most Reports</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Reported Blog Posts</h2>
        {blogPosts.length === 0 ? (
          <p>No reported blog posts found.</p>
        ) : (
          <ul className="space-y-4">
            {blogPosts.map((post) => (
                <li
                key={post.id}
                onClick={() => navigateToBlogPost(post.id)}
                className="p-4 border rounded-lg hover:bg-zinc-400 cursor-pointer bg-white dark:bg-zinc-700"
              >
                <h3 className="font-bold dark:text-white">{post.title}</h3>
                <p className="text-black dark:text-white">{post.description}</p>
                <p className="text-sm text-black dark:text-white">
                  Reports: {post._count?.reports || 0}
                </p>
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Report Reasons:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {post.reports.map((report: any, index: number) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        {report.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Reported Comments</h2>
        {comments.length === 0 ? (
          <p>No reported comments found.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
                  <li
                  key={comment.id}
                  onClick={() => navigateToComment(comment)}
                  className="p-4 border rounded-lg hover:bg-zinc-400 cursor-pointer bg-white dark:bg-zinc-700"
                >
                  <p className="text-black dark:text-white">{comment.content}</p>
                  <p className="text-sm text-black dark:text-white">
                    Reports: {comment._count?.reports || 0}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Report Reasons:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {comment.reports.map((report: any, index: number) => (
                        <li key={index} className="text-gray-600 dark:text-gray-300">
                          {report.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Comment ID: {comment.id} | Blog Post ID: {comment.blogPostId}
                  </p>
                </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminSort;

