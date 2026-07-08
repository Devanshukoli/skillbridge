---
id: less-sql-worked-1
title: 'Deep Dive: Building an Analytics Query Step by Step'
order: 1
estimatedMinutes: 25
---

### Deep Dive: Building a Full Analytics Query From Scratch

Let's build a real analytics query the way it actually happens on the job: starting from a vague business question and ending at production-ready SQL, one deliberate step at a time.

---

### The Business Question

> "Which customers have spent more than $500 total, and what was their most recent order date? Show me the top 10 by total spend."

This is intentionally vague — real requests always are. Your job is to translate it.

---

### Step 1: Identify the Tables and the Relationship

We need `customers` (id, name) and `orders` (id, customer_id, total_amount, created_at). Relationship: one customer → many orders, so we'll `JOIN` and `GROUP BY` the customer.

### Step 2: Draft the Join

```sql
SELECT c.id, c.name, o.total_amount, o.created_at
FROM customers c
JOIN orders o ON c.id = o.customer_id;
```

At this stage, run it and eyeball the raw joined rows — this is a habit senior engineers never skip. Confirm the join didn't accidentally duplicate rows (check row count against `SELECT COUNT(*) FROM orders`).

### Step 3: Add the Aggregation

We need a *total* spend and the *most recent* order date per customer:

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total_amount) AS total_spent,
  MAX(o.created_at)   AS last_order_date
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
```

### Step 4: Apply the "More Than $500" Filter

This is a filter on an *aggregated* value, so it's `HAVING`, not `WHERE`:

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total_amount) AS total_spent,
  MAX(o.created_at)   AS last_order_date
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
HAVING SUM(o.total_amount) > 500;
```

### Step 5: Sort and Limit to "Top 10"

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total_amount) AS total_spent,
  MAX(o.created_at)   AS last_order_date
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
HAVING SUM(o.total_amount) > 500
ORDER BY total_spent DESC
LIMIT 10;
```

### Step 6: The Production Checklist

Before this query ships in a dashboard or API, a careful engineer asks:
1. **Does `JOIN` vs. `LEFT JOIN` matter here?** A customer with zero orders is correctly excluded by our inner `JOIN` — that's actually what we want, since they can't have spent >$500.
2. **Is there an index to support this?** `orders(customer_id)` should already be indexed as a foreign key — confirm with `EXPLAIN ANALYZE`.
3. **What happens with `NULL` amounts?** `SUM()` ignores `NULL`s silently — verify that's the intended behavior, or coalesce with `COALESCE(o.total_amount, 0)`.
4. **Is the result deterministic?** Ties in `total_spent DESC` could return different rows on different runs — add a tiebreaker like `, c.id ASC` if the "top 10" needs to be stable.

That's the real workflow: draft → verify → aggregate → filter → sort/limit → production checklist. Every complex query you'll ever write is this same loop, just with more steps.
