---
id: less-3
title: Creating a Basic HTTP Server with Core Http
order: 3
estimatedMinutes: 15
---

### Before Express: Standard Node.js Networking

Before diving into Express, it's vital to see how Node.js handles HTTP networking natively. This builds an appreciation for what Express does under the hood.

Node.js comes equipped with a built-in `http` module that can spin up a fully functioning web server with just a few lines of code.

---

### Writing a Basic HTTP Server

Here is how you create a basic server that listens on port `3000` and responds with a greeting:

```javascript
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
  console.log(`Server is listening on http://localhost:${PORT}`);
});
```

#### Key Concepts

1. **req (IncomingMessage)**: An object containing details about the client's request, such as `req.url`, `req.method` (GET, POST), and headers.
2. **res (ServerResponse)**: A writable stream used to send headers and data back to the client. You write headers with `res.writeHead()` or `res.setHeader()` and finish the request with `res.end()`.

---

### Routing on Core Http (The Hard Way)

In a real server, you want to return different responses for different URLs (e.g., `/users` vs `/products`). Doing this with core HTTP requires parsing `req.url` manually:

```javascript
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
```

As you can see, manually checking methods, routes, headers, and parsing request bodies in core Node.js gets incredibly tedious as the server grows. This is exactly why we use frameworks like **Express**!
