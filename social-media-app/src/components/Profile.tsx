import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';

const Profile: React.FC = () => {
  const { userId } = useUser();
  const [profile, setProfile] = useState<{ email: string; username: string } | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; email: string }[]>([]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${userId}`, { withCredentials: true });
      setProfile(response.data);
      setUsername(response.data.username);
      setEmail(response.data.email);
    } catch (err) {
      setError('Failed to fetch profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await axios.put(`http://localhost:3000/users/${userId}`, { username, email });
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await axios.get(`http://localhost:3000/search-users?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to search users.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>No profile found.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleUpdateProfile} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Update Profile
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Search Users</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            placeholder="Search by email..."
          />
          <button
            onClick={handleSearch}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <ul className="list-disc pl-5">
            {searchResults.map(user => (
              <li key={user.id} className="mb-2">
                <span className="font-semibold">{user.email}</span>
              </li>
            ))}
          </ul>
        )}
        {searchResults.length === 0 && searchQuery && (
          <div>No users found.</div>
        )}
      </div>
    </div>
  );
};

export default Profile;