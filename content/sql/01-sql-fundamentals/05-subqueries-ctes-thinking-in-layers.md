---
id: less-sql-5
title: 'Subqueries & CTEs: Thinking in Layers'
order: 5
estimatedMinutes: 20
---

### Subqueries and CTEs: Thinking in Layers

Sometimes a single flat query can't express what you need — you need "a query inside a query." That's a subquery. When subqueries get complex, Common Table Expressions (CTEs) keep them readable.

---

### Scalar & IN Subqueries

```sql
-- Scalar subquery: returns a single value
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- Subquery in an IN clause: returns a list
SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE total_amount > 500);
```

---

### Correlated Subqueries

A **correlated** subquery references the outer query's row — it re-runs once per outer row, so use it carefully on large tables:

```sql
SELECT name, price, category
FROM products p1
WHERE price > (
  SELECT AVG(price) FROM products p2 WHERE p2.category = p1.category
);
```
This finds products priced above their *own category's* average — the inner query depends on `p1.category` from the outer row.

---

### CTEs: The Readable Alternative

A CTE (`WITH ... AS`) names a temporary result set you can reference like a table — it turns a tangle of nested subqueries into a readable, top-to-bottom narrative:

```sql
WITH category_averages AS (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
)
SELECT p.name, p.price, ca.avg_price
FROM products p
JOIN category_averages ca ON p.category = ca.category
WHERE p.price > ca.avg_price;
```

Same result as the correlated subquery above, but most engineers find this dramatically easier to read and debug — and on most modern query engines (Postgres, Snowflake), it performs at least as well.

---

### Worked Example: "Top Spender Per Country"

**Problem:** "For each country, find the single customer who has spent the most in total."

**Step 1 — Compute the building block.** Total spend per customer:
```sql
WITH customer_totals AS (
  SELECT c.id, c.name, c.country, SUM(o.total_amount) AS total_spent
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name, c.country
),
```

**Step 2 — Rank within each country.** Add a ranking CTE using a window function (a sneak peek — full window function coverage is a great next step after this track):
```sql
ranked AS (
  SELECT *, RANK() OVER (PARTITION BY country ORDER BY total_spent DESC) AS rnk
  FROM customer_totals
)
```

**Step 3 — Pull just the winners:**
```sql
SELECT country, name, total_spent
FROM ranked
WHERE rnk = 1;
```

**Full query:**
```sql
WITH customer_totals AS (
  SELECT c.id, c.name, c.country, SUM(o.total_amount) AS total_spent
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name, c.country
),
ranked AS (
  SELECT *, RANK() OVER (PARTITION BY country ORDER BY total_spent DESC) AS rnk
  FROM customer_totals
)
SELECT country, name, total_spent
FROM ranked
WHERE rnk = 1;
```

This exact "CTE building block, then rank, then filter" pattern shows up constantly in real analytics work and in SQL interviews.
