// App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewPostForm from './components/NewPostForm';
import PostList from './components/PostList';
import { UserProvider } from './components/UserContext';

interface Post {
  id: number;
  pictureUrl: string;
  likes: number;
  comments: string[];
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); 

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
    <UserProvider>
  <div className="min-h-screen bg-gray-100 p-4">
    <div className="max-w-2xl mx-auto">
      <NewPostForm refreshPosts={fetchPosts} />
      <PostList posts={sortedPosts} refreshPosts={fetchPosts} />
    </div>
  </div>
</UserProvider>

  );
};

export default App;
