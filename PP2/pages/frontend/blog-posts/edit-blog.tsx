import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const EditBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Extract blog post ID from query params

  const [post, setPost] = useState({
    title: '',
    description: '',
    tags: '', // Comma-separated tags for editing
    templateIds: '', // Comma-separated template IDs for editing
  });
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the existing blog post details
  const fetchPost = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Unauthorized. Please log in.');
        return;
      }

      const response = await fetch(`/api/blog-posts/get-my-posts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch the post.');
      }

      const data = await response.json();
      const currentPost = data.posts.find((p: any) => p.id === Number(id));
      if (!currentPost) {
        setError('Blog post not found.');
        return;
      }

      // Populate the form fields with fetched data
      setPost({
        title: currentPost.title || '',
        description: currentPost.description || '',
        tags: currentPost.tags.map((tag: any) => tag.name).join(', ') || '', // Convert tags array to comma-separated string
        templateIds: currentPost.templates.map((template: any) => template.id).join(', ') || '', // Convert template IDs array to comma-separated string
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the post.');
    } finally {
      setLoading(false);
    }
  };

  // Update blog post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Unauthorized. Please log in.');
        return;
      }

      // Convert tags and template IDs to arrays
      const updatedTags = post.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
      const updatedTemplateIds = post.templateIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));

      const response = await fetch(`/api/blog-posts/create-blog`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: Number(id),
          title: post.title,
          description: post.description,
          tags: updatedTags,
          templateIds: updatedTemplateIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update the blog post.');
      }

      setMessage('Blog post updated successfully!');
      router.push('/frontend/blog-posts/manage-posts'); // Redirect back to manage posts
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the post.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8 dark:bg-zinc-800">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg dark:bg-black">
        <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Edit Blog Post</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={post.title}
            onChange={handleInputChange}
            required
            className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 text-black dark:text-white"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={post.description}
            onChange={handleInputChange}
            required
            className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 text-black dark:text-white"
            rows={4}
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma-separated)"
            value={post.tags}
            onChange={handleInputChange}
            className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 text-black dark:text-white"
          />
          <input
            type="text"
            name="templateIds"
            placeholder="Template IDs (comma-separated)"
            value={post.templateIds}
            onChange={handleInputChange}
            className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 text-black dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBlogPost;
