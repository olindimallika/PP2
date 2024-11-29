import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const UnhideContent: React.FC = () => {
  const [hiddenContent, setHiddenContent] = useState<{ posts: any[]; comments: any[] }>({
    posts: [],
    comments: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Fetch hidden content
  const fetchHiddenContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized.');

      const response = await fetch('/api/icr/get-hidden-content', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch hidden content.');
      }

      const data = await response.json();
      setHiddenContent({ posts: data.posts || [], comments: data.comments || [] });
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching hidden content.');
    } finally {
      setLoading(false);
    }
  };

  // Handle unhiding content
  const handleUnhide = async (id: number, type: 'post' | 'comment') => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized.');

      const response = await fetch('/api/icr/unhide', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          blogPostId: type === 'post' ? id : undefined,
          commentId: type === 'comment' ? id : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unhide content.');
      }

      // Refresh hidden content list
      fetchHiddenContent();
    } catch (err: any) {
      setError(err.message || 'An error occurred while unhiding the content.');
    }
  };

  // Navigate to a hidden post
  const navigateToPost = (postId: number) => {
    router.push(`/frontend/blog-posts/view-single-blog?id=${postId}`);
  };

  // Navigate to a hidden comment
  const navigateToComment = (postId: number, commentId: number) => {
    router.push(`/frontend/blog-posts/view-single-blog?id=${postId}#comment-${commentId}`);
  };

  useEffect(() => {
    fetchHiddenContent();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen dark:bg-zinc-800 dark:text-white text-black bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Hidden Content</h1>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Hidden Posts</h2>
        {hiddenContent.posts.length === 0 ? (
          <p>No hidden posts found.</p>
        ) : (
          hiddenContent.posts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg hover:bg-gray-100">
              <h3
                className="font-bold text-blue-500 cursor-pointer underline"
                onClick={() => navigateToPost(post.id)}
              >
                {post.title}
              </h3>
              <p className="text-gray-400">{post.description}</p>
              <button
                onClick={() => handleUnhide(post.id, 'post')}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Unhide Post
              </button>
            </div>
          ))
        )}

        <h2 className="text-xl font-semibold">Hidden Comments</h2>
        {hiddenContent.comments.length === 0 ? (
          <p>No hidden comments found.</p>
        ) : (
          hiddenContent.comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg hover:bg-gray-100">
              <p
                className="cursor-pointer underline text-blue-500"
                onClick={() => navigateToComment(comment.blogPostId, comment.id)}
              >
                {comment.content}
              </p>
              <button
                onClick={() => handleUnhide(comment.id, 'comment')}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Unhide Comment
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UnhideContent;
