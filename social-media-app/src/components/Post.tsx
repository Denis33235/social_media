import React, { useState } from 'react';
import axios from 'axios';

interface PostProps {
  post: {
    id: number;
    pictureUrl: string;
    likes: number;
    comments: string[];
  };
  refreshPosts: () => void;
}

const Post: React.FC<PostProps> = ({ post, refreshPosts }) => {
  const [comment, setComment] = useState('');

  const handleLike = async () => {
    try {
      await axios.post(`http://localhost:3000/posts/${post.id}/like`, {}, { withCredentials: true });
      refreshPosts();
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      try {
        await axios.post(`http://localhost:3000/posts/${post.id}/comment`, { text: comment }, { withCredentials: true });
        setComment('');
        refreshPosts();
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/posts/${post.id}`, { withCredentials: true });
      refreshPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
      <img src={post.pictureUrl} alt="Post" className="w-full h-64 object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-700 text-lg font-semibold">Likes: {post.likes}</p>
          <button
            onClick={handleLike}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
          >
            Like
          </button>
        </div>
        <div className="mb-4">
          {post.comments.map((comment, index) => (
            <p key={index} className="text-gray-600 mb-1">{comment}</p>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="flex flex-col">
          <input
            type="text"
            value={comment}
            onChange={handleCommentChange}
            placeholder="Add a comment"
            className="border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded mb-2"
          >
            Add Comment
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red hover:bg-orange-600 text-white font-bold py-1 px-3 rounded"
          >
            Delete Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default Post;
