import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';

interface NewPostFormProps {
  refreshPosts: () => void;
}

const NewPostForm: React.FunctionComponent<NewPostFormProps> = ({ refreshPosts }) => {
  const [file, setFile] = useState<File | null>(null);
  const { userId } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with file:', file, 'and userId:', userId); // Debugging

    if (file && userId) {
      try {
        // Step 1: Upload the file to the server and get the file URL
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await axios.post('http://localhost:3000/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const fileUrl = uploadResponse.data.url;
        console.log('File uploaded successfully:', fileUrl); // Debugging

        // Step 2: Create the new post with the file URL
        const response = await axios.post('http://localhost:3000/posts', {
          userId,
          pictureUrl: fileUrl,
          likes: 0,
          comments: []
        });
        console.log('Post added response:', response.data); // Debugging

        setFile(null);
        refreshPosts(); // Refresh posts after adding a new one
      } catch (error) {
        console.error('Error adding post:', error.response ? error.response.data : error.message); // Improved error handling
      }
    } else {
      console.log('File or userId is missing'); // Debugging
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
      <button type="submit">Add Post</button>
    </form>
  );
};

export default NewPostForm;