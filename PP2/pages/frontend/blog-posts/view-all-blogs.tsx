import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ViewAllBlogs: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]); // Store blog posts
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const [error, setError] = useState<string>(''); // Error state
    const [currentPage, setCurrentPage] = useState<number>(1); // Current page for pagination
    const [totalPages, setTotalPages] = useState<number>(0); // Total pages from the backend
    const pageSize = 2; // Number of blogs per page

    const router = useRouter();

    // Fetch all blogs from the backend
    const fetchAllBlogs = async (page: number) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/blog-posts/view-all-blogs?page=${page}&pageSize=${pageSize}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch blog posts.');
            }
            const data = await response.json();
            setBlogs(data.blogPosts);
            setTotalPages(data.totalPages);
            setCurrentPage(page);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching blog posts.');
        } finally {
            setLoading(false);
        }
    };

    // Navigate to individual blog post
    const handleBlogClick = (postId: number) => {
        router.push(`/frontend/blog-posts/view-single-blog?id=${postId}`);
    };

    // Handle pagination
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            fetchAllBlogs(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            fetchAllBlogs(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchAllBlogs(currentPage);
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center mb-6">All Blog Posts</h1>
                {blogs.length === 0 ? (
                    <p>No blog posts found.</p>
                ) : (
                    <ul className="space-y-4">
                        {blogs.map((post) => (
                            <li
                                key={post.id}
                                className="p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-100"
                                onClick={() => handleBlogClick(post.id)}
                            >
                                <h3 className="text-lg font-bold">{post.title}</h3>
                                <p className="text-sm text-gray-600">{post.description}</p>
                                <p className="text-sm mt-2">
                                    <strong>Tags:</strong> {post.tags.map((tag: any) => tag.name).join(', ')}
                                </p>
                                <div className="mt-2">
                                    <strong>Templates:</strong>
                                    <ul className="list-disc ml-4">
                                        {post.templates.map((template: any) => (
                                            <li key={template.id}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent navigating to blog post
                                                        router.push(`/frontend/blog-posts/blog-link-template?id=${template.id}`);
                                                    }}
                                                    className="text-blue-500 underline"
                                                >
                                                    {template.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Pagination controls */}
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

export default ViewAllBlogs;
