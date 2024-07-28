import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';

interface NewPostFormProps {
  refreshPosts: () => void;
}

const NewPostForm: React.FunctionComponent<NewPostFormProps> = ({ refreshPosts }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const {userId}=useUser();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file); // Convert file to base64
    });
  };

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!file) {
    setError('Please select a file');
    return;
  }

  try {
    const base64File = await convertFileToBase64(file);
    console.log('Form submitted with file in Base64:', base64File, 'and userId:', userId);

    // Prepare payload
    const payload = {
      file: base64File,
      userId,
      pictureUrl,
    };

    // Make API request
    const response = await axios.post('http://localhost:3000/posts', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      refreshPosts();
    } else {
      setError('Failed to upload file');
    }
  } catch (error) {
    console.error('Error uploading file', error);
    setError('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    
      <div>
        <label htmlFor="pictureUrl">Picture URL:</label>
        <input
          type="text"
          id="pictureUrl"
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)}
        />
      </div>
      <button type="submit">Add Post</button>
    </form>
  );
};

export default NewPostForm;