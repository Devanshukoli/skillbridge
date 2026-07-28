---
id: less-worked-1
title: 'Deep Dive: Notes REST API Walkthrough'
order: 1
estimatedMinutes: 25
---

### Building a Real REST API: Step-by-Step

Let's walk through building a complete, production-ready Notes CRUD API in Node.js and Express. This combines routing, middleware, input validation, and proper error handling.

---

### The Code Architecture

Imagine we have a standard directory structure:
```
├── package.json
├── server.js
├── database.js
└── routes/
    └── notes.js
```

#### Step 1: Setting up database.js (Simple File Storage DB)
```javascript
import fs from 'fs';
const DB_FILE = './notes_db.json';

const readNotes = () => {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
};

const writeNotes = (notes) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(notes, null, 2));
};

export const noteDb = {
  getAll: () => readNotes(),
  getById: (id) => readNotes().find(n => n.id === id),
  create: (title, content) => {
    const notes = readNotes();
    const newNote = { id: Date.now().toString(), title, content, createdAt: new Date() };
    notes.push(newNote);
    writeNotes(notes);
    return newNote;
  },
  delete: (id) => {
    const notes = readNotes();
    const filtered = notes.filter(n => n.id !== id);
    if (notes.length === filtered.length) return false;
    writeNotes(filtered);
    return true;
  }
};
```

#### Step 2: Creating the Router (routes/notes.js)
```javascript
import express from 'express';
import { noteDb } from '../database.js';

const router = express.Router();

// GET all notes
router.get('/', (req, res) => {
  const notes = noteDb.getAll();
  res.json(notes);
});

// GET note by ID
router.get('/:id', (req, res) => {
  const note = noteDb.getById(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
});

// POST a new note with simple validation
router.post('/', (req, res) => {
  const { title, content } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newNote = noteDb.create(title, content || '');
  res.status(201).json(newNote);
});

// DELETE a note
router.delete('/:id', (req, res) => {
  const success = noteDb.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.status(204).send(); // No Content
});

export default router;
```

#### Step 3: Wiring it all up in server.js
```javascript
import express from 'express';
import noteRouter from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Body Parser Middleware
app.use(express.json());

// Mount Routers
app.use('/api/notes', noteRouter);

// Standard 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

### Running the API Locally
You can test this API using command-line tools like **cURL** or user-friendly applications like **Postman**:

**To create a note:**
```bash
curl -X POST http://localhost:3000/api/notes \
     -H "Content-Type: application/json" \
     -d '{"title": "My First Note", "content": "Node.js is extremely powerful."}'
```

This pattern is identical to the backend production APIs of major tech companies!
