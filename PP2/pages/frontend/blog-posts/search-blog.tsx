import React, { useState, ChangeEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const SearchBlogs: React.FC = () => {
    const [titleQuery, setTitleQuery] = useState("");
    const [contentQuery, setContentQuery] = useState("");
    const [templateQuery, setTemplateQuery] = useState("");
    const [tagsQuery, setTagsQuery] = useState(""); // New state for tags search
    const [blogPosts, setBlogPosts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchTriggered, setSearchTriggered] = useState(false); // Track if search has been triggered
    const [currentPage, setCurrentPage] = useState(1); // Track current page
    const [totalPages, setTotalPages] = useState(0); // Track total pages
    const pageSize = 3; // Number of blog posts per page

    const router = useRouter();

    // Fetch blogs from the backend
    const handleSubmit = async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/blog-posts/search-blog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    titleQuery,
                    contentQuery,
                    templateQuery,
                    tagsQuery, // Include tagsQuery in the request
                    page,
                    pageSize,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An error occurred while searching for blogs.");
            }

            const data = await response.json();
            setBlogPosts(data.blogPosts);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
            setError("");
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission (search)
    const getSearchedBlogs = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTriggered(true); // Set searchTriggered to true when the form is submitted
        handleSubmit(1); // Always start from the first page
    };

    // Handle pagination controls
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handleSubmit(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handleSubmit(currentPage + 1);
        }
    };

    // Navigate to blog post details page
    const handleBlogClick = (postId: number) => {
        router.push(`/frontend/blog-posts/view-single-blog?id=${postId}`);
    };

    // Navigate to template details page
    const handleTemplateClick = (templateId: number) => {
        router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
    };

    return (
        <>
            <Head>
                <title>Search Blogs</title>
                <meta name="description" content="Search for blogs" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-800 py-8">
                    <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-8 w-full max-w-lg gap-y-8">
                        <h1 className="text-2xl font-bold text-center mb-6 text-black">Search Blogs</h1>

                        <form onSubmit={getSearchedBlogs} className="space-y-6">
                            <input
                                type="text"
                                placeholder="Search by title"
                                value={titleQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by content"
                                value={contentQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setContentQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by template title"
                                value={templateQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTemplateQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by tags (comma-separated)"
                                value={tagsQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTagsQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`block w-full p-4 rounded-lg text-white ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {/* Show search results */}
                        {blogPosts.length > 0 && (
                            <div className="w-full">
                                <h2 className="text-gray-600 text-xl font-semibold mb-4 text-center bg-violet-100">
                                    Search Results
                                </h2>
                                <ul className="space-y-4">
                                    {blogPosts.map((post) => (
                                        <li key={post.id} className="p-4 border rounded-lg shadow-sm">
                                            <h3 className="text-black text-lg font-bold">{post.title}</h3>
                                            <p className="text-sm text-gray-600">{post.description}</p>
                                            <p className="text-sm mt-2">
                      <strong>Tags:</strong>{' '}
                      {post.tags.map((tag: any) => tag.name).join(', ')}
                    </p>
                                            <div className="mt-2"><strong>Templates:</strong>
                                                {post.templates.map((template) => (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => handleTemplateClick(template.id)}
                                                        className="text-blue-500 hover:underline mr-2"
                                                    >
                                                        {template.title}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleBlogClick(post.id)}
                                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            >
                                                View Blog
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Pagination */}
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 bg-gray-300 rounded-lg ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 bg-gray-300 rounded-lg ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                                    >
                                        Next
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Page {currentPage} of {totalPages}
                                </p>
                            </div>
                        )}

                        {/* No results message */}
                        {searchTriggered && blogPosts.length === 0 && !error && (
                            <p className="text-gray-600 text-center mt-6">No results found for your search.</p>
                        )}

                        {/* Error message */}
                        {error && <p className="text-red-600 text-center mt-6">{error}</p>}
                    </div>
                </div>
            </main>
        </>
    );
};

export default SearchBlogs;


