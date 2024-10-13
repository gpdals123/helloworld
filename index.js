// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import { Logging } from '@google-cloud/logging';

const app = express();
const PORT = 8080;

// Set up Google Cloud Logging
const logging = new Logging();
const log = logging.log('my-log');


// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// In-memory database to store blog posts (for simplicity)
let posts = [];

// Logging middleware for all requests
app.use((req, res, next) => {
  res.on('finish', () => {
    const metadata = { resource: { type: 'global' } };
    const logEntry = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    };
    const entry = log.entry(metadata, logEntry);
    log.write(entry).catch(console.error);

    console.log(`Request: ${req.method} ${req.url}, Status Code: ${res.statusCode}`);
  });
  next();
});


// Route to display all blog posts
app.get('/', (req, res) => {
  res.status(200).render('index', { posts });
});


// Route to display form to create a new post
app.get('/new', (req, res) => {
  res.status(200).render('new');
});

// Route to handle new post submission
app.post('/new', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).send('Bad Request: Title and content are required.');
    return;
  }
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);
  res.status(201).redirect('/');
});

// Route to view a specific post by ID
app.get('/post/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  if (post) {
    res.status(200).render('post', { post });
  } else {
    res.status(404).send('Post not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
  const metadata = { resource: { type: 'global' } };
  const logEntry = {
    error: err.stack,
    message: 'Internal Server Error'
  };
  const entry = log.entry(metadata, logEntry);
  log.write(entry).catch(console.error);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Ensure you are accessing the correct port: 8080');
});

