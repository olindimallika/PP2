import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

// Define the form data type
interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar: string; // Stores the selected avatar path
    phoneNumber: string;
    role: string;
}

// Define the avatar type
interface Avatar {
    name: string;
    value: string;
}

const SignUpPage: React.FC = () => {
    const router = useRouter();

    // State to store form data
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        avatar: '',
        phoneNumber: '',
        role: 'user',
    });

    // State for showing success or error messages
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // List of avatars to choose from
    const avatars: Avatar[] = [
        { name: 'Avatar 1', value: '/avatars/avatar1.png' },
        { name: 'Avatar 2', value: '/avatars/avatar2.png' },
        { name: 'Avatar 3', value: '/avatars/avatar3.png' },
    ];

    // Update form data as the user types in the input fields
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle avatar selection when clicked
    const handleAvatarClick = (avatarValue: string) => {
        setFormData({ ...formData, avatar: avatarValue }); // Update the avatar value in form data
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent page reload
        try {
            // Send form data to the backend API
            const response = await fetch('/api/accounts/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // Handle non-OK responses
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred');
            }

            // On success, set the success message
            await response.json();
            setSuccess('Sign-up successful! Redirecting to log in...');
            setError(''); // Clear error messages

            //Redirect to the login page with the email prefilled
            const callbackUrl = router.query.callback as string;
            router.push(`/frontend/accounts/log-in?email=${formData.email}&callback=${callbackUrl || '/'}`);
        } catch (err: any) {
            // Set error message on failure
            setError(err.message || 'An error occurred');
            setSuccess('');
        }
    };

    // Prefill the email field if a callback URL provides an email query parameter
    useEffect(() => {
        const prefilledEmail = router.query.email as string;
        if (prefilledEmail) {
            setFormData((prev) => ({ ...prev, email: prefilledEmail }));
        }
    }, [router.query.email]);

    const redirectToLogIn = () => {
        const callbackUrl = router.query.callback as string;
        router.push(`/frontend/accounts/log-in?email=${formData.email}&callback=${callbackUrl || '/'}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black py-8">
            {/* Form Card */}
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md dark:bg-zinc-800 py-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Sign Up</h1>
                {/* Sign-Up Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name */}
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Last Name */}
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-40 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Email */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Password */}
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Phone Number */}
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    {/* Avatar Selection */}
                    <div>
                        <label className="block font-semibold mb-2 text-black dark:text-white">Select an Avatar:</label>
                        <div className="flex space-x-4">
                            {avatars.map((avatar) => (
                                <div
                                    key={avatar.value}
                                    className={`cursor-pointer p-2 rounded-lg border-2 ${
                                        formData.avatar === avatar.value ? 'border-blue-500' : 'border-gray-300'
                                    } hover:border-blue-400`}
                                    onClick={() => handleAvatarClick(avatar.value)}
                                >
                                    <img
                                        src={avatar.value}
                                        alt={avatar.name}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <p className="text-sm text-center mt-1 text-black dark:text-white">{avatar.name}</p>
                                </div>
                            ))}
                        </div>
                        {/* Selected Avatar */}
                        {formData.avatar && (
                            <p className="mt-2 text-sm text-green-600">Selected: {formData.avatar}</p>
                        )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600"
                    >
                        Sign Up
                    </button>
                    {/* Error Message */}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {/* Success Message */}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                </form>
                <div className="text-center mt-4">
                    <p>
                        Already have an account?{' '}
                        <span
                            onClick={redirectToLogIn}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            Log in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
