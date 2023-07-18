// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { randomBytes } = require('crypto'); // Generate random string
const axios = require('axios');

// Express application
const app = express();

// Parse the request body
app.use(bodyParser.json());

// Allow cross-origin resource sharing
app.use(cors());

// Store comments
const commentsByPostId = {};

// Get comments for a post
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Add a comment for a post
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex'); // Generate random string
  const { content } = req.body;

  // Get comments from commentsByPostId
  const comments = commentsByPostId[req.params.id] || [];

  // Add new comment to comments
  comments.push({ id: commentId, content, status: 'pending' });

  // Update commentsByPostId
  commentsByPostId[req.params.id] = comments;

  // Emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' },
  });

  // Send response
  res.status(201).send(comments);
});

// Event handler for EventReceived
app.post('/events', async (req, res) => {
  console.log('EventReceived:', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    // Get comments from commentsByPostId
    const comments = commentsByPostId[postId];

    // Find comment
    const comment = comments.find((comment) => comment.id === id);

    // Update comment status
    comment.status = status;

    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { id, postId, status, content },
    });
  }

  // Send response
  res.send({});
});

