---
id: less-7
title: Connecting Express to a Database (CRUD)
order: 7
estimatedMinutes: 20
---

### Database Persistence in Express

A backend server's primary role is often act as a gatekeeper and orchestrator for a persistent database. To do this, we write CRUD endpoints:
- **C**reate (POST)
- **R**ead (GET)
- **U**pdate (PUT / PATCH)
- **D**elete (DELETE)

---

### Establishing DB Operations

For an MVP database connection, we often use an ORM (Object-Relational Mapping) like **Prisma** or **Drizzle** to communicate with relational databases like PostgreSQL.

Here is a simplified example of how database CRUD functions map directly to Express routes:

```javascript
import express from 'express';
import { db } from './db.js'; // Assuming a database connection helper

const router = express.Router();

// 1. CREATE (Post a new record)
router.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const newTask = await db.insertTask({ title, description });
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// 2. READ (Get all records)
router.get('/api/tasks', async (req, res, next) => {
  try {
    const tasks = await db.getAllTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// 3. UPDATE (Modify an existing record)
router.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;
    const updated = await db.updateTask(req.params.id, { title, description, completed });
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 4. DELETE (Remove a record)
router.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const success = await db.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).end(); // 204 No Content
  } catch (err) {
    next(err);
  }
});
```

Understanding CRUD mapping is the foundation of almost all web service backends!
