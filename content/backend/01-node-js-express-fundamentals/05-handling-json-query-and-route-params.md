---
id: less-5
title: Handling JSON, Query, and Route Params
order: 5
estimatedMinutes: 15
---

### Getting Data from HTTP Requests

When building APIs, clients need to send data to the server. There are three primary ways clients send parameter data in Express:

1. **Route Parameters** (for targeting specific resources, e.g., `/api/users/42`)
2. **Query Parameters** (for filtering, sorting, or paginating, e.g., `/api/users?status=active`)
3. **Request Body** (for complex payloads, usually JSON, e.g., POSTing a user login)

---

### 1. Route Parameters

Route parameters are named URL segments that are used to capture values at specific positions in the URL. They are prefixed with a colon (`:`) and populated in `req.params`.

```javascript
// Route: /api/books/:bookId/authors/:authorId
app.get('/api/books/:bookId/authors/:authorId', (req, res) => {
  const { bookId, authorId } = req.params;
  res.json({
    message: 'Fetched book details',
    bookId,
    authorId
  });
});
```

---

### 2. Query Parameters

Query parameters are key-value pairs separated by `&` after a question mark (`?`) in the URL. Express automatically parses them into `req.query`.

```javascript
// URL: /api/search?q=nodejs&limit=10
app.get('/api/search', (req, res) => {
  const { q, limit } = req.query;
  res.json({
    searchQuery: q,
    resultsLimit: limit || 5
  });
});
```

---

### 3. Request Body (JSON)

To accept JSON payloads in POST or PUT requests, you must mount the `express.json()` middleware. This middleware parses incoming JSON streams and attaches the resulting object to `req.body`.

```javascript
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
```
