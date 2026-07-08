---
id: less-8
title: Environment Variables, Config, and Auth Concepts
order: 8
estimatedMinutes: 18
---

### Secrets Management & Security Fundamentals

When publishing server code to GitHub or running it in containers, you must **never** hardcode passwords, API keys, or security tokens directly in your source files. Instead, use environment variables.

---

### Using dotenv for Environment Variables

To read values from a `.env` file on local development, we use the `dotenv` package.

1. Create a `.env` file in your root folder:
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=my_super_secret_signing_key_abc_123
```

2. Load them in your code as early as possible:
```javascript
import dotenv from 'dotenv';
dotenv.config(); // Loads values into process.env

const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
```

Add your `.env` file to `.gitignore` so secrets are never pushed to git repository!

---

### Web Auth Concepts: Session vs. JWT

There are two primary ways servers remember who a logged-in user is:

#### 1. Stateful Sessions (Session Cookies)
- **Flow**: User logs in. Server creates a session record in the DB / Redis. Server returns a unique `Session ID` cookie. On every next request, browser sends the cookie. Server queries the database to see who the cookie belongs to.
- **Pros**: Easy to revoke sessions instantly.
- **Cons**: Difficult to scale across multiple servers, requires active DB queries for every request.

#### 2. Stateless Tokens (JSON Web Tokens - JWT)
- **Flow**: User logs in. Server encodes user ID and details into a payload, signs it using a private secret, and returns the resulting **JWT** string. The browser stores it (e.g., in a cookie or localStorage) and sends it in headers (`Authorization: Bearer <token>`). The server receives the token, checks the cryptographic signature using the secret, and extracts the user ID directly from the decrypted payload **without** querying any database.
- **Pros**: Extremely fast, stateless, infinitely scalable across multi-server clusters.
- **Cons**: Revocation is difficult until the token naturally expires.

SkillBridge uses the stateless **JWT** model for seamless authentication and speed!
