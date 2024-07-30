// NewPostForm.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';

interface NewPostFormProps {
  refreshPosts: () => void;
}

const NewPostForm: React.FunctionComponent<NewPostFormProps> = ({ refreshPosts }) => {
  const [pictureUrl, setPictureUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { userId, token } = useUser(); // Include token

 // NewPostForm.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!userId) {
    setError('You must be logged in to add a post.');
    return;
  }

  if (!pictureUrl) {
    setError('Please enter a picture URL');
    return;
  }

  const payload = {
    pictureUrl,
    likes: 0,
  };

  try {
    const response = await axios.post('http://localhost:3000/posts', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include JWT token here
      },
      withCredentials: true, // Ensure credentials are sent with the request
    });

    if (response.status === 201) {
      refreshPosts();
      setPictureUrl(''); // Clear the input field
      setError(''); // Clear any previous error
    } else {
      setError('Failed to upload post');
    }
  } catch (error) {
    console.error('Error uploading post', error);
    setError('An error occurred. Please try again.');
  }
};


  if (!userId) {
    return <p>Please log in to add a post.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="pictureUrl">Picture URL:</label>
        <input
          type="text"
          id="pictureUrl"
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)}
          placeholder="Enter picture URL from Lorem Picsum"
        />
      </div>
      <button type="submit">Add Post</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default NewPostForm;
