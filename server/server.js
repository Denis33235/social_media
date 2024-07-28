const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_media',
});

// Register a new user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login a user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password }); // Log the login attempt
  try {
    const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword); // Log password validation
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, userId: user.id });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Error logging in user' });
  }
});


// Get a list of users
app.get('/users', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT id, email FROM users');
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Create a new post
app.post('/posts', async (req, res) => {
  const { userId, pictureUrl, likes = 0 } = req.body;
  console.log('Creating post with:', { userId, pictureUrl, likes }); 
  try {
    const [result] = await db.execute('INSERT INTO posts (userId, pictureUrl, likes) VALUES (?, ?, ?)', [userId, pictureUrl, likes]);
    const postId = result.insertId;
    console.log('Post created with ID:', postId); // Debugging
    res.status(201).json({ message: 'Post created successfully!', postId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Get a list of posts
app.get('/posts', async (req, res) => {
  try {
    const [postResults] = await db.execute('SELECT * FROM posts');
    const postIds = postResults.map(post => post.id);

    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',');
      const query = `SELECT * FROM comments WHERE postId IN (${placeholders})`;
      const [commentResults] = await db.execute(query, postIds);
      const postsWithComments = postResults.map(post => {
        post.comments = commentResults
          .filter(comment => comment.postId === post.id)
          .map(comment => comment.text);
        return post;
      });

      res.json(postsWithComments);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Add a like to a post
app.post('/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json({ message: 'Like added successfully!' });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ error: 'Error adding like' });
  }
});

// Add a comment to a post
app.post('/posts/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    await db.execute('INSERT INTO comments (postId, text) VALUES (?, ?)', [id, text]);
    res.status(201).json({ message: 'Comment added successfully!' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
