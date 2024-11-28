import React, { useState, ChangeEvent, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';

export default function SearchSavedTemplates() {
    const [titleQuery, setTitleQuery] = React.useState("");
    const [explanationQuery, setExplanationQuery] = React.useState("");
    const [tagQuery, setTagQuery] = React.useState("");

    const [viewError, setViewError] = React.useState("");
    const [searchError, setSearchError] = React.useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const [action, setAction] = React.useState("Select an action");
    const options = ["Select an action", "View Existing Templates", "Search Saved Templates"];
    const router = useRouter();

    const viewedTemplates = []; // array of all user's saved templates
    const [viewTemplates, setViewTemplates] = useState(  // array of templates with an extra parameter "copied" for if the user copies the template
        viewedTemplates.map((temp) => ({ ...temp, copied: false }))
    );

    const searchedTemplates = []; // array of all user's saved templates after search
    const [searchTemplates, setSearchTemplates] = useState(  // array of templates with an extra parameter "copied" for if the user copies the template
        searchedTemplates.map((temp) => ({ ...temp, copied: false }))
    );

    const handleSubmitView = async () => {
        if (loading) return; // prevent multiple requests
        setLoading(true);

        const id = localStorage.getItem('userId'); 
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setViewError('Unauthorized. Please log in or sign up.');
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch(`/api/code-templates/search-saved?userId=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please log in or sign up.');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while getting the saved code templates.');
            }

            const data = await response.json();

            setViewTemplates(data.savedTemplates);
            setViewError('');
    
        } catch (err: any) {
            setViewError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSearch = async () => {
        const id = localStorage.getItem('userId'); 
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setSearchError('Unauthorized. Please log in or sign up.');
            return;
        }

        try {
            const response = await fetch(`/api/code-templates/search-saved?userId=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    titleQuery, 
                    explanationQuery,
                    tagQuery,
                }),
            });
        
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please log in or sign up.');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while getting the saved code templates.');
            }

            const data = await response.json();

            setSearchTemplates(data.savedTemplates);
            setSearchError('');
        
        } catch (err: any) {
            setSearchError(err.message || 'An error occurred.');
        } 
    };

    const getSavedTemplates = () => {
        handleSubmitView();
    };

    const getSearchedTemplates = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // stop the page from reloading
        handleSubmitSearch(); 
    };

    const redirectToLogIn = () => {
        router.push(`/frontend/accounts/log-in`);
    };

    const redirectToSignUp = () => {
        router.push(`/frontend/accounts/sign-up`);
    };

    // clear output
    const resetOutput = () => { 
        setViewTemplates([]);
        setViewError("");
        setSearchTemplates([]);  
        setSearchError("");
    }

    // when a new option is selected from the dropdown
    const handleChange = (event) => {
        setAction(event.target.value);
        resetOutput();

        // make all search bars and search button invisible when new option is selected
        document.getElementById("title-bar").classList.add("invisible");
        document.getElementById("exp-bar").classList.add("invisible");
        document.getElementById("tag-bar").classList.add("invisible");
        document.getElementById("search-button").classList.add("invisible");

        if (event.target.value === "View Existing Templates") {
            getSavedTemplates();
        } else if (event.target.value === "Search Saved Templates") {
            document.getElementById("title-bar").classList.remove("invisible");
            document.getElementById("exp-bar").classList.remove("invisible");
            document.getElementById("tag-bar").classList.remove("invisible");
            document.getElementById("search-button").classList.remove("invisible");
        }
    };

    
    // for copying code to user's clipboard
    const handleCopy = (id: number, code: string, method: string) => {
        if (method === 'view') {
            navigator.clipboard.writeText(code).then(() => {
                setViewTemplates((prevStates) =>
                    prevStates.map((temp) =>
                        temp.id === id ? { ...temp, copied: true } : { ...temp, copied: false }
                    )
                );
        
                // Reset the "copied" state after a short delay
                setTimeout(() => {
                    setViewTemplates((prevStates) =>
                        prevStates.map((temp) =>
                            temp.id === id ? { ...temp, copied: false } : temp
                        )
                    );
                }, 2000);
            });
        } else if (method === 'search') {
            navigator.clipboard.writeText(code).then(() => {
                setSearchTemplates((prevStates) =>
                    prevStates.map((temp) =>
                        temp.id === id ? { ...temp, copied: true } : { ...temp, copied: false }
                    )
                );
        
                // Reset the "copied" state after a short delay
                setTimeout(() => {
                    setSearchTemplates((prevStates) =>
                        prevStates.map((temp) =>
                            temp.id === id ? { ...temp, copied: false } : temp
                        )
                    );
                }, 2000);
            }); 
        }
    };

    const handleManage = () => {
        window.location.href = '/frontend/code-templates/manage-templates';
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
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8 dark:bg-slate-800">
                    <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-8 w-full max-w-lg whitespace-pre-line gap-4">
                        {/* Dropdown for either saving or searching saved templates */}
                        <select 
                            id="manage" 
                            className="h-10 md:h-16 text-white bg-blue-500 hover:bg-blue-600 rounded-lg w-4/5" 
                            value={action} 
                            onChange={handleChange}>

                            {options.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>

                        {/* If there are any errors with accessing saved templates */}
                        {viewError && (
                            <div className="text-red-500 text-center mt-4">
                                <p>{viewError}</p>
                                {(viewError === 'Unauthorized. Please log in or sign up.') && (
                                    <div className="flex space-x-4 justify-center mt-2">
                                        <button
                                            onClick={redirectToLogIn}
                                            className="text-blue-500 underline cursor-pointer"
                                        >
                                            Log in
                                        </button>
                                        <span>|</span>
                                        <button
                                            onClick={redirectToSignUp}
                                            className="text-blue-500 underline cursor-pointer"
                                        >
                                            Sign up
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Show view results if any */}
                        {viewTemplates.length > 0 && (
                            <div className="w-full">
                                <h2 className="text-gray-500 text-xl font-semibold mb-4">Your Saved Templates:</h2>
                                <div className="m-4 flex space-x-4">
                                    <button
                                        onClick={() => handleManage()}
                                        className="w-full bg-blue-500 text-white rounded hover:bg-blue-600 p-2"
                                    >
                                        Manage All Templates
                                    </button>
                                </div>
                                <ul className="space-y-4">
                                    {viewTemplates.map((temp) => (
                                        <li key={temp.id} className="p-4 border rounded-lg shadow-sm">
                                            <h3 className="text-black text-lg font-bold">{temp.title}</h3>
                                            <p className="text-sm text-gray-600 font-bold">Template ID: {temp.id}</p>
                                            <p className="text-sm text-gray-600">{temp.explanation}</p>
                                            <p className="text-gray-600">

                                                {/* Code Block Container */}
                                                <div className="relative bg-gray-50 rounded-lg dark:bg-gray-700 p-6 pt-10 h-48">
                                                    <div className="overflow-x-scroll max-h-full">
                                                        <pre>
                                                            <code
                                                            id="code-block"
                                                            className="text-sm text-violet-300 whitespace-pre">
                                                                {temp.code}
                                                            </code>
                                                        </pre>
                                                    </div>

                                                    {/* Copy Button */}
                                                    <div className="absolute top-2 end-2 bg-gray-50 dark:bg-gray-700">
                                                    <button
                                                        onClick={() => handleCopy(temp.id, temp.code, 'view')}
                                                        className="text-gray-900 dark:text-gray-400 m-0.5 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg py-2 px-2.5 inline-flex items-center justify-center bg-white border-gray-200 border">
                                                        {temp.copied ? (
                                                            /* when copy button is clicked while user is viewing templates*/
                                                            <span className="inline-flex items-center">
                                                                <svg
                                                                    className="w-3 h-3 text-blue-700 dark:text-blue-500 me-1.5"
                                                                    fill="none"
                                                                    viewBox="0 0 16 12">
                                                                    <path
                                                                        stroke="currentColor"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M1 5.917 5.724 10.5 15 1.5"/>
                                                                </svg>
                                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-500">
                                                                    Copied
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            /* default state of copy button */
                                                            <span className="inline-flex items-center">
                                                                <svg
                                                                    className="w-3 h-3 me-1.5"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 18 20"
                                                                >
                                                                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                                                                </svg>
                                                                <span 
                                                                    className="text-xs font-semibold">
                                                                        Copy code
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>
                                                    </div>
                                                </div>
                                            </p>
                                            <p className="text-sm mt-2 text-gray-600">
                                                <strong>Tags:</strong>{' '}
                                                {temp.tags.map((tag: any) => tag.name).join(', ')}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* no results message */}
                        {action === "View Existing Templates" && viewTemplates.length === 0 && !viewError && (
                            <p className="text-gray-600 text-center mt-6">No templates saved.</p>
                        )}

                        {/* Search Saved Templates */}  
                        <form onSubmit={getSearchedTemplates} className="space-y-6">
                            {/* title search input */}
                            <input
                                id="title-bar"
                                type="text"
                                name="titleQuery"
                                placeholder="Search by title"
                                value={titleQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 invisible"
                            />
                            {/* explanation search input */}
                            <input
                                id="exp-bar"
                                type="text"
                                name="explanationQuery"
                                placeholder="Search by explanation"
                                value={explanationQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setExplanationQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 invisible"
                            />
                            {/* tag search input */}
                            <input
                                id="tag-bar"
                                type="text"
                                name="tagQuery"
                                placeholder="Search by tags"
                                value={tagQuery}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTagQuery(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 invisible"
                            />
                            <button 
                                id="search-button"
                                type="submit"
                                className="text-white block w-full p-4 ps-10 rounded-lg bg-blue-700 hover:bg-blue-800 invisible">
                                {"Search"}
                            </button> 

                            {searchError && (
                                <div className="text-red-500 text-center mt-4">
                                    <p>{searchError}</p>
                                    {(searchError === 'Unauthorized. Please log in or sign up.') && (
                                        <div className="flex space-x-4 justify-center mt-2">
                                            <button
                                                onClick={redirectToLogIn}
                                                className="text-blue-500 underline cursor-pointer"
                                            >
                                                Log in
                                            </button>
                                            <span>|</span>
                                            <button
                                                onClick={redirectToSignUp}
                                                className="text-blue-500 underline cursor-pointer"
                                            >
                                                Sign up
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>

                        {/* Show search results if any */}
                        {searchTemplates.length > 0 && (
                            <div className="w-full">
                                <h2 className="text-gray-600 text-xl font-semibold mb-4 text-center">Search Results</h2>
                                <ul className="space-y-4">
                                    {searchTemplates.map((temp) => (
                                        <li key={temp.id} className="p-4 border rounded-lg shadow-sm">
                                            <h3 className="text-black text-lg font-bold">{temp.title}</h3>
                                            <p className="text-sm text-gray-600">Template ID: {temp.id}</p>
                                            <p className="text-sm text-gray-600">{temp.explanation}</p>
                                            <p className="text-sm text-gray-600">

                                                {/* Code Block Container */}
                                                <div className="relative bg-gray-50 rounded-lg dark:bg-gray-700 p-6 pt-10 h-48">
                                                    <div className="overflow-x-scroll max-h-full">
                                                        <pre>
                                                            <code
                                                            id="code-block"
                                                            className="text-sm text-violet-300 whitespace-pre">
                                                                {temp.code}
                                                            </code>
                                                        </pre>
                                                    </div>

                                                    {/* Copy Button */}
                                                    <div className="absolute top-2 end-2 bg-gray-50 dark:bg-gray-700">
                                                    <button
                                                        onClick={() => handleCopy(temp.id, temp.code, 'search')}
                                                        className="text-gray-900 dark:text-gray-400 m-0.5 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg py-2 px-2.5 inline-flex items-center justify-center bg-white border-gray-200 border">
                                                        {temp.copied ? (
                                                            /* when copy button is clicked while user is searching templates*/
                                                            <span className="inline-flex items-center">
                                                                <svg
                                                                    className="w-3 h-3 text-blue-700 dark:text-blue-500 me-1.5"
                                                                    fill="none"
                                                                    viewBox="0 0 16 12">
                                                                    <path
                                                                        stroke="currentColor"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M1 5.917 5.724 10.5 15 1.5"/>
                                                                </svg>
                                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-500">
                                                                    Copied
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            /* default state of copy button */
                                                            <span className="inline-flex items-center">
                                                                <svg
                                                                    className="w-3 h-3 me-1.5"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 18 20"
                                                                >
                                                                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                                                                </svg>
                                                                <span 
                                                                    className="text-xs font-semibold">
                                                                        Copy code
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>
                                                    </div>
                                                </div>
                                                
                                            </p>
                                            <p className="text-sm mt-2 text-black">
                                                <strong>Tags:</strong>{' '}
                                                {temp.tags.map((tag: any) => tag.name).join(', ')}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* no results message */}
                        {action === "Search Saved Templates" && searchTemplates.length === 0 && !searchError && (titleQuery || explanationQuery || tagQuery) && (
                            <p className="text-gray-600 text-center mt-6">No results found for your search.</p>
                        )}

                    </div>
                </div>         
            </main>
        </>
    );

}


