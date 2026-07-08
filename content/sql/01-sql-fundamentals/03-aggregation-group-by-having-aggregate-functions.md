---
id: less-sql-3
title: 'Aggregation: GROUP BY, HAVING & Aggregate Functions'
order: 3
estimatedMinutes: 18
---

### Aggregation: Turning Rows Into Insights

So far we've filtered and sorted individual rows. Now let's *summarize* them — this is where SQL starts to feel like a superpower for reporting and analytics.

---

### The Aggregate Functions

| Function | What it does |
|---|---|
| `COUNT(*)` | Number of rows |
| `SUM(col)` | Total of a numeric column |
| `AVG(col)` | Average of a numeric column |
| `MIN(col)` / `MAX(col)` | Smallest / largest value |

```sql
SELECT COUNT(*) AS total_orders, SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed';
```

---

### GROUP BY: Aggregating Per Category

Aggregates get truly powerful when you bucket rows by a category using `GROUP BY`:

```sql
SELECT category, COUNT(*) AS num_products, AVG(price) AS avg_price
FROM products
GROUP BY category;
```

**Golden rule:** every non-aggregated column in your `SELECT` must appear in `GROUP BY`. If you `SELECT category, name, AVG(price)` but only `GROUP BY category`, most databases will throw an error — SQL genuinely doesn't know which `name` to show you for a whole group of rows.

---

### HAVING vs. WHERE (This Is a FAANG Interview Favorite)

- `WHERE` filters **rows** *before* grouping happens.
- `HAVING` filters **groups** *after* aggregation happens.

```sql
SELECT category, AVG(price) AS avg_price
FROM products
WHERE in_stock = true          -- filter rows first
GROUP BY category
HAVING AVG(price) > 100;       -- then filter the resulting groups
```

You cannot write `WHERE AVG(price) > 100` — at the point `WHERE` executes, the average hasn't been computed yet. This ordering trips up even experienced engineers under interview pressure, so drill it until it's automatic.

---

### Worked Example: "Which Categories Are Underperforming?"

**Problem:** "Find categories with fewer than 10 completed orders this year, along with their total revenue."

**Step 1 — Tables:** `orders` joined conceptually to `category` (we'll do real joins in Lesson 4 — for now assume `orders` has a `category` column directly).

**Step 2 — Row filter:** `status = 'completed' AND created_at >= '2026-01-01'`.

**Step 3 — Group:** by `category`.

**Step 4 — Group filter:** `COUNT(*) < 10`.

**Step 5 — Assemble:**
```sql
SELECT category, COUNT(*) AS orders_this_year, SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed' AND created_at >= '2026-01-01'
GROUP BY category
HAVING COUNT(*) < 10
ORDER BY revenue ASC;
```

That's a real dashboard query — the kind a product manager would actually ask for in a standup.
