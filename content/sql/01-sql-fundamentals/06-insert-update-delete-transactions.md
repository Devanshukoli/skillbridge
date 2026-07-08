---
id: less-sql-6
title: INSERT, UPDATE, DELETE & Transactions
order: 6
estimatedMinutes: 18
---

### Changing Data Safely: INSERT, UPDATE, DELETE & Transactions

Reading data is half the job. The other half is changing it — without corrupting it.

---

### INSERT

```sql
INSERT INTO customers (name, email, country)
VALUES ('Asha Verma', 'asha@example.com', 'India');

-- Insert multiple rows in one statement
INSERT INTO customers (name, email, country) VALUES
  ('Liam Chen', 'liam@example.com', 'Singapore'),
  ('Maria Silva', 'maria@example.com', 'Brazil');
```

### UPDATE

```sql
UPDATE orders
SET status = 'shipped', shipped_at = NOW()
WHERE id = 42;
```

**Danger zone:** run an `UPDATE` (or `DELETE`) without a `WHERE` clause and you just modified *every single row in the table.* This is a real, career-story-worthy incident that has happened to senior engineers at big companies. The habit that saves you: **always write and verify the `SELECT` version of your filter first.**

```sql
-- Step 1: verify what you're about to touch
SELECT * FROM orders WHERE status = 'pending' AND created_at < '2026-01-01';

-- Step 2: only once that looks right, convert to UPDATE/DELETE
UPDATE orders SET status = 'cancelled'
WHERE status = 'pending' AND created_at < '2026-01-01';
```

### DELETE

```sql
DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2020-01-01';
```

---

### Transactions: Making Multi-Step Changes Atomic

A **transaction** groups multiple statements so they either *all* succeed or *all* fail together — critical whenever one logical action touches more than one table (like an order checkout that both creates an order AND reduces inventory).

```sql
BEGIN;

UPDATE inventory SET stock = stock - 1 WHERE product_id = 7;
INSERT INTO orders (customer_id, product_id, total_amount) VALUES (1, 7, 49.99);

COMMIT;   -- both changes are saved together
-- or ROLLBACK; to undo everything if something went wrong mid-transaction
```

This is the **A** in **ACID** (Atomicity, Consistency, Isolation, Durability) — the four guarantees a proper relational database gives you, and a big part of why SQL databases remain the default choice for anything involving money, inventory, or anything else where "partially applied" is not an acceptable state.

---

### Worked Example: Safe Checkout Logic, Step by Step

**Problem:** "When a customer checks out, deduct stock and create an order — but never let stock go negative."

**Step 1 — Check available stock (inside the transaction, so nobody else can change it mid-check):**
```sql
BEGIN;
SELECT stock FROM inventory WHERE product_id = 7 FOR UPDATE; -- locks the row
```

**Step 2 — In your application code, confirm `stock >= quantity_requested`.**

**Step 3 — If valid, apply both changes:**
```sql
UPDATE inventory SET stock = stock - 1 WHERE product_id = 7;
INSERT INTO orders (customer_id, product_id, total_amount) VALUES (1, 7, 49.99);
COMMIT;
```

**Step 4 — If invalid, `ROLLBACK;` and return a friendly "out of stock" error instead.**

This exact pattern — read-lock, validate in app code, write, commit — is the backbone of nearly every e-commerce checkout system you've ever used.
