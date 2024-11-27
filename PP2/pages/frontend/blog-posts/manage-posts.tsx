import React, { useEffect, useState } from 'react';

const ManagePosts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch posts written by the logged-in user
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Unauthorized. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/blog-posts/get-my-posts', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts.');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a post
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Unauthorized. Please log in.');
        return;
      }

      const response = await fetch('/api/blog-posts/create-blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post.');
      }

      alert('Post deleted successfully.');
      fetchPosts(); // Refresh posts after deletion
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the post.');
    }
  };

  // Handle editing a post
  const handleEdit = (id: number) => {
    window.location.href = `/frontend/blog-posts/edit-blog?id=${id}`;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Manage Posts</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-600 text-center">Loading...</p>
        ) : posts.length > 0 ? (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="p-4 border rounded-lg shadow-sm">
                <h3 className="text-lg font-bold">Title: {post.title}</h3>
                <p className="text-sm text-gray-600">Description: {post.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Tags:</strong> {post.tags.map((tag: any) => tag.name).join(', ') || 'No tags'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Template IDs:</strong> {post.templates.map((template: any) => template.id).join(', ') || 'No templates'}
                </p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleEdit(post.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center">No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default ManagePosts;