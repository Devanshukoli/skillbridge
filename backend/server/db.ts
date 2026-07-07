import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Track, Module, Lesson, Project, Submission, Progress, Claim } from '../../frontend/src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');
const BUILT_IN_TRACK_IDS = new Set(['track-backend-1']);

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> bcryptHash
  tracks: Track[];
  modules: Module[];
  lessons: Lesson[];
  projects: Project[];
  submissions: Submission[];
  progress: Progress[];
  claims: Claim[];
  notifiedTrackIds: string[];
}

const defaultDb: DatabaseSchema = {
  users: [],
  passwords: {},
  tracks: [],
  modules: [],
  lessons: [],
  projects: [],
  submissions: [],
  progress: [],
  claims: [],
  notifiedTrackIds: []
};

// Helper to load DB
export function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveDb(defaultDb);
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const result = JSON.parse(raw) as DatabaseSchema;
    if (!Array.isArray(result.notifiedTrackIds)) {
      result.notifiedTrackIds = result.tracks
        .filter((track) => BUILT_IN_TRACK_IDS.has(track.id))
        .map((track) => track.id);
    }
    return result;
  } catch (err) {
    console.error('Error loading DB, returning empty', err);
    return defaultDb;
  }
}

// Helper to save DB
export function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB', err);
  }
}

async function notifyNewTracks(db: DatabaseSchema) {
  db.notifiedTrackIds = db.notifiedTrackIds || [];
  for (const track of db.tracks) {
    if (BUILT_IN_TRACK_IDS.has(track.id) && !db.notifiedTrackIds.includes(track.id)) {
      db.notifiedTrackIds.push(track.id);
    }
  }
  const freshTracks = db.tracks.filter((track) => !db.notifiedTrackIds.includes(track.id));
  if (freshTracks.length === 0) return;

  const recipients = db.users.map((user) => user.email);
  if (recipients.length === 0) {
    console.warn('[Tracks] No users found to notify about new tracks.');
    return;
  }

  try {
    const { sendTrackNotificationEmail } = await import('../modules/notifications/trackNotificationEmail');
    const result = await sendTrackNotificationEmail({
      tracks: freshTracks,
      recipients,
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    });

    if (result.sent) {
      db.notifiedTrackIds.push(...freshTracks.map((track) => track.id));
      saveDb(db);
      console.log(`[Tracks] Sent notifications for ${freshTracks.length} new track(s) to ${recipients.length} users.`);
    } else {
      console.warn('[Tracks] Notification email failed:', result.reason, result.error);
    }
  } catch (err) {
    console.error('[Tracks] Failed to send new track notifications:', err);
  }
}

// Seed helper
export async function seedDatabase() {
  const db = loadDb();

  // Create default admin if not present
  const adminEmail = 'admin@skillbridge.com';
  let adminUser = db.users.find(u => u.email === adminEmail);
  if (!adminUser) {
    const adminId = 'user-admin-1';
    const hash = await bcrypt.hash('admin123', 10);
    adminUser = {
      id: adminId,
      name: 'System Admin',
      email: adminEmail,
      role: 'admin',
      pointsBalance: 1000,
      claimableBalance: 0,
      profile: {
        experienceLevel: 'Have internship experience',
        skills: ['Node.js', 'Express', 'SQL', 'Git', 'REST APIs'],
        goals: 'Maintain and review curriculum submissions.',
        timeCommitment: 'Intensive 10+ hrs',
        bio: 'Senior Backend Reviewer & Platform Administrator',
        currentRole: 'Backend Team Lead'
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(adminUser);
    db.passwords[adminId] = hash;
  }

  // Create default student if not present
  const studentEmail = 'student@skillbridge.com';
  let studentUser = db.users.find(u => u.email === studentEmail);
  if (!studentUser) {
    const studentId = 'user-student-1';
    const hash = await bcrypt.hash('student123', 10);
    studentUser = {
      id: studentId,
      name: 'Devanshu Koli',
      email: studentEmail,
      role: 'student',
      pointsBalance: 0,
      claimableBalance: 0,
      profile: {
        experienceLevel: 'Built personal projects',
        skills: ['JavaScript', 'Git'],
        goals: 'Get my first job as a software engineer',
        timeCommitment: 'Regular ~5-8 hrs',
        bio: 'Aspiring junior backend engineer looking to build scalable microservices.',
        currentRole: 'Computer Science Student'
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(studentUser);
    db.passwords[studentId] = hash;
  }

  // Seed Backend Track
  const trackId = 'track-backend-1';
  let track = db.tracks.find(t => t.id === trackId);
  if (!track) {
    track = {
      id: trackId,
      name: 'Backend Engineer (Node.js + Express)',
      description: 'Master server-side engineering. Learn everything from HTTP fundamentals to REST APIs, databases, authentication, and error handling.',
      icon: 'Server'
    };
    db.tracks.push(track);
  }

  // Seed Modules
  const modules = [
    { id: 'mod-1', trackId, title: 'Node.js & Express Fundamentals', order: 1 },
    { id: 'mod-2', trackId, title: 'Worked Examples (Deep Dives)', order: 2 },
    { id: 'mod-3', trackId, title: 'Practice Projects', order: 3 },
    { id: 'mod-4', trackId, title: 'Real-World Capstone', order: 4 }
  ];

  for (const m of modules) {
    if (!db.modules.some(x => x.id === m.id)) {
      db.modules.push(m);
    }
  }

  // Seed Lessons for Module 1
  const lessons: Lesson[] = [
    {
      id: 'less-1',
      moduleId: 'mod-1',
      title: 'What is Node.js and the Event Loop?',
      order: 1,
      estimatedMinutes: 15,
      content: `### Introduction to Node.js

Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. Historically, JavaScript ran exclusively in browsers. Node.js changed this by using Google Chrome's high-performance **V8 Engine** to run JavaScript on the server side.

#### Key Features of Node.js

1. **Asynchronous and Event-Driven**: All APIs of the Node.js library are asynchronous (non-blocking). Node-based servers never wait for an API to return data. Instead, they move to the next API, using a notification mechanism called **Events** to receive responses.
2. **Single-Threaded**: Node.js operates on a single thread using event looping, allowing it to handle thousands of concurrent connections without the overhead of thread context-switching.
3. **No Buffering**: Node.js applications output data in chunks (streaming), which increases responsiveness.

---

### Understanding the Event Loop

The **Event Loop** is the secret sauce that enables Node.js to perform non-blocking I/O operations, despite being single-threaded. 

Normally, web servers create a new thread for every incoming connection. If that thread needs to query a database (I/O), the thread "blocks" and waits. This wastes memory and CPU.

Node.js does I/O differently:
1. When an asynchronous operation (like reading a file or querying a DB) is started, Node.js offloads it to the system kernel or a background thread pool (**Libuv**).
2. The main thread continues executing other code.
3. When the database query finishes, a callback function is pushed to the **Callback Queue**.
4. The **Event Loop** constantly monitors the Call Stack and the Callback Queue. If the Call Stack is empty, it grabs the first task from the queue and pushes it onto the stack to be executed.

#### Visualizing the Lifecycle
\`\`\`
[ Incoming Request ] ──> [ Event Demultiplexer / Libuv Threadpool ]
                                      │
                                      ▼ (Operation Finishes)
[ Main Callback Queue ] <─────────────┘
          │
          ▼ (If Call Stack is empty)
[ Execute Callback in Single Thread ]
\`\`\`

#### Code Example: Blocking vs. Non-blocking

**Blocking (Synchronous):**
\`\`\`javascript
const fs = require('fs');
console.log('1. Reading file...');
const data = fs.readFileSync('large-file.txt', 'utf8');
console.log('2. File read finished.');
console.log('3. Proceeding with other work!');
// Output order: 1 -> 2 -> 3
\`\`\`,

**Non-Blocking (Asynchronous):**
\`\`\`javascript
const fs = require('fs');
console.log('1. Reading file...');
fs.readFile('large-file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('2. File read finished!');
});
console.log('3. Proceeding with other work immediately!');
// Output order: 1 -> 3 -> 2
\`\`\`

Understanding this asynchronous, non-blocking flow is absolutely essential for writing clean, bug-free Node.js servers!`
    },
    {
      id: 'less-2',
      moduleId: 'mod-1',
      title: 'Modules, npm, and package.json',
      order: 2,
      estimatedMinutes: 12,
      content: `### Managing Dependencies in Node.js

In modern software development, we rarely write everything from scratch. We rely on reusable modules. Node.js has a built-in module system and uses **npm** (Node Package Manager) to manage third-party code.

---

### CommonJS vs. ES Modules (ESM)

Node.js supports two module formats:
1. **CommonJS (CJS)**: The legacy default. Uses \`require()\` and \`module.exports\`.
2. **ES Modules (ESM)**: The modern JavaScript standard. Uses \`import\` and \`export\`.

**CommonJS Example:**
\`\`\`javascript
// math.js
const add = (a, b) => a + b;
module.exports = { add };

// index.js
const { add } = require('./math');
console.log(add(2, 3)); // 5
\`\`\`

**ES Modules Example:**
\`\`\`javascript
// math.js
export const add = (a, b) => a + b;

// index.js
import { add } from './math.js';
console.log(add(2, 3)); // 5
\`\`\`

To enable ES Modules in a Node.js project, add \`"type": "module"\` to your \`package.json\`.

---

### Understanding package.json

The \`package.json\` file is the manifesto of your Node.js application. It acts as a recipe book, metadata holder, and script runner.

Here is a look at a standard \`package.json\`:
\`\`\`json
{
  "name": "my-express-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
\`\`\`

- **scripts**: Custom commands you run using \`npm run <script-name>\` (e.g. \`npm run dev\`).
- **dependencies**: Packages required for the application to run in production.
- **devDependencies**: Packages only needed for local development and testing (e.g., test runners, bundlers, linters).
- **Caret (\^)**: Tells npm that it can update to any minor or patch release (e.g., \`^4.1.0\` can upgrade to \`4.12.0\` but not \`5.0.0\`).
- **Tilde (\~)**: Restricts updates to patch versions only (e.g., \`~1.2.3\` can upgrade to \`1.2.9\` but not \`1.3.0\`).

---

### The Role of package-lock.json

When you run \`npm install\`, npm automatically generates a \`package-lock.json\` file. 
This file describes the **exact tree** of dependencies that were installed. It guarantees that any other developer (or production server) running \`npm install\` gets the exact same dependency versions, eliminating the dreaded *"It works on my machine!"* bugs.`
    },
    {
      id: 'less-3',
      moduleId: 'mod-1',
      title: 'Creating a Basic HTTP Server with Core Http',
      order: 3,
      estimatedMinutes: 15,
      content: `### Before Express: Standard Node.js Networking

Before diving into Express, it's vital to see how Node.js handles HTTP networking natively. This builds an appreciation for what Express does under the hood.

Node.js comes equipped with a built-in \`http\` module that can spin up a fully functioning web server with just a few lines of code.

---

### Writing a Basic HTTP Server

Here is how you create a basic server that listens on port \`3000\` and responds with a greeting:

\`\`\`javascript
import http from 'http';

const PORT = 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set response headers
  res.writeHead(200, { 'Content-Type': 'application/json' });

  // Send the response body
  const responseData = {
    message: 'Hello, World! This server runs on pure Node.js.',
    timestamp: new Date()
  };

  res.end(JSON.stringify(responseData));
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server is listening on http://localhost:\${PORT}\`);
});
\`\`\`

#### Key Concepts

1. **req (IncomingMessage)**: An object containing details about the client's request, such as \`req.url\`, \`req.method\` (GET, POST), and headers.
2. **res (ServerResponse)**: A writable stream used to send headers and data back to the client. You write headers with \`res.writeHead()\` or \`res.setHeader()\` and finish the request with \`res.end()\`.

---

### Routing on Core Http (The Hard Way)

In a real server, you want to return different responses for different URLs (e.g., \`/users\` vs \`/products\`). Doing this with core HTTP requires parsing \`req.url\` manually:

\`\`\`javascript
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to the Home Page!');
  } else if (url === '/api/users' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route Not Found');
  }
});
\`\`\`

As you can see, manually checking methods, routes, headers, and parsing request bodies in core Node.js gets incredibly tedious as the server grows. This is exactly why we use frameworks like **Express**!`
    },
    {
      id: 'less-4',
      moduleId: 'mod-1',
      title: 'Introduction to Express: Routing and Middleware',
      order: 4,
      estimatedMinutes: 20,
      content: `### Welcome to Express

**Express** is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It acts as a wrapper around Node's core HTTP module, making routing, request handling, and asset serving incredibly elegant.

---

### Installing and Setting Up Express

First, we install Express:
\`\`\`bash
npm install express
\`\`\`

Now, let's look at a basic Express server:

\`\`\`javascript
import express from 'express';

const app = express();
const PORT = 3000;

// Setup a JSON parser middleware
app.use(express.json());

// A simple GET route
app.get('/', (req, res) => {
  res.send('Welcome to the Express Server!');
});

// A simple JSON API route
app.get('/api/info', (req, res) => {
  res.json({
    framework: 'Express',
    language: 'TypeScript/JavaScript',
    status: 'healthy'
  });
});

app.listen(PORT, () => {
  console.log(\`Express server running on port \${PORT}\`);
});
\`\`\`

---

### The Power of Middleware

In Express, everything is built around **Middleware**.
A middleware function is simply a function that has access to the request object (\`req\`), the response object (\`res\`), and the next middleware function in the application’s request-response cycle (usually denoted as \`next\`).

#### What can Middleware do?
- Execute any code.
- Make changes to the request and the response objects (e.g. adding \`req.user\` after parsing a token).
- End the request-response cycle.
- Call the next middleware in the stack using \`next()\`.

#### Writing a Custom Logging Middleware

\`\`\`javascript
const loggerMiddleware = (req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  // CRITICAL: Call next() so the request continues to the next route handler!
  next();
};

// Mount it globally
app.use(loggerMiddleware);
\`\`\`

If you forget to call \`next()\`, your server will "hang" indefinitely, and the browser will eventually timeout!`
    },
    {
      id: 'less-5',
      moduleId: 'mod-1',
      title: 'Handling JSON, Query, and Route Params',
      order: 5,
      estimatedMinutes: 15,
      content: `### Getting Data from HTTP Requests

When building APIs, clients need to send data to the server. There are three primary ways clients send parameter data in Express:

1. **Route Parameters** (for targeting specific resources, e.g., \`/api/users/42\`)
2. **Query Parameters** (for filtering, sorting, or paginating, e.g., \`/api/users?status=active\`)
3. **Request Body** (for complex payloads, usually JSON, e.g., POSTing a user login)

---

### 1. Route Parameters

Route parameters are named URL segments that are used to capture values at specific positions in the URL. They are prefixed with a colon (\`:\`) and populated in \`req.params\`.

\`\`\`javascript
// Route: /api/books/:bookId/authors/:authorId
app.get('/api/books/:bookId/authors/:authorId', (req, res) => {
  const { bookId, authorId } = req.params;
  res.json({
    message: 'Fetched book details',
    bookId,
    authorId
  });
});
\`\`\`

---

### 2. Query Parameters

Query parameters are key-value pairs separated by \`&\` after a question mark (\`?\`) in the URL. Express automatically parses them into \`req.query\`.

\`\`\`javascript
// URL: /api/search?q=nodejs&limit=10
app.get('/api/search', (req, res) => {
  const { q, limit } = req.query;
  res.json({
    searchQuery: q,
    resultsLimit: limit || 5
  });
});
\`\`\`

---

### 3. Request Body (JSON)

To accept JSON payloads in POST or PUT requests, you must mount the \`express.json()\` middleware. This middleware parses incoming JSON streams and attaches the resulting object to \`req.body\`.

\`\`\`javascript
app.use(express.json()); // CRITICAL for parsing req.body!

app.post('/api/users', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and Email are required.' });
  }

  res.status(201).json({
    message: 'User created successfully',
    user: { id: Date.now().toString(), username, email }
  });
});
\`\`\``
    },
    {
      id: 'less-6',
      moduleId: 'mod-1',
      title: 'Error Handling Middleware in Express',
      order: 6,
      estimatedMinutes: 15,
      content: `### Writing Resilient Servers

Errors in backend servers are inevitable. A database connection might fail, a user might submit malformed input, or an external API might throw an exception. If uncaught, these can crash your server.

Express provides a specialized middleware pattern specifically for catching and handling errors globally.

---

### The Error Handling Signature

While standard middleware has three arguments (\`req, res, next\`), error-handling middleware has **exactly four arguments**: \`err, req, res, next\`. Express uses the presence of four arguments to recognize it as an error handler.

\`\`\`javascript
// Error-handling middleware MUST be defined AFTER all other app.use() and routes!
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);

  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  });
});
\`\`\`

---

### Triggering the Error Handler

To trigger your error handler from inside your routes, you call \`next(err)\` with the error object:

\`\`\`javascript
app.get('/api/users/:id', (req, res, next) => {
  try {
    const user = findUserInDB(req.params.id);
    if (!user) {
      // Create custom error and pass to next()
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err); 
    }
    res.json(user);
  } catch (error) {
    // Passes any database system error onto the error handler!
    next(error); 
  }
});
\`\`\`

In modern Express (v5+), errors thrown inside asynchronous handler functions (\`async/await\`) are automatically forwarded to the error-handling middleware. However, in Express v4, you **must** wrap your async routes in try-catch and call \`next(err)\` manually to prevent the server from hanging or crashing!`
    },
    {
      id: 'less-7',
      moduleId: 'mod-1',
      title: 'Connecting Express to a Database (CRUD)',
      order: 7,
      estimatedMinutes: 20,
      content: `### Database Persistence in Express

A backend server's primary role is often act as a gatekeeper and orchestrator for a persistent database. To do this, we write CRUD endpoints:
- **C**reate (POST)
- **R**ead (GET)
- **U**pdate (PUT / PATCH)
- **D**elete (DELETE)

---

### Establishing DB Operations

For an MVP database connection, we often use an ORM (Object-Relational Mapping) like **Prisma** or **Drizzle** to communicate with relational databases like PostgreSQL.

Here is a simplified example of how database CRUD functions map directly to Express routes:

\`\`\`javascript
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
\`\`\`

Understanding CRUD mapping is the foundation of almost all web service backends!`
    },
    {
      id: 'less-8',
      moduleId: 'mod-1',
      title: 'Environment Variables, Config, and Auth Concepts',
      order: 8,
      estimatedMinutes: 18,
      content: `### Secrets Management & Security Fundamentals

When publishing server code to GitHub or running it in containers, you must **never** hardcode passwords, API keys, or security tokens directly in your source files. Instead, use environment variables.

---

### Using dotenv for Environment Variables

To read values from a \`.env\` file on local development, we use the \`dotenv\` package.

1. Create a \`.env\` file in your root folder:
\`\`\`env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=my_super_secret_signing_key_abc_123
\`\`\`

2. Load them in your code as early as possible:
\`\`\`javascript
import dotenv from 'dotenv';
dotenv.config(); // Loads values into process.env

const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
\`\`\`

Add your \`.env\` file to \`.gitignore\` so secrets are never pushed to git repository!

---

### Web Auth Concepts: Session vs. JWT

There are two primary ways servers remember who a logged-in user is:

#### 1. Stateful Sessions (Session Cookies)
- **Flow**: User logs in. Server creates a session record in the DB / Redis. Server returns a unique \`Session ID\` cookie. On every next request, browser sends the cookie. Server queries the database to see who the cookie belongs to.
- **Pros**: Easy to revoke sessions instantly.
- **Cons**: Difficult to scale across multiple servers, requires active DB queries for every request.

#### 2. Stateless Tokens (JSON Web Tokens - JWT)
- **Flow**: User logs in. Server encodes user ID and details into a payload, signs it using a private secret, and returns the resulting **JWT** string. The browser stores it (e.g., in a cookie or localStorage) and sends it in headers (\`Authorization: Bearer <token>\`). The server receives the token, checks the cryptographic signature using the secret, and extracts the user ID directly from the decrypted payload **without** querying any database.
- **Pros**: Extremely fast, stateless, infinitely scalable across multi-server clusters.
- **Cons**: Revocation is difficult until the token naturally expires.

SkillBridge uses the stateless **JWT** model for seamless authentication and speed!`
    }
  ];

  for (const l of lessons) {
    if (!db.lessons.some(x => x.id === l.id)) {
      db.lessons.push(l);
    }
  }

  // Seed Worked Examples (Module 2)
  const workedLessons: Lesson[] = [
    {
      id: 'less-worked-1',
      moduleId: 'mod-2',
      title: 'Deep Dive: Notes REST API Walkthrough',
      order: 1,
      estimatedMinutes: 25,
      content: `### Building a Real REST API: Step-by-Step

Let's walk through building a complete, production-ready Notes CRUD API in Node.js and Express. This combines routing, middleware, input validation, and proper error handling.

---

### The Code Architecture

Imagine we have a standard directory structure:
\`\`\`
├── package.json
├── server.js
├── database.js
└── routes/
    └── notes.js
\`\`\`

#### Step 1: Setting up database.js (Simple File Storage DB)
\`\`\`javascript
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
\`\`\`

#### Step 2: Creating the Router (routes/notes.js)
\`\`\`javascript
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
\`\`\`

#### Step 3: Wiring it all up in server.js
\`\`\`javascript
import express from 'express';
import noteRouter from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Logging Middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
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
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
\`\`\`

---

### Running the API Locally
You can test this API using command-line tools like **cURL** or user-friendly applications like **Postman**:

**To create a note:**
\`\`\`bash
curl -X POST http://localhost:3000/api/notes \\
     -H "Content-Type: application/json" \\
     -d '{"title": "My First Note", "content": "Node.js is extremely powerful."}'
\`\`\`

This pattern is identical to the backend production APIs of major tech companies!`
    }
  ];

  for (const l of workedLessons) {
    if (!db.lessons.some(x => x.id === l.id)) {
      db.lessons.push(l);
    }
  }

  // Seed Practice & Capstone Projects
  const projects: Project[] = [
    {
      id: 'proj-prac-1',
      trackId,
      moduleId: 'mod-3',
      type: 'practice',
      title: 'Practice: Build a Todo REST API with Joi Validation',
      description: 'Implement a comprehensive Express.js REST API with full CRUD endpoints for a Todo manager, but incorporate proper schema validation using Joi or schema assertions. This ensures no malformed objects enter your systems.',
      requirements: [
        'Initialize an Express server on Port 3000.',
        'Implement GET /todos, GET /todos/:id, POST /todos, PUT /todos/:id, and DELETE /todos/:id.',
        'Use an array-based or JSON-file-based persistent database layer.',
        'Implement input body validation: Title is required (min 3 chars), completed must be a boolean (defaults to false), priority must be one of [low, medium, high].',
        'Return structured 400 Bad Request error if validation fails, displaying detail on which parameters are invalid.'
      ],
      rubric: [
        'Endpoint compliance: All 5 CRUD methods work correctly.',
        'Validation strength: POSTing a todo without a title or with invalid priority is safely blocked and returns 400.',
        'Error Resilience: Malformed JSON bodies are caught by error handling middleware and do not crash the server.',
        'Code formatting: Code is well-commented and organized.'
      ],
      rewardPoints: 150
    },
    {
      id: 'proj-prac-2',
      trackId,
      moduleId: 'mod-3',
      type: 'practice',
      title: 'Practice: Add Pagination, Search, and Filtering',
      description: 'Extend an existing API route to handle pagination query parameters (?page=1&limit=10), search keywords (?search=query), and filter fields (?status=completed). In professional servers, we never return entire tables at once—we paginated queries.',
      requirements: [
        'Implement an endpoint GET /api/items which handles mock item lists (seed at least 25 items).',
        'Add search capabilities filtering by item titles matching user query (?q=keyword).',
        'Add pagination handling: query parameters `page` (default 1) and `limit` (default 5).',
        'In the response metadata, include pagination metrics: `page`, `limit`, `totalItems`, and `totalPages`.',
        'Handle negative or non-integer parameter values safely by defaulting to standard values.'
      ],
      rubric: [
        'Search compliance: Querying /api/items?q=apple accurately filters results.',
        'Pagination metrics: Response metadata matches actual output arrays perfectly.',
        'Safety bounds: Requests for page -5 or limit 9999 are safely coerced to standard safety limits (e.g. limit max 100).',
        'Clean Express handler structure.'
      ],
      rewardPoints: 150
    },
    {
      id: 'proj-cap-1',
      trackId,
      moduleId: 'mod-4',
      type: 'capstone',
      title: 'Capstone: Production-Style E-Commerce REST API Backend',
      description: 'This is your centerpiece. You are building the complete core engine for a modern E-Commerce backend service. This project requires implementing secure JSON Web Token authentication, product inventory management, a multi-item persistent shopping cart, checkout order placement, detailed validation schemas, modular controllers, and structured custom error classes.',
      requirements: [
        'User Auth system: Register, Login, and a protected GET /api/users/me endpoint. Issue secure JWTs and authenticate them using a custom `requireAuth` middleware.',
        'Products Catalog (GET /products, GET /products/:id). Only Admins can execute CRUD (POST, PUT, DELETE) on products.',
        'Shopping Cart system (POST /cart/items adds an item, GET /cart gets the cart, DELETE /cart/items/:id removes item). Carts are user-specific and persistent.',
        'Order checkout system (POST /orders/checkout takes current cart items, checks product inventory stock, reduces inventory, computes total price, clears cart, and creates a pending Order record).',
        'Structured modular organization: controllers/, routes/, middlewares/, utils/.',
        'Advanced error Handling: Use a global error handling middleware, throwing custom error classes (e.g. NotFoundError, BadRequestError, UnauthorizedError) to return standardized errors.',
        'Extensive README.md outlining setup instructions, architecture decisions, database models, and sample cURL requests.'
      ],
      rubric: [
        'Security: API endpoints for profile, cart, and checkout are strictly protected by JWT verification.',
        'Admin Boundaries: Trying to create/update products with a student JWT is safely blocked with 403 Forbidden.',
        'Inventory Integrity: Checking out a quantity larger than product stock throws a 400 Bad Request and rolls back cart transactions.',
        'Architecture quality: Modular file division, no inline DB setups, robust try-catch wrappers, and standard logging.',
        'Documentation: High-quality README.md outlining exact setup commands and complete API specifications.'
      ],
      rewardPoints: 500,
      rewardMoney: 100 // $100 reward!
    }
  ];

  for (const p of projects) {
    if (!db.projects.some(x => x.id === p.id)) {
      db.projects.push(p);
    }
  }

  saveDb(db);
  await notifyNewTracks(db);
}
