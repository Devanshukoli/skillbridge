---
id: less-sql-2
title: 'Filtering & Sorting: WHERE, ORDER BY, LIMIT'
order: 2
estimatedMinutes: 15
---

### Filtering and Sorting: Making Your Data Behave

Raw tables are noisy. The real skill in SQL is narrowing down exactly the rows you care about — that's what `WHERE`, `ORDER BY`, `LIMIT`, and `OFFSET` are for.

---

### Comparison & Logical Operators

```sql
SELECT *
FROM orders
WHERE status = 'shipped'
  AND total_amount > 100
  AND created_at >= '2026-01-01';
```

Common operators: `=`, `!=` (or `<>`), `>`, `<`, `>=`, `<=`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`.

```sql
-- IN: match any value in a list
SELECT * FROM orders WHERE status IN ('shipped', 'delivered');

-- BETWEEN: inclusive range
SELECT * FROM orders WHERE total_amount BETWEEN 50 AND 200;

-- LIKE: pattern matching ('%' = any sequence, '_' = single char)
SELECT * FROM customers WHERE email LIKE '%@gmail.com';

-- NULL checks — NEVER use '= NULL', it silently returns nothing!
SELECT * FROM orders WHERE shipped_at IS NULL;
```

That last one trips up almost every beginner at least once: in SQL, `NULL` means "unknown," and comparing anything to "unknown" (even with `=`) yields "unknown" — which filters out the row. Always use `IS NULL` / `IS NOT NULL`.

---

### Sorting and Pagination

```sql
SELECT name, price
FROM products
ORDER BY price DESC, name ASC   -- ties broken alphabetically
LIMIT 10 OFFSET 20;             -- "page 3" if page size is 10
```

`ORDER BY` accepts multiple columns — SQL sorts by the first, then breaks ties with the second, and so on.

---

### Worked Example: Building a "Top 5 Recent High-Value Orders" Query

**Problem:** "Show me the 5 most recent orders over $200, most recent first."

**Step 1 — Table:** `orders`.

**Step 2 — Filter:** `total_amount > 200`.

**Step 3 — Order:** most recent first → `ORDER BY created_at DESC`.

**Step 4 — Limit:** top 5 → `LIMIT 5`.

**Step 5 — Assemble:**
```sql
SELECT id, customer_id, total_amount, created_at
FROM orders
WHERE total_amount > 200
ORDER BY created_at DESC
LIMIT 5;
```

Notice the order of operations in your head doesn't match the order SQL executes in — SQL actually evaluates `WHERE` before `ORDER BY` before `LIMIT`. Internalizing that execution order (covered fully in Lesson 8) will save you from a LOT of "why is my query wrong" debugging sessions.
