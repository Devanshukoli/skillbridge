---
id: less-1
title: What is Node.js and the Event Loop?
order: 1
estimatedMinutes: 15
---

### Introduction to Node.js

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
```
[ Incoming Request ] ──> [ Event Demultiplexer / Libuv Threadpool ]
                                      │
                                      ▼ (Operation Finishes)
[ Main Callback Queue ] <─────────────┘
          │
          ▼ (If Call Stack is empty)
[ Execute Callback in Single Thread ]
```

#### Code Example: Blocking vs. Non-blocking

**Blocking (Synchronous):**
```javascript
const fs = require('fs');
console.log('1. Reading file...');
const data = fs.readFileSync('large-file.txt', 'utf8');
console.log('2. File read finished.');
console.log('3. Proceeding with other work!');
// Output order: 1 -> 2 -> 3
```,

**Non-Blocking (Asynchronous):**
```javascript
const fs = require('fs');
console.log('1. Reading file...');
fs.readFile('large-file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('2. File read finished!');
});
console.log('3. Proceeding with other work immediately!');
// Output order: 1 -> 3 -> 2
```

Understanding this asynchronous, non-blocking flow is absolutely essential for writing clean, bug-free Node.js servers!
