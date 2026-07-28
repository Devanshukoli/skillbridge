---
id: less-2
title: Modules, npm, and package.json
order: 2
estimatedMinutes: 12
---

### Managing Dependencies in Node.js

In modern software development, we rarely write everything from scratch. We rely on reusable modules. Node.js has a built-in module system and uses **npm** (Node Package Manager) to manage third-party code.

---

### CommonJS vs. ES Modules (ESM)

Node.js supports two module formats:
1. **CommonJS (CJS)**: The legacy default. Uses `require()` and `module.exports`.
2. **ES Modules (ESM)**: The modern JavaScript standard. Uses `import` and `export`.

**CommonJS Example:**
```javascript
// math.js
const add = (a, b) => a + b;
module.exports = { add };

// index.js
const { add } = require('./math');
console.log(add(2, 3)); // 5
```

**ES Modules Example:**
```javascript
// math.js
export const add = (a, b) => a + b;

// index.js
import { add } from './math.js';
console.log(add(2, 3)); // 5
```

To enable ES Modules in a Node.js project, add `"type": "module"` to your `package.json`.

---

### Understanding package.json

The `package.json` file is the manifesto of your Node.js application. It acts as a recipe book, metadata holder, and script runner.

Here is a look at a standard `package.json`:
```json
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
```

- **scripts**: Custom commands you run using `npm run <script-name>` (e.g. `npm run dev`).
- **dependencies**: Packages required for the application to run in production.
- **devDependencies**: Packages only needed for local development and testing (e.g., test runners, bundlers, linters).
- **Caret (^)**: Tells npm that it can update to any minor or patch release (e.g., `^4.1.0` can upgrade to `4.12.0` but not `5.0.0`).
- **Tilde (~)**: Restricts updates to patch versions only (e.g., `~1.2.3` can upgrade to `1.2.9` but not `1.3.0`).

---

### The Role of package-lock.json

When you run `npm install`, npm automatically generates a `package-lock.json` file. 
This file describes the **exact tree** of dependencies that were installed. It guarantees that any other developer (or production server) running `npm install` gets the exact same dependency versions, eliminating the dreaded *"It works on my machine!"* bugs.
