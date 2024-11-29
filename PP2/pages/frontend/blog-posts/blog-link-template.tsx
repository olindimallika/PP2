import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const BlogLinkTemplate: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Get the template ID from the query string

    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
            // Fetch the template when the component loads and the ID is available
            if (id) {
                const fetchTemplate = async () => {
                    try {
                        const response = await fetch(`/api/code-templates/get-template?id=${id}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || "Error fetching the template");
                        }

                        const templateData = await response.json();
                        setTemplate(templateData.template);
                    } catch (err: any) {
                        setError(err.message || "An error occurred while fetching the template.");
                    } finally {
                        setLoading(false);
                    }
                };
                fetchTemplate();
            }
    }, [id]);

    if (loading) {
        return <p className="text-center mt-4">Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center mt-4">{error}</p>;
    }

    if (!template) {
        return <p className="text-center mt-4">Template not found.</p>;
    }

    const handleModify = (id: number) => {
        window.location.href = `/frontend/code-templates/modify-template?id=${id}`;
    };

    const getRelatedPosts = async () => {

        if (loading) return; // prevent multiple requests
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/blog-posts/view-blog?templateId=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while getting the saved code templates.');
            }

            const data = await response.json();
            const mentionedTemplate = data.template;

            setPosts(mentionedTemplate.blogPosts || []);
            setError('');
    
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8 text-black dark:bg-zinc-800">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl dark:bg-black">
                <h1 className="text-2xl font-bold mb-4 dark:text-white">{template.title}</h1>
                <p className="text-gray-700 mb-6 dark:text-gray-300">{template.explanation}</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto dark:bg-zinc-800 dark:text-violet-300 text-violet-800">
                    <code>{template.code}</code>
                </pre>

                <div className="mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Tags:</strong> {template.tags.map((tag: any) => tag.name).join(", ")}
                    </p>
                </div>
                <button
                    onClick={() => handleModify(template.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                >
                    Modify
                </button>
                <button
                    onClick={getRelatedPosts}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Get blog posts mentioning this template
                </button>


                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {loading ? (
                    <p className="text-white text-center">Loading...</p>
                
                ) : ( 
                    <div className="rounded-lg p-4 w-full max-w-3xl mt-5 border border-dotted border-gray-400">
                        <h1 className="text-2xl text-center text-gray-400 mb-6">Related Blog Posts</h1>
                        <ul className="space-y-4">
                            {posts.map((post) => (
                                <li key={post.id} className="p-8 border rounded-lg shadow-sm">
                                    <h3 className="text-lg font-bold dark:text-white">{post.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Description: </strong> {post.description}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Tags:</strong> {post.tags.map((tag: any) => tag.name).join(', ') || 'No tags'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogLinkTemplate;
