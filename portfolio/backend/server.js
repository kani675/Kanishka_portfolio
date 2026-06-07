require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const { Project, Contact } = require('./models');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve static frontend files (for combined deploy)
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── MongoDB Connection ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    await seedProjects(); // seed default projects on first run
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Seed default projects ───────────────────────────────────────────────────
async function seedProjects() {
  const count = await Project.countDocuments();
  if (count === 0) {
    await Project.insertMany([
      {
        number: '01',
        title: 'Payroll Management System',
        description: 'A system to manage employee salary, attendance, and records with structured data handling for efficient storage and retrieval.',
        tags: ['Java', 'Python', 'DBMS', 'OOP'],
        githubLink: 'https://github.com/kani675',
        liveLink: ''
      },
      {
        number: '02',
        title: 'Train Alert 24/7',
        description: 'A real-time alert system for railway track incidents with chatbot-based communication for faster information sharing.',
        tags: ['Real-time Systems', 'Chatbot', 'Alert System'],
        githubLink: 'https://github.com/kani675',
        liveLink: ''
      },
      {
        number: '03',
        title: 'Virtual Education Hub',
        description: 'A platform to connect students using partner matching with built-in communication and collaboration features.',
        tags: ['Web Dev', 'Matching Algorithm', 'Collaboration'],
        githubLink: 'https://github.com/kani675',
        liveLink: ''
      }
    ]);
    console.log('🌱 Default projects seeded to MongoDB');
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  API ROUTES
// ────────────────────────────────────────────────────────────────────────────

// GET all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ number: 1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add a new project
app.post('/api/projects', async (req, res) => {
  try {
    const { number, title, description, tags, githubLink, liveLink } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }
    const project = new Project({ number, title, description, tags, githubLink, liveLink });
    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.json({ success: true, message: 'Message saved! I will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all contact messages (admin view)
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running!', time: new Date() });
});

// Catch-all: serve frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
