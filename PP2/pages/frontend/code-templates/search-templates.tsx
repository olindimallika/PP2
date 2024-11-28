import React, { useState, ChangeEvent } from "react";
import Head from "next/head";

const SearchTemplates: React.FC = () => {
    const [titleQuery, setTitleQuery] = useState("");
    const [explanationQuery, setExplanationQuery] = useState("");
    const [tagQuery, setTagQuery] = useState("");
    const [templateStates, setTemplateStates] = useState([]);
    const [error, setError] = useState("");
    const [searchTriggered, setSearchTriggered] = useState(false); // Track if search has been triggered
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1); // Track current page
    const [totalPages, setTotalPages] = useState(0); // Track total pages
    const pageSize = 3; // Number of templates per page

    // Fetch templates from the backend
    const handleSubmit = async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/code-templates/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    titleQuery,
                    explanationQuery,
                    tagQuery,
                    page,
                    pageSize,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An error occurred while getting the saved code templates.");
            }

            const data = await response.json();
            setTemplateStates(data.codeTemplates);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
            setError("");
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const getSearchedTemplates = (e: React.FormEvent) => {
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

    // For copying code to clipboard
    const handleCopy = (id: number, code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setTemplateStates((prevStates) =>
                prevStates.map((temp) =>
                    temp.id === id ? { ...temp, copied: true } : { ...temp, copied: false }
                )
            );

            setTimeout(() => {
                setTemplateStates((prevStates) =>
                    prevStates.map((temp) =>
                        temp.id === id ? { ...temp, copied: false } : temp
                    )
                );
            }, 2000);
        });
    };

    const handleModify = (id: number) => {
        window.location.href = `/frontend/code-templates/modify-template?id=${id}`;
    };

    return (
        <>
            <Head>
                <title>Scriptorium</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-800 py-8">
                    <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 shadow-lg rounded-lg p-8 w-full max-w-lg whitespace-pre-line gap-y-8">
                        <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Search All Templates</h1>

                        <form onSubmit={getSearchedTemplates} className="space-y-6 w-full">
                            <input
                                id="title-bar"
                                type="text"
                                name="titleQuery"
                                placeholder="Search by title"
                                value={titleQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleQuery(e.target.value)}
                                className="w-full p-3 border text-black dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white"
                            />
                            <input
                                id="exp-bar"
                                type="text"
                                name="explanationQuery"
                                placeholder="Search by explanation"
                                value={explanationQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setExplanationQuery(e.target.value)}
                                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white"
                            />
                            <input
                                id="tag-bar"
                                type="text"
                                name="tagQuery"
                                placeholder="Search by tags"
                                value={tagQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTagQuery(e.target.value)}
                                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white"
                            />
                            <button
                                id="search-button"
                                type="submit"
                                disabled={loading}
                                className={`block w-full p-4 ps-10 rounded-lg text-white ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600"}`}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {/* Show search results if any */}
                        {templateStates.length > 0 && (
                            <div className="w-full mt-8">
                                <h2 className="text-gray-600 text-xl font-semibold mb-4 text-center bg-violet-100 dark:bg-violet-800 dark:text-white">
                                    Search Results
                                </h2>
                                <ul className="space-y-4">
                                    {templateStates.map((temp) => (
                                        <li key={temp.id} className="p-4 border dark:border-gray-600 rounded-lg shadow-sm dark:bg-zinc-800">
                                            <h3 className="text-black dark:text-white text-lg font-bold">{temp.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Template ID: {temp.id}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{temp.explanation}</p>
                                            <div className="relative bg-gray-50 dark:bg-zinc-700 rounded-lg p-6 pt-10 h-48 overflow-scroll">
                                                <pre>
                                                    <code className="text-sm text-violet-500 whitespace-pre dark:text-violet-300">{temp.code}</code>
                                                </pre>
                                                <button
                                                    onClick={() => handleCopy(temp.id, temp.code)}
                                                    className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded dark:bg-blue-400 dark:text-white"
                                                >
                                                    {temp.copied ? "Copied" : "Copy"}
                                                </button>
                                            </div>
                                            <p className="text-sm mt-2 text-black dark:text-white ">
                                                <strong>Tags:</strong> {temp.tags.map((tag: any) => tag.name).join(", ")}
                                            </p>
                                            <button
                                                onClick={() => handleModify(temp.id)}
                                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                                            >
                                                Modify
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Pagination */}
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 bg-gray-300 dark:text-black rounded-lg ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400 dark:hover:bg-zinc-600"}`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 bg-gray-300 dark:text-black rounded-lg ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400 dark:hover:bg-zinc-600"}`}
                                    >
                                        Next
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 text-center dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </p>
                            </div>
                        )}

                        {/* No results message */}
                        {searchTriggered && templateStates.length === 0 && !error && (
                            <p className="text-gray-600 text-center mt-6 dark:text-gray-400">No results found for your search.</p>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default SearchTemplates;
