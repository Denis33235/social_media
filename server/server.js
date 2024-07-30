const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const app = express();
const port = 3000;

// Middleware
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_media',
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
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ userId: user.id, token }); 
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

// Get a list of users
app.get('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute("SELECT email, username FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send({ error: 'Error fetching profile' });
  }
});

// Create a new post (protected route)
app.post('/posts', authenticateJWT, async (req, res) => {
  const { pictureUrl, likes = 0 } = req.body;
  const userId = req.user.id; 

  try {
    const [result] = await db.execute('INSERT INTO posts (userId, pictureUrl, likes) VALUES (?, ?, ?)', [userId, pictureUrl, likes]);
    const postId = result.insertId;
    res.status(201).json({ message: 'Post created successfully!', postId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Delete a post (protected route)
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
app.delete('/posts/:postId/comments/:commentId', authenticateJWT, async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM comments WHERE id = ? AND postId = ?', [commentId, postId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment deleted successfully!' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
});



// Add a like to a post (protected route)
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

// Add a comment to a post (protected route)
app.post('/posts/:id/comment', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.execute(
      'INSERT INTO comments (postId, text, userId) VALUES (?, ?, ?)',
      [id, text, userId]
    );
    res.status(201).json({ message: 'Comment added successfully!', commentId: result.insertId });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment', details: error.message });
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
// Update user profile
app.put('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { email, username } = req.body;
  try {
    await db.query("UPDATE users SET email = ?, username = ? WHERE id = ?", [email, username, id]);
    res.send({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send({ error: 'Error updating profile' });
  }
});

// Delete user profile
app.delete('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: 'Error deleting user' });
  }
});
// Update user profile
app.put('/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { email, username } = req.body;
  try {
    await db.query("UPDATE users SET email = ?, username = ? WHERE id = ?", [email, username, id]);
    res.send({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send({ error: 'Error updating profile' });
  }
});
// Update user password
app.put('/users/:id/password', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, id]);
    res.send({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send({ error: 'Error updating password' });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
