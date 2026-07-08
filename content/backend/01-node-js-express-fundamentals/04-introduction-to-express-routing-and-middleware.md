---
id: less-4
title: 'Introduction to Express: Routing and Middleware'
order: 4
estimatedMinutes: 20
---

### Welcome to Express

**Express** is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It acts as a wrapper around Node's core HTTP module, making routing, request handling, and asset serving incredibly elegant.

---

### Installing and Setting Up Express

First, we install Express:
```bash
npm install express
```

Now, let's look at a basic Express server:

```javascript
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
  console.log(`Express server running on port ${PORT}`);
});
```

---

### The Power of Middleware

In Express, everything is built around **Middleware**.
A middleware function is simply a function that has access to the request object (`req`), the response object (`res`), and the next middleware function in the application’s request-response cycle (usually denoted as `next`).

#### What can Middleware do?
- Execute any code.
- Make changes to the request and the response objects (e.g. adding `req.user` after parsing a token).
- End the request-response cycle.
- Call the next middleware in the stack using `next()`.

#### Writing a Custom Logging Middleware

```javascript
const loggerMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // CRITICAL: Call next() so the request continues to the next route handler!
  next();
};

// Mount it globally
app.use(loggerMiddleware);
```

If you forget to call `next()`, your server will "hang" indefinitely, and the browser will eventually timeout!
