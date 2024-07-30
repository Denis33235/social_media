const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // For environment variables

const app = express();
const port = 3000;

// Middleware
const corsOptions = {
  origin: 'http://localhost:5173', // Ensure this matches your React app's URL
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json()); // To parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_media',
});

// User registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);
    res.send({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// User login
// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ userId: user.id, token }); // Ensure both userId and token are returned
      } else {
        res.status(400).send({ message: "Wrong email or password" });
      }
    } else {
      res.status(400).send({ message: "Wrong email or password" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).send({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Route to check if session is set (for debugging)
app.get('/check-session', authenticateJWT, (req, res) => {
  res.send({ userId: req.user.id });
});

// Get a list of users
app.get('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT id, email, username FROM users WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send({ error: 'Error fetching user profile' });
  }
});

// Create a new post (protected route)
app.post('/posts', authenticateJWT, async (req, res) => {
  const { pictureUrl, likes = 0 } = req.body;
  const userId = req.user.id; // Get userId from JWT

  try {
    const [result] = await db.execute('INSERT INTO posts (userId, pictureUrl, likes) VALUES (?, ?, ?)', [userId, pictureUrl, likes]);
    const postId = result.insertId;
    res.status(201).json({ message: 'Post created successfully!', postId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Delete a post
app.delete('/posts/:id', authenticateJWT, async (req, res) => {
  const postId = req.params.id;

  try {
    const [result] = await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Get a list of posts with comments
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
app.post('/posts/:id/like', authenticateJWT, async (req, res) => {
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
app.post('/posts/:id/comment', authenticateJWT, async (req, res) => {
  const { id } = req.params; // id here refers to the postId
  const { text } = req.body;

  try {
    const [result] = await db.execute('INSERT INTO comments (postId, text) VALUES (?, ?)', [id, text]);
    const commentId = result.insertId;
    res.status(201).json({ message: 'Comment added successfully!', commentId });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Search users by email
app.get('/search-users', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).send({ message: 'Query parameter is required' });
  }
  
  try {
    const [results] = await db.execute('SELECT id, email FROM users WHERE email LIKE ?', [`%${query}%`]);
    res.json(results);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Error searching users' });
  }
});

// Get a user's profile
app.get('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT id, email, username FROM users WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send({ error: 'Error fetching user profile' });
  }
});


// Update user profile
app.get('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT id, email, username FROM users WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send({ error: 'Error fetching user profile' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
