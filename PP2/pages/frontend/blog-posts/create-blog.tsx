import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

const CreateBlogForm: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        templateIds: '',
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [createdBlog, setCreatedBlog] = useState<any>(null); // Holds the created blog post data
    const router = useRouter();

    useEffect(() => {
        const savedFormData = localStorage.getItem('createBlogForm');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedFormData);
        localStorage.setItem('createBlogForm', JSON.stringify(updatedFormData));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const { title, description, tags, templateIds } = formData;

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        const templateIdsArray = templateIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

        if (!title || !description) {
            setError('Title and description are required.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Must be logged in or sign up to create a blog post.');
            setLoading(false);
            return;
        }

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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred while creating the blog post.');
            }

            const responseData = await response.json();
            setSuccess('Blog post created successfully.');
            setCreatedBlog(responseData.blogPost); // Save the created blog post data
            setError('');
            localStorage.removeItem('createBlogForm');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const redirectToLogIn = () => {
        localStorage.setItem('createBlogForm', JSON.stringify(formData));
        router.push(`/log-in?callback=/create-blog`);
    };

    const redirectToSignUp = () => {
        localStorage.setItem('createBlogForm', JSON.stringify(formData));
        router.push(`/sign-up?callback=/create-blog`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
            {/* Form Container */}
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center mb-6">Create a Blog Post</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* Description Input */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    ></textarea>
                    {/* Tags Input */}
                    <input
                        type="text"
                        name="tags"
                        placeholder="Tags (comma-separated)"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* Template IDs Input */}
                    <input
                        type="text"
                        name="templateIds"
                        placeholder="Template IDs (comma-separated)"
                        value={formData.templateIds}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Creating...' : 'Create Blog'}
                    </button>
                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 text-center mt-4">
                            <p>{error}</p>
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
                    {/* Success Message */}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                </form>
            </div>

            {/* show created Blog Post below */}
            {createdBlog && (
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-2">{createdBlog.title}</h2>
                    <p><strong>Description:</strong> {createdBlog.description}</p>
                    <p><strong>Tags:</strong> {createdBlog.tags.map((tag: any) => tag.name).join(', ')}</p>
                    <p>
                        <strong>Templates:</strong>
                        {createdBlog.templates.map((template: any) => (
                            //DONT USE A TAGS !! REPLACE WITH HREF
                            <a
                                key={template.id}
                                href={`/template/${template.id}`}
                                className="text-blue-500 underline ml-2"
                            >
                                {template.title}
                            </a>
                        ))}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreateBlogForm;
