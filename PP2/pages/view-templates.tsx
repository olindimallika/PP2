import React from "react";
import Head from "next/head";
import { useRouter } from 'next/router';

export default function SearchSavedTemplates() {
    const [query, setQuery] = React.useState("");
    const [viewError, setViewError] = React.useState("");
    const [viewSuccess, setViewSuccess] = React.useState("");
    const [searchError, setSearchError] = React.useState("");
    const [searchSuccess, setSearchSuccess] = React.useState("");
    const [action, setAction] = React.useState("Options");
    const options = ["Options", "View Existing Templates", "Search Saved Templates"];
    const router = useRouter();

    const handleSubmitView = async () => {
        const id = localStorage.getItem('userId'); 
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setViewError('Must be logged in or sign up to view a code template.');
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
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const formatTemplates = (templates) => {
                return templates.map(template => {
                    const tags = template.tags.map(tag => tag.name).join(", ");
                    return `Title: ${template.title}\nExplanation: ${template.explanation}\nCode: ${template.code}\nTags: ${tags}\n`; 
                }).join("\n");
            };

            setViewSuccess(formatTemplates(data.savedTemplates));
            setViewError('');
    
        } catch (err: any) {
            setViewError(err.message || 'An error occurred');
        } 
    };

    const handleSubmitSearch = async () => {
        const id = localStorage.getItem('userId'); 
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setSearchError('Must be logged in or sign up to search a code template.');
            return;
        }

        try {
            const response = await fetch(`/api/code-templates/search-saved?userId=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    query: query
                })
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while getting the saved code templates.');
            }

            const data = await response.json();

            const formatTemplates = (templates) => {
                return templates.map(template => {
                    const tags = template.tags.map(tag => tag.name).join(", ");
                    const tID = localStorage.getItem('templateId');
                    return `ID: ${tID}\nTitle: ${template.title}\nExplanation: ${template.explanation}\nCode: ${template.code}\nTags: ${tags}\n`; 
                }).join("\n");
            };

            setSearchSuccess(formatTemplates(data.savedTemplates));
            setSearchError('');
        
        } catch (err: any) {
            setSearchError(err.message || 'An error occurred');
        } 
    };

    const getSavedTemplates = () => {
        handleSubmitView();
    };

    const getSearchedTemplates = () => {
        handleSubmitSearch();
    };

    const redirectToLogIn = () => {
        router.push(`/log-in?callback=/view-templates`);
    };

    const redirectToSignUp = () => {
        router.push(`/sign-up?callback=/view-templates`);
    };

    // clear output
    const resetOutput = () => { 
        setViewSuccess("");
        setViewError("");
        setSearchSuccess("");
        setSearchError("");
    }

    // when a new option is selected from the dropdown
    const handleChange = (event) => {
        setAction(event.target.value);
        resetOutput();

        // make search bar and button invisible when new option is selected
        document.getElementById("search-bar").classList.add("invisible");
        document.getElementById("search-button").classList.add("invisible");

        if (event.target.value === "View Existing Templates") {
            getSavedTemplates();
        } else if (event.target.value === "Search Saved Templates") {
            document.getElementById("search-bar").classList.remove("invisible");
            document.getElementById("search-button").classList.remove("invisible");
        }
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
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
                    <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-8 w-full max-w-lg whitespace-pre-line gap-y-1.5">
                        <h1 className="text-2xl font-bold text-center mb-6 text-gray-500">Manage Saved Templates</h1>

                        <select 
                            id="manage" 
                            className="h-10 md:h-16 text-white bg-blue-700 hover:bg-blue-800 rounded-lg" 
                            value={action} 
                            onChange={handleChange}>

                            {options.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>

                        {/* View Saved Templates */}
                        {viewError && (
                            <div className="text-red-500 text-center mt-4">
                                <p>{viewError}</p>
                                {(viewError === 'Must be logged in or sign up to view a code template.') && (
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
                        {/* Show saved templates */}
                        {viewSuccess && <p className="text-black">{viewSuccess}</p>}

                        {/* Search Saved Templates */}
                        <input type="search" 
                                id="search-bar" 
                                className="block w-full p-4 ps-10 text-sm text-gray-900 rounded-lg dark:bg-gray-700 dark:text-white invisible" 
                                placeholder="Search Saved Templates..." 
                                required 
                                onChange={(e) => setQuery(e.target.value)}/>
                            <button 
                                id="search-button"
                                className="block w-full p-4 ps-10 rounded-lg bg-blue-700 hover:bg-blue-800 invisible" 
                                onClick={() => getSearchedTemplates()}>
                                {"Search"}
                            </button>
                            {searchError && (
                            <div className="text-red-500 text-center mt-4">
                                <p>{searchError}</p>
                                {(searchError === 'Must be logged in or sign up to view a code template.') && (
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
                        {/* Show search results */}
                        {searchSuccess && <p className="text-black">{searchSuccess}</p>}
                    </div>
                </div>
            </main>
        </>
    );

}


