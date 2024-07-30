import React, { useState } from 'react';
import Post from './Post';

interface PostListProps {
  posts: {
    id: number;
    pictureUrl: string;
    likes: number;
    comments: string[];
  }[];
  refreshPosts: () => void;
}

const PostList: React.FunctionComponent<PostListProps> = ({ posts = [], refreshPosts }) => {
  const [sortedByLikes, setSortedByLikes] = useState<boolean>(false);

  const handleSortByLikes = () => {
    setSortedByLikes(prev => !prev);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    return sortedByLikes ? a.likes - b.likes : b.likes - a.likes;
  });

  return (
    <div className="space-y-4">
      <button
        onClick={handleSortByLikes}
        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Sort by Likes {sortedByLikes ? 'Ascending' : 'Descending'}
      </button>
      {sortedPosts.map((post) => (
        <Post key={post.id} post={post} refreshPosts={refreshPosts} />
      ))}
    </div>
  );
};

export default PostList;
