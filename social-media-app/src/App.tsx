import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewPostForm from './components/NewPostForm';
import PostList from './components/PostList';
import Register from './components/Register';
import Login from './components/Login';

interface Post {
  id: number;
  pictureUrl: string;
  likes: number;
  comments: string[];
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 'asc' for ascending, 'desc' for descending

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const sortedPosts = [...posts].sort((a, b) => {
    return sortOrder === 'desc' ? b.likes - a.likes : a.likes - b.likes;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <NewPostForm refreshPosts={fetchPosts} />
        <button
          onClick={handleSortToggle}
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {sortOrder === 'desc' ? 'Sort by Least Liked' : 'Sort by Most Liked'}
        </button>
        <PostList posts={sortedPosts} refreshPosts={fetchPosts} />
       
      </div>
    </div>
  );
};

export default App;
