import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../auth-context'; // Update this path to where AuthContext is located

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const { login } = useAuth(); // Use the login function from AuthContext

    // Prefill email field from query parameter
    useEffect(() => {
        const prefilledEmail = router.query.email as string;
        if (prefilledEmail) {
            setFormData((prev) => ({ ...prev, email: prefilledEmail }));
        }
    }, [router.query.email]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/accounts/log-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const responseData = await response.json();

            // Save the access token in localStorage
            localStorage.setItem('accessToken', responseData.accessToken);
            localStorage.setItem('userId', JSON.stringify(responseData.userId)); // for searching and viewing a user's saved templates
            localStorage.setItem('role', responseData.role); // for checking if user is an admin

            // Update the global authentication state by passing the accessToken
            login(responseData.accessToken);

            setLoading(false);
            setError('');

            // Redirect to the callback URL or clear it and go to home page
            const callbackUrl = router.query.callback as string;
            router.replace(callbackUrl || '/'); // Use replace to clear the history stack
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
        }
    };

    const redirectToSignUp = () => {
        const callbackUrl = router.query.callback as string;
        router.push(`/frontend/accounts/sign-up?email=${formData.email}&callback=${callbackUrl || '/'}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md dark:bg-zinc-900">
                <h1 className="text-2xl font-bold text-center mb-6 text-black dark:text-white">Log In</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black dark:border-gray-600 dark:bg-zinc-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
                <div className="text-center mt-4 text-black dark:text-white">
                    <p>
                        Don&apos;t have an account?{' '}
                        <span
                            onClick={redirectToSignUp}
                            className="text-blue-500 underline cursor-pointer"
                        >
                            Sign up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;