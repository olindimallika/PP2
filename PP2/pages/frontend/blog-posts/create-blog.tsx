//with dark mode
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

// This component creates a form for creating a blog post
const CreateBlogForm: React.FC = () => {
    // Structure for the form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        templateIds: '',
    });

    // State to handle errors, success messages, loading status, and created blog data
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [createdBlog, setCreatedBlog] = useState<any>(null);

    const router = useRouter();

    // Load saved form data from localStorage
    useEffect(() => {
        const savedFormData = localStorage.getItem('createBlogForm');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    // For handling updates to form inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedFormData);

        // Save the updated form data to localStorage so it can be restored later
        localStorage.setItem('createBlogForm', JSON.stringify(updatedFormData));
    };

    // Handles the form submission process
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent the page from refreshing
        setLoading(true); // Show the "loading" state

        // Destructure form fields for easy access
        const { title, description, tags, templateIds } = formData;

        // Process tags and templateIds into arrays
        const tagsArray = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
        const templateIdsArray = templateIds
            .split(',')
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));

        // Check for required fields and show an error if they're missing
        if (!title || !description) {
            setError('Title and description are required.');
            setLoading(false);
            return;
        }

        // Check if the user is logged in by verifying the presence of an access token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Must be logged in or sign up to create a blog post.');
            setLoading(false);
            return;
        }

        // Make an API request to create the blog post
        try {
            const response = await fetch('/api/blog-posts/create-blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: 'create',
                    title,
                    description,
                    tags: tagsArray,
                    templateIds: templateIdsArray,
                }),
            });

            // Handle unsuccessful responses
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while creating the blog post.');
            }

            // Handle successful responses
            const responseData = await response.json();
            setSuccess('Blog post created successfully.');
            setCreatedBlog(responseData.blogPost); // Save the blog data
            setError(''); // Clear any existing errors
            localStorage.removeItem('createBlogForm'); // Clear saved form data
        } catch (err: any) {
            setError(err.message || 'An error occurred'); // Handle errors
        } finally {
            setLoading(false); // Hide the "loading" state
        }
    };

    // Redirect user to log in and save form data before navigating
    const redirectToLogIn = () => {
        localStorage.setItem('createBlogForm', JSON.stringify(formData));
        router.push(`/frontend/accounts/log-in?callback=/frontend/blog-posts/create-blog`);
    };

    // Redirect user to sign up and save form data before navigating
    const redirectToSignUp = () => {
        localStorage.setItem('createBlogForm', JSON.stringify(formData));
        router.push(`/frontend/accounts/sign-up?callback=/frontend/blog-posts/create-blog`);
    };

    // Programmatically navigate to the template page
    const navigateToTemplate = (templateId: number) => {
        router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-800 py-8">
            {/* Main form container */}
            <div className="bg-white shadow-lg dark:bg-zinc-900 rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Create a Blog Post</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input for title */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400  dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Input for description */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border text-black dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white"
                    ></textarea>
                    {/* Input for tags */}
                    <input
                        type="text"
                        name="tags"
                        placeholder="Tags (comma-separated)"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full p-3 border text-black dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Input for template IDs */}
                    <input
                        type="text"
                        name="templateIds"
                        placeholder="Template IDs (comma-separated)"
                        value={formData.templateIds}
                        onChange={handleChange}
                        className="w-full p-3 border text-black dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Creating...' : 'Create Blog'}
                    </button>
                    {/* Error message */}
                    {error && (
                        <div className="text-red-500 text-center mt-4">
                            <p>{error}</p>
                            {/* Provide login/signup links if error relates to authentication */}
                            {error === 'Must be logged in or sign up to create a blog post.' && (
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
                    {/* Success message */}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                </form>
            </div>

            {/* Display created blog post if available */}
            {createdBlog && (
                <div className="bg-white shadow-lg rounded-lg  dark:bg-zinc-900 p-8 w-full max-w-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-2 text-black dark:text-white">{createdBlog.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong>Description:</strong> {createdBlog.description}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong>Tags:</strong> {createdBlog.tags.map((tag: any) => tag.name).join(', ')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong>Templates:</strong>
                        {createdBlog.templates.map((template: any) => (
                            <span
                                key={template.id}
                                onClick={() => navigateToTemplate(template.id)}
                                className="text-blue-500 underline ml-2 cursor-pointer"
                            >
                                {template.title}
                            </span>
                        ))}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreateBlogForm;

