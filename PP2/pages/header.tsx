// import React from 'react';
// import Link from 'next/link';
// import { useAuth } from '../auth-context'; // Update the path to your AuthContext

// type HeaderProps = {
//     toggleDarkMode: () => void;
//     darkMode: boolean;
// };


// const Header: React.FC<HeaderProps> = ({ toggleDarkMode, darkMode }) => {
//   const { isLoggedIn, logout,  } = useAuth(); // Use `user` to check the role

//   return (
//     <header
//       style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: '25px 20px',
//         backgroundColor: 'lavender',
//         color: '#fff',
//       }}
//     >
//       <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Scriptorium</h1>

//       <nav>
//         <ul
//           style={{
//             display: 'flex',
//             listStyle: 'none',
//             margin: 0,
//             padding: 0,
//             gap: '15px',
//           }}
//         >

// <li>
//             <button 
//                 className="dark:bg-white dark:text-black bg-black text-white px-5 rounded-full font-semibold border-2 border-black hover:scale-105 transition-all duration-300"
//                 onClick={toggleDarkMode}
//             >
//                 Theme: {darkMode ? "Dark" : "Light"}
//             </button>
//           </li>  


//           <li>
//             <Link
//               href="/"
//               style={{
//                 color: 'black',
//                 textDecoration: 'none',
//                 fontSize: '1rem',
//                 padding: '5px 10px',
//                 borderRadius: '5px',
//               }}
//             >
//               Home
//             </Link>
//           </li>
//           <li style={{ position: 'relative' }}>
//             <div
//               style={{
//                 color: 'black',
//                 fontSize: '1rem',
//                 padding: '5px 10px',
//                 cursor: 'pointer',
//               }}
//             >
//               Blog Posts
//             </div>
//             <ul className="dropdown-menu">
//               <li style={{ marginBottom: '10px' }}>
//                 <Link href="/frontend/blog-posts/search-blog">Search Blog Posts</Link>
//               </li>
//               <li>
//                 <Link href="/frontend/blog-posts/create-blog">Create Blog Post</Link>
//               </li>
//             </ul>
//           </li>

//           <li style={{ position: 'relative' }}>
//             <div
//               style={{
//                 color: 'black',
//                 fontSize: '1rem',
//                 padding: '5px 10px',
//                 cursor: 'pointer',
//               }}
//             >
//               Templates
//             </div>
//             <ul className="dropdown-menu">
//               <li style={{ marginBottom: '10px' }}>
//                 <Link href="/frontend/code-templates/search-templates">Search All Templates</Link>
//               </li>
//               <li>
//                 <Link href="/frontend/code-templates/create-template">Create Templates</Link>
//               </li>
//             </ul>
//           </li>



         
//           <li>
//             <Link href="/frontend/code-writing-and-execution/input">Code Execution</Link>
//           </li>
//           <li>
//             <Link href="/about">About</Link>
//           </li>
//           {isLoggedIn ? (
//             <li style={{ position: 'relative' }}>
//               <div
//                 style={{
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '50%',
//                   overflow: 'hidden',
//                   cursor: 'pointer',
//                 }}
//               >
//                 {user?.avatar ? (
//                   <img
//                     src={user.avatar}
//                     alt={`${user.firstName || 'User'}'s avatar`}
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover',
//                     }}
//                   />
//                 ) : (
//                   <div
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       backgroundColor: 'gray',
//                       display: 'flex',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       color: 'white',
//                       fontSize: '1.5rem',
//                       fontWeight: 'bold',
//                     }}
//                   >
//                     U
//                   </div>
//                 )}
//               </div>
//               <ul className="dropdown-menu">
//                 <li>
//                   <Link href="/frontend/accounts/profile">Profile</Link>
//                 </li>
//                 <li>
//                   <Link href="/frontend/blog-posts/manage-posts">Manage Posts</Link>
//                 </li>
//                 <li>
//                   <Link href="/frontend/code-templates/manage-templates">
//                     Manage Templates
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/frontend/code-templates/view-templates">
//                     View or Search Your Templates
//                   </Link>
//                 </li>

//                 {/* Conditionally render "Manage Reports" based on user role */}
//                 {user?.role === 'admin' && (
//                   <li>
//                     <Link href="/frontend/icr/admin-sort">Manage Reports</Link>
//                   </li>
//                 )}
//                 {/* Conditionally render "Manage Hidden Content" based on user role */}
//                 {user?.role === 'admin' && (
//                   <li>
//                     <Link href="/frontend/icr/unhide">Manage Hidden Content</Link>
//                   </li>
//                 )}

//                 <li style={{ color: 'red', cursor: 'pointer' }} onClick={logout}>
//                   Logout
//                 </li>
//               </ul>
//             </li>
//           ) : (
//             <li>
//               <Link
//                 href="/frontend/accounts/log-in"
//                 style={{
//                   color: 'white',
//                   textDecoration: 'none',
//                   padding: '5px 20px',
//                   backgroundColor: 'black',
//                   borderRadius: '5px',
//                   display: 'inline-block',
//                 }}
//               >
//                 Log in
//               </Link>
//             </li>
//           )}
//         </ul>
//       </nav>
//     </header>
//   );
// };

// export default Header;
