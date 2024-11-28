import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // import jwt-decode to decode the token and extract the user ID

interface DecodedToken {
  userId: number; // define the structure of the decoded token, which includes the userId
}

interface Avatar {
  name: string; // name of the avatar
  value: string; // URL or path of the avatar image
}

const Profile: React.FC = () => {
  // initialize the state for profile details
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    phoneNumber: '',
  });

  // initialize the state for success and error messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // list of available avatars for selection
  const avatars: Avatar[] = [
    { name: 'Avatar 1', value: '/avatars/avatar1.png' },
    { name: 'Avatar 2', value: '/avatars/avatar2.png' },
    { name: 'Avatar 3', value: '/avatars/avatar3.png' },
  ];

  // function to extract the user ID from the token stored in localStorage
  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem('accessToken'); // retrieve the token from localStorage
      if (!token) {
        setError('Unauthorized. Please log in.'); // set error if token is missing
        return null;
      }

      // decode the token and return the userId
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error); // log errors in case decoding fails
      setError('Invalid token. Please log in again.');
      return null;
    }
  };

  // function to fetch the profile data of the logged-in user
  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken'); // retrieve the token from localStorage
    if (!token) {
      setError('Unauthorized. Please log in.'); // set error if token is missing
      return;
    }

    try {
      // make an API request to fetch the profile data
      const response = await fetch(`/api/accounts/fetch-user`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data.'); // throw error if the request fails
      }

      const data = await response.json(); // parse the response data
      // update the profile state with the fetched data
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        avatar: data.avatar || '',
        phoneNumber: data.phoneNumber || '',
      });
    } catch (error) {
      console.error(error); // log errors in case the request fails
      setError('Unable to fetch profile data.');
    }
  };

  // fetch the profile data when the component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  // handle input changes for text fields in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // update the corresponding field in the profile state
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  // handle avatar selection by updating the avatar field in the profile state
  const handleAvatarClick = (avatarValue: string) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      avatar: avatarValue,
    }));
  };

  // handle form submission to save the updated profile data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent default form submission behavior
    setMessage(''); // clear any previous success messages
    setError(''); // clear any previous error messages

    const userId = getUserIdFromToken(); // get the userId from the token
    if (!userId) return; // exit if userId is not available

    try {
      const token = localStorage.getItem('accessToken'); // retrieve the token from localStorage
      // make an API request to update the profile data
      const response = await fetch(`/api/accounts/edit?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile), // send the updated profile data in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.'); // throw error if the request fails
      }

      const data = await response.json(); // parse the response data
      setMessage('Profile updated successfully!'); // set success message
      setProfile(data.user); // update the profile state with the latest data
    } catch (error: any) {
      console.error(error); // log errors in case the request fails
      setError(error.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-800 p-4">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Edit Profile</h1>

      {/* display error message if any */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {/* display success message if any */}
      {message && <p className="text-green-500 mb-4">{message}</p>}

      {/* profile form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md dark:bg-black">
        {/* input field for first name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-white">First Name</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleInputChange}
            className="dark:border-gray-600 dark:bg-zinc-700 dark:text-white text-black w-full border rounded px-3 py-2"
          />
        </div>
        {/* input field for last name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-white">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleInputChange}
            className="dark:border-gray-600 dark:bg-zinc-700 dark:text-white text-black w-full border rounded px-3 py-2"
          />
        </div>
        {/* input field for email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-white">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            className="dark:border-gray-600 dark:bg-zinc-700 dark:text-white text-black w-full border rounded px-3 py-2"
          />
        </div>
        {/* input field for phone number */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-white">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleInputChange}
            className="dark:border-gray-600 dark:bg-zinc-700 dark:text-white text-black w-full border rounded px-3 py-2"
          />
        </div>
        {/* avatar selection */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-white mb-2">Select an Avatar</label>
          <div className="flex space-x-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.value}
                className={`cursor-pointer p-2 rounded-lg border-2 ${
                  profile.avatar === avatar.value ? 'border-blue-500' : 'border-gray-300'
                } hover:border-blue-400`}
                onClick={() => handleAvatarClick(avatar.value)}
              >
                <img src={avatar.value} alt={avatar.name} className="w-16 h-16 rounded-full" />
                <p className="text-sm text-center mt-1">{avatar.name}</p>
              </div>
            ))}
          </div>
          {/* display the selected avatar */}
          {profile.avatar && <p className="mt-2 text-sm text-green-600">Selected: {profile.avatar}</p>}
        </div>
        {/* submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
