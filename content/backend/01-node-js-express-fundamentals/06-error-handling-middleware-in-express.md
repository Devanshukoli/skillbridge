---
id: less-6
title: Error Handling Middleware in Express
order: 6
estimatedMinutes: 15
---

### Writing Resilient Servers

Errors in backend servers are inevitable. A database connection might fail, a user might submit malformed input, or an external API might throw an exception. If uncaught, these can crash your server.

Express provides a specialized middleware pattern specifically for catching and handling errors globally.

---

### The Error Handling Signature

While standard middleware has three arguments (`req, res, next`), error-handling middleware has **exactly four arguments**: `err, req, res, next`. Express uses the presence of four arguments to recognize it as an error handler.

```javascript
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
```

---

### Triggering the Error Handler

To trigger your error handler from inside your routes, you call `next(err)` with the error object:

```javascript
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
```

In modern Express (v5+), errors thrown inside asynchronous handler functions (`async/await`) are automatically forwarded to the error-handling middleware. However, in Express v4, you **must** wrap your async routes in try-catch and call `next(err)` manually to prevent the server from hanging or crashing!
