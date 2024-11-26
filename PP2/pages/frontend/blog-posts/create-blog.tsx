import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

// this component creates a form for creating a blog post
const CreateBlogForm: React.FC = () => {
    // structure for the form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        templateIds: '',
    });

    // state to handle errors, success messages, loading status, and created blog data
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [createdBlog, setCreatedBlog] = useState<any>(null);

    const router = useRouter();

    // load saved form data from localStorage
    useEffect(() => {
        const savedFormData = localStorage.getItem('createBlogForm');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    // for handling updates to form inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedFormData);

        // save the updated form data to localStorage so it can be restored later
        localStorage.setItem('createBlogForm', JSON.stringify(updatedFormData));
    };

    // handles the form submission process
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // prevent the page from refreshing
        setLoading(true); // show the "loading" state

        // destructure form fields for easy access
        const { title, description, tags, templateIds } = formData;

        // process tags and templateIds into arrays
        const tagsArray = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
        const templateIdsArray = templateIds
            .split(',')
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));

        // check for required fields and show an error if they're missing
        if (!title || !description) {
            setError('Title and description are required.');
            setLoading(false);
            return;
        }

        // check if the user is logged in by verifying the presence of an access token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Must be logged in or sign up to create a blog post.');
            setLoading(false);
            return;
        }

        // make an API request to create the blog post
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

            // handle unsuccessful responses
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while creating the blog post.');
            }

            // handle successful responses
            const responseData = await response.json();
            setSuccess('Blog post created successfully.');
            setCreatedBlog(responseData.blogPost); // save the blog data
            setError(''); // clear any existing errors
            localStorage.removeItem('createBlogForm'); // clear saved form data
        } catch (err: any) {
            setError(err.message || 'An error occurred'); // handle errors
        } finally {
            setLoading(false); // hide the "loading" state
        }
    };

    // redirect user to log in and save form data before navigating
    const redirectToLogIn = () => {
        localStorage.setItem('createBlogForm', JSON.stringify(formData));
        router.push(`/frontend/accounts/log-in?callback=/create-blog`);
    };

    // redirect user to sign up and save form data before navigating
    const redirectToSignUp = () => {
        localStorage.setItem('createBlogForm', JSON.stringify(formData));
        router.push(`/frontend/accounts/sign-up?callback=/create-blog`);
    };

    // programmatically navigate to the template page
    const navigateToTemplate = (templateId: number) => {
        router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            {/* main form container */}
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center mb-6">Create a Blog Post</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* input for title */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* input for description */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    ></textarea>
                    {/* input for tags */}
                    <input
                        type="text"
                        name="tags"
                        placeholder="Tags (comma-separated)"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* input for template IDs */}
                    <input
                        type="text"
                        name="templateIds"
                        placeholder="Template IDs (comma-separated)"
                        value={formData.templateIds}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Creating...' : 'Create Blog'}
                    </button>
                    {/* error message */}
                    {error && (
                        <div className="text-red-500 text-center mt-4">
                            <p>{error}</p>
                            {/* provide login/signup links if error relates to authentication */}
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
                    {/* success message */}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                </form>
            </div>

            {/* display created blog post if available */}
            {createdBlog && (
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-2">{createdBlog.title}</h2>
                    <p>
                        <strong>Description:</strong> {createdBlog.description}
                    </p>
                    <p>
                        <strong>Tags:</strong> {createdBlog.tags.map((tag: any) => tag.name).join(', ')}
                    </p>
                    <p>
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
