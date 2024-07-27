const NewPostForm: React.FunctionComponent<NewPostFormProps> = ({ refreshPosts }) => {
  const [image, setImage] = useState<string>('');
  const { userId } = useUser();
  
  console.log('Current userId:', userId); // Debugging

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with image:', image, 'and userId:', userId); // Debugging
    if (image.trim() && userId) {
      try {
        await axios.post('http://localhost:3000/posts', {
          userId,
          pictureUrl: image,
          likes: 0,
          comments: []
        });
        console.log('Post added successfully');
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
        required // Ensure input is not empty
      />
      <button type="submit">Add Post</button>
    </form>
  );
};
