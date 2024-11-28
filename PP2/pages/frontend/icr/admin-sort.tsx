import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AdminSort: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Fetch sorted data from the backend
  const fetchSortedData = async () => {
    setLoading(true);
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
      setBlogPosts(data.blogPosts || []);
      setComments(data.comments || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSortedData();
  }, []);

  const navigateToBlogPost = (id: number) => {
    router.push(`/frontend/blog-posts/view-single-blog?id=${id}`);
  };

  const navigateToComment = (postId: number, commentId: number) => {
    router.push(`/frontend/blog-posts/view-single-blog?id=${postId}#comment-${commentId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Content with the Most Reports</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Reported Blog Posts</h2>
        {blogPosts.length === 0 ? (
          <p>No reported blog posts found.</p>
        ) : (
          <ul className="space-y-4">
            {blogPosts.map((post) => (
              <li
                key={post.id}
                className="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => navigateToBlogPost(post.id)}
              >
                <h3 className="font-bold">{post.title}</h3>
                <p className="text-gray-600">{post.description}</p>
                <p className="text-sm text-gray-500">
                  Reports: {post._count?.reports || 0}
                </p>
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
                className="p-4 border rounded-lg hover:bg-gray-100 dark:bg-black cursor-pointer"
                onClick={() => navigateToComment(comment.blogPostId, comment.id)}
              >
                <p className="text-gray-600">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  Reports: {comment._count?.reports || 0}
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
