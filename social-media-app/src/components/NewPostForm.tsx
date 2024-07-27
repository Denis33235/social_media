// NewPostForm.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';

interface NewPostFormProps {
  refreshPosts: () => void;
}

const NewPostForm: React.FunctionComponent<NewPostFormProps> = ({ refreshPosts }) => {
  const [image, setImage] = useState<string>('');
  const { userId } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with image:', image, 'and userId:', userId); // Debugging
    if (image.trim() && userId) {
      try {
        const response = await axios.post('http://localhost:3000/posts', {
          userId,
          pictureUrl: image,
          likes: 0,
          comments: []
        });
        console.log('Post added response:', response.data); // Debugging
        setImage('');
        refreshPosts(); // Refresh posts after adding a new one
      } catch (error) {
        console.error('Error adding post:', error.response ? error.response.data : error.message); // Improved error handling
      }
    } else {
      console.log('Image URL or userId is missing'); // Debugging
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
