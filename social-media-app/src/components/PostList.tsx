import React from 'react';
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

const PostList: React.FunctionComponent<PostListProps> = ({ posts, refreshPosts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} post={post} refreshPosts={refreshPosts} />
      ))}
    </div>
  );
};

export default PostList;
