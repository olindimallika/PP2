import React, { useState, ChangeEvent, FormEvent } from 'react';

const SearchBlogPosts: React.FC = () => {
    const [query, setQuery] = useState<string>(''); // Store the search query
    const [results, setResults] = useState<any[]>([]); // Store search results
    const [error, setError] = useState<string>(''); // Store error messages
    const [loading, setLoading] = useState<boolean>(false); // Indicate loading state

    // Handle changes to the search input
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    // Handle search form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission behavior
        setLoading(true); // Start loading
        setError(''); // Clear previous errors

        try {
            // Call the backend API to search blog posts
            const response = await fetch('/api/blog-posts/create-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, page: 1, pageSize: 10 }), // Send the search query in the body
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch blog posts.');
            }

            const data = await response.json();
            setResults(data.blogPosts); // Set the search results
        } catch (err: any) {
            setError(err.message || 'An error occurred while searching.');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center mb-6">Search Blog Posts</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        name="query"
                        placeholder="Search by title, content, tags, or code templates"
                        value={query}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
                {/* Display results if any */}
                {results.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                        <ul className="space-y-4">
                            {results.map((post) => (
                                <li key={post.id} className="p-4 border rounded-lg shadow-sm">
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
                                                    <a
                                                        href={template.link}
                                                        className="text-blue-500 underline"
                                                    >
                                                        {template.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* No results message */}
                {results.length === 0 && !loading && !error && query && (
                    <p className="text-gray-600 text-center mt-6">No results found for "{query}".</p>
                )}
            </div>
        </div>
    );
};

export default SearchBlogPosts;
