import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

interface NewPostFormProps {
  refreshPosts: () => void;
}

const NewPostForm: React.FunctionComponent<NewPostFormProps> = ({ refreshPosts }) => {
  const [image, setImage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (image.trim()) {
      try {
        await axios.post('http://localhost:3000/posts', {
          userId: 1, // Replace with actual user ID
          pictureUrl: image,
          likes: 0,
          comments: []
        });
        setImage('');
        refreshPosts(); // Refresh posts after adding a new one
      } catch (error) {
        console.error('Error adding post:', error);
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={image}
        onChange={handleImageChange}
        placeholder="Image URL"
      />
      <button type="submit">Add Post</button>
    </form>
  );
};

export default NewPostForm;
