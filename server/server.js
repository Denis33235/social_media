const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Session setup
app.use(session({
  secret: 'your_secret_key', // Change this to a secure key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set to true if using HTTPS
}));

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_media',
});

app.post('/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);
    res.send({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: err.message });
  }
});

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
    res.status(500).send({ err: err.message });
  }
});

// Middleware to protect routes
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
};

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

// Create a new post (protected route)
app.post('/posts', async (req, res) => {
  const { userId, pictureUrl, likes = 0 } = req.body;

  try {
    const [result] = await db.execute('INSERT INTO posts (userId, pictureUrl, likes) VALUES (?, ?, ?)', [userId, pictureUrl, likes]);
    const postId = result.insertId;
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
