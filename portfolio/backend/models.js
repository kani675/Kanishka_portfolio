const mongoose = require('mongoose');

// ─── Project Schema ─────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema({
  number:      { type: String, required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  tags:        [{ type: String }],
  githubLink:  { type: String, default: '' },
  liveLink:    { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now }
});

// ─── Contact Message Schema ──────────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = { Project, Contact };
