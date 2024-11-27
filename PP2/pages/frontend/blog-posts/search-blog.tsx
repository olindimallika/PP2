import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';

const SearchBlogPosts: React.FC = () => {
    const [titleQuery, setTitleQuery] = useState<string>(''); // store title search query
    const [contentQuery, setContentQuery] = useState<string>(''); // store content search query
    const [templateQuery, setTemplateQuery] = useState<string>(''); // store template search query
    const [results, setResults] = useState<any[]>([]); // store search results
    const [error, setError] = useState<string>(''); // handle error messages
    const [loading, setLoading] = useState<boolean>(false); // show loading animation
    const [currentPage, setCurrentPage] = useState<number>(1); // keep track of the current page
    const [totalPages, setTotalPages] = useState<number>(0); // total number of pages available
    const [searchTriggered, setSearchTriggered] = useState<boolean>(false); // Flag to track if search was triggered
    const pageSize = 5; // limit results per page
    const router = useRouter();

    // fetch data from the backend
    const fetchResults = async (page: number) => {
        setLoading(true); // show loading state
        setError(''); // clear any previous error
        try {
            const response = await fetch('/api/blog-posts/search-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titleQuery, // search for this in the title
                    contentQuery, // search for this in the content
                    templateQuery, // search for this in the templates
                    page,
                    pageSize, // how many results per page
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch blog posts.');
            }

            const data = await response.json();
            setResults(data.blogPosts); // update the results with the data
            setTotalPages(data.totalPages); // keep track of how many pages exist
            setCurrentPage(page); // update the current page
        } catch (err: any) {
            setError(err.message || 'An error occurred while searching.'); // show error if something fails
        } finally {
            setLoading(false); // stop showing loading state
        }
    };

    // handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // stop the page from reloading
        setSearchTriggered(true); // Set search triggered flag to true
        fetchResults(1); // always start with page 1 when searching
    };

    // go to the next page
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            fetchResults(currentPage + 1);
        }
    };

    // go to the previous page
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            fetchResults(currentPage - 1);
        }
    };

    // Navigate to blog post details page
    const handleBlogClick = (postId: number) => {
        router.push(`/frontend/blog-posts/view-single-blog?id=${postId}`); // Navigate to the blog post view page
    };

    // Navigate to template details page
    const handleTemplateClick = (templateId: number) => {
        router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`); // Navigate to the template view page
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center mb-6">Search Blog Posts</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* title search input */}
                    <input
                        type="text"
                        name="titleQuery"
                        placeholder="Search by title"
                        value={titleQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleQuery(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* content search input */}
                    <input
                        type="text"
                        name="contentQuery"
                        placeholder="Search by content"
                        value={contentQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setContentQuery(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* template search input */}
                    <input
                        type="text"
                        name="templateQuery"
                        placeholder="Search by code template"
                        value={templateQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTemplateQuery(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading} // disable button while loading
                        className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
                {/* show results if any */}
                {results.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                        <ul className="space-y-4">
                            {results.map((post) => (
                                <li
                                    key={post.id}
                                    className="p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleBlogClick(post.id)} // Navigate to blog post
                                >
                                    <h3 className="text-lg font-bold">{post.title}</h3>
                                    <p className="text-sm text-gray-600">{post.description}</p>
                                    <p className="text-sm mt-2">
                                        <strong>Tags:</strong>{' '}
                                        {post.tags.map((tag: any) => tag.name).join(', ')}
                                    </p>
                                    <div className="mt-2">
                                        <strong>Templates:</strong>
                                        <ul className="list-disc ml-4">
                                            {post.templates.map((template: any) => (
                                                <li key={template.id}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent triggering blog post click
                                                            handleTemplateClick(template.id);
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
                        {/* pagination controls */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1} // disable on first page
                                className={`px-4 py-2 bg-gray-300 rounded-lg mr-2 ${
                                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages} // disable on last page
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
                )}
                {/* no results message */}
                {searchTriggered && results.length === 0 && !loading && !error && (
                    <p className="text-gray-600 text-center mt-6">No results found for your search.</p>
                )}
            </div>
        </div>
    );
};

export default SearchBlogPosts;
