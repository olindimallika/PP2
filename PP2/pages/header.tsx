import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth-context'; // Update the path to your AuthContext

type HeaderProps = {
   toggleDarkMode: () => void;
   darkMode: boolean;
};

const Header: React.FC<HeaderProps> = ({ toggleDarkMode, darkMode }) => {
    const { isLoggedIn, logout, user } = useAuth(); // Use `user` to check the role

    return (
        <header
            className="flex items-center p-5 bg-violet-100 text-black"
        >
            <h1 className="pe-5" style={{ fontSize: '1.5rem', margin: 0 }}>Scriptorium</h1>
            <button
                className="mr-96 dark:text-white dark:bg-violet-800 bg-violet-200 text-black px-5 rounded-full font-semibold border-2 dark:border-white border-black hover:scale-105 transition-all duration-300"
                onClick={toggleDarkMode}
            >
                Theme: {darkMode ? "Dark" : "Light"}
            </button> 
            
            <ul className="hidden md:flex items-center gap-4">
                <li>
                    <Link
                        className="ml-16 mr-8"
                        href="/"
                        style={{
                            color: 'black',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            padding: '5px 10px',
                            borderRadius: '5px',
                        }}
                    >
                        Home
                    </Link>
                </li>

                <li style={{ position: 'relative' }}>
                    <div
                        className="mr-6"
                        style={{
                            color: 'black',
                            fontSize: '1rem',
                            padding: '5px 10px',
                            cursor: 'pointer',
                        }}
                    >
                        Blog Posts
                    </div>

                    <ul className="dropdown-menu">
                        <li style={{ marginBottom: '10px' }}>
                            <Link href="/frontend/blog-posts/search-blog">Search Blog Posts</Link>
                        </li>

                        <li>
                            <Link href="/frontend/blog-posts/create-blog">Create Blog Post</Link>
                        </li>
                    </ul>
                </li>

                <li style={{ position: 'relative' }}>
                    <div
                        className="mr-6"
                        style={{
                            color: 'black',
                            fontSize: '1rem',
                            padding: '5px 10px',
                            cursor: 'pointer',
                        }}
                    >
                        Templates
                    </div>
                    <ul className="dropdown-menu">

                        <li style={{ marginBottom: '10px' }}>
                            <Link href="/frontend/code-templates/search-templates">Search All Templates</Link>
                        </li>

                        <li>
                            <Link href="/frontend/code-templates/create-template">Create Templates</Link>
                        </li>
                    </ul>
                </li>

                <li>
                    <Link href="/frontend/code-writing-and-execution/input">Code Execution</Link>
                </li>
                {isLoggedIn ? (
                    <li style={{ position: 'relative' }}>
                        <div
                            className="ml-10"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                cursor: 'pointer',
                            }}
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={`${user.firstName || 'User'}'s avatar`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'gray',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    U
                                </div>
                            )}
                        </div>
                        <ul className="dropdown-menu">
                            <li>
                                <Link href="/frontend/accounts/profile">Profile</Link>
                            </li>
                            <li>
                                <Link href="/frontend/blog-posts/manage-posts">Manage Posts</Link>
                            </li>
                            <li>
                                <Link href="/frontend/code-templates/manage-templates">
                                    Manage Templates
                                </Link>
                            </li>
                            <li>
                                <Link href="/frontend/code-templates/view-templates">
                                    View or Search Your Templates
                                </Link>
                            </li>

                            {/* Conditionally render "Manage Reports" based on user role */}
                            {user?.role === 'admin' && (
                                <li>
                                    <Link href="/frontend/icr/admin-sort">Manage Reports</Link>
                                </li>
                            )}
                            {/* Conditionally render "Manage Hidden Content" based on user role */}
                            {user?.role === 'admin' && (
                                <li>
                                    <Link href="/frontend/icr/unhide">Manage Hidden Content</Link>
                                </li>
                            )}

                            <li style={{ color: 'red', cursor: 'pointer' }} onClick={logout}>
                                Logout
                            </li>
                        </ul>
                    </li>
                ) : (
                    <li>
                        <Link
                            className="ml-4 flex px-8 text-white bg-violet-800 rounded-full font-semibold"
                            href="/frontend/accounts/log-in"
                        >
                            Log in
                        </Link>
                    </li>
                )}
            </ul>

            {/* For smaller screens */}
            <div className="group">
                <img 
                    id="hamburger-menu" 
                    src="/hamburger.png" 
                    alt="Menu" 
                    className="md:hidden w-20 h-10 cursor-pointer"
                />
                {/* Dropdown Menu */}
                <ul
                    className="absolute right-0 bg-white shadow-lg rounded-md hidden group-hover:block md:hidden"
                >
                    <li>
                        <Link
                            href="/"
                            className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md divide-solid"
                        >
                            Home
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/frontend/blog-posts/search-blog"
                            className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                        >
                            Search Blog Posts
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/frontend/blog-posts/create-blog"
                            className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                        >
                            Create Blog Post
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/frontend/code-templates/search-templates"
                            className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                        >
                            Search All Templates
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/frontend/code-templates/create-template"
                            className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                        >
                            Create Templates
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/frontend/code-writing-and-execution/input"
                            className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                        >
                            Code Execution
                        </Link>
                    </li>

                    {isLoggedIn ? (
                        <div>
                            <li>
                                <Link
                                    href="/frontend/accounts/profile"
                                    className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                                >
                                    Profile
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/frontend/blog-posts/manage-posts"
                                    className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                                    >
                                        Manage Posts
                                </Link>
                            </li>

                            {user?.role === "admin" && (
                                <li>
                                    <Link
                                        href="/frontend/icr/admin-sort"
                                        className="block px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                                    >
                                        Manage Reports
                                    </Link>
                                </li>
                            )}

                            <li
                                className="block px-4 py-2 text-red-600 hover:bg-gray-200 rounded-md cursor-pointer"
                                onClick={logout}
                            >
                                Logout
                            </li>
                        </div>
                    ) : (
                        <li>
                            <Link
                                href="/frontend/accounts/log-in"
                                className="flex px-8 py-2 text-white bg-violet-800 font-semibold"
                            >
                                Log in
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default Header;
