const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // Fix import here

const app = express();
const port = 3000;

// Middleware
const corsOptions = {
  origin: 'http://localhost:5173', // Ensure this matches your React app's URL
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware

// Session setup
app.use(session({
  secret: 'your_secret_key', // Change this to a secure key
  resave: false,
  saveUninitialized: false, // Use false to prevent saving uninitialized sessions
  cookie: { secure: false, httpOnly: true }, // Set httpOnly to true for security, secure to true for HTTPS
}));

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
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        req.session.userId = user.id; // Set userId in session
        res.send({ message: "Login successful!", userId: user.id });
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
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
};

// Route to check if session is set (for debugging)
app.get('/check-session', (req, res) => {
  if (req.session.userId) {
    res.send({ userId: req.session.userId });
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
});

// Get a list of users
app.get('/users/:id', requireAuth, async (req, res) => {
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
app.post('/posts', requireAuth, async (req, res) => {
  const { pictureUrl, likes = 0 } = req.body;
  const userId = req.session.userId; // Get userId from session

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
app.delete('/posts/:id', requireAuth, async (req, res) => {
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
app.post('/posts/:id/like', requireAuth, async (req, res) => {
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
app.post('/posts/:id/comment', requireAuth, async (req, res) => {
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
app.get('/users/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, email, username FROM users WHERE id = ?", [req.session.userId]);
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
app.get('/users/:id', requireAuth, async (req, res) => {
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
