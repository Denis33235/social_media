import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import NewPostForm from './components/NewPostForm'; 
import PostList from './components/PostList';
import { UserProvider } from './components/UserContext';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/NavBar'; 
import UserSearch from './components/UserSearch';
import Profile from './components/Profile';

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

  const sortedPosts = [...posts].sort((a, b) => {
    return sortOrder === 'desc' ? b.likes - a.likes : a.likes - b.likes;
  });

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="max-w-2xl mx-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search-users" element={<UserSearch />} />
              <Route path="/" element={
                <>
                  <NewPostForm refreshPosts={fetchPosts} />
                  <PostList posts={sortedPosts} refreshPosts={fetchPosts} />
                </>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
