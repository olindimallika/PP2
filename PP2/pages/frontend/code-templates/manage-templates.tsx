import React, { useEffect, useState } from 'react';

const ManageTemplates: React.FC = () => {
    const templates = []; // array of all templates created
    const [templateStates, setTemplateStates] = useState(  // array of templates with an extra parameter "copied" for if the user copies the template
        templates.map((temp) => ({ ...temp, copied: false }))
    );
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTemplates = async () => {
        setLoading(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Unauthorized. Please log in.');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/code-templates/search-saved?userId=${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch templates.');
            }

            const data = await response.json();
            setTemplateStates(data.savedTemplates || []);

        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching templates.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = confirm('Are you sure you want to delete this template?');
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Unauthorized. Please log in.');
                return;
            }

            const response = await fetch(`/api/code-templates/edit-template?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete template.');
            }

            alert('Template deleted successfully.');
            fetchTemplates(); 
        } catch (err: any) {
            setError(err.message || 'An error occurred while deleting the template.');
        }
    };

    const handleEdit = (id: number) => {
        window.location.href = `/frontend/code-templates/edit-templates?id=${id}`;
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // for copying code to user's clipboard
    const handleCopy = (id: number, code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setTemplateStates((prevStates) =>
                prevStates.map((temp) =>
                    temp.id === id ? { ...temp, copied: true } : { ...temp, copied: false }
                )
            );
    
            // Reset the "copied" state after a short delay
            setTimeout(() => {
                setTemplateStates((prevStates) =>
                    prevStates.map((temp) =>
                        temp.id === id ? { ...temp, copied: false } : temp
                    )
                );
            }, 2000);
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
                <h1 className="text-2xl font-bold text-center mb-6 text-black">Manage Templates</h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {loading ? (
                    <p className="text-gray-600 text-center">Loading...</p>
                ) : templateStates.length > 0 ? (
                    
                    <ul className="space-y-4">
                        {templateStates.map((temp) => (
                            <li key={temp.id} className="p-4 border rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold text-black">{temp.title}</h3>
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
                                            onClick={() => handleCopy(temp.id, temp.code)}
                                            className="text-gray-900 dark:text-gray-400 m-0.5 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg py-2 px-2.5 inline-flex items-center justify-center bg-white border-gray-200 border">
                                            {temp.copied ? (
                                                /* when copy button is clicked */
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

                                <div className="mt-4 flex space-x-4">
                                    <button
                                        onClick={() => handleEdit(temp.id)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(temp.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 text-center">No templates found.</p>
                )}
            </div>
        </div>
    );
};

export default ManageTemplates;
