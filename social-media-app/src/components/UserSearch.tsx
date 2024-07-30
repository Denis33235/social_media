import React, { useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
}

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/search-users', { params: { query } });
        setUsers(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="flex flex-col mb-4">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for users by email"
          className="border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-slate-500 hover:bg-slate-400 text-white font-bold py-2 px-4 rounded"
        >
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}

      <ul>
        {users.map(user => (
          <li key={user.id} className="border-b border-gray-300 py-2">
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
