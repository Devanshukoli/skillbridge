---
id: less-sql-1
title: Introduction to Relational Databases & SELECT
order: 1
estimatedMinutes: 15
---

### Why SQL Still Runs the World

Every "modern" stack you've heard of — Postgres powering Instagram, MySQL powering YouTube's metadata, even NoSQL databases borrowing SQL-like query languages — eventually comes back to the relational model. Learn this once, deeply, and it transfers everywhere.

A **relational database** organizes data into **tables** (also called relations). Each table has:
- **Rows** (a.k.a. records/tuples) — one row = one entity, like one customer or one order.
- **Columns** (a.k.a. fields/attributes) — each column has a name and a data type (`INT`, `VARCHAR`, `BOOLEAN`, `TIMESTAMP`, etc).

Think of a table like a well-organized spreadsheet, except the database engine enforces types, relationships, and constraints for you — a spreadsheet will happily let you put "banana" in a price column; a relational database won't.

---

### Your First Query

```sql
SELECT first_name, last_name, email
FROM customers
WHERE country = 'India';
```

Breaking this down clause by clause:
- `SELECT` — which columns you want back (use `*` for "all columns," but avoid it in production code — explicit columns are self-documenting and faster).
- `FROM` — which table you're pulling from.
- `WHERE` — the row-level filter condition.

---

### Worked Example: From English to SQL, Step by Step

**Problem:** "Get me the name and price of every product that costs more than $50, cheapest first."

**Step 1 — Identify the table.** We're clearly talking about a `products` table.

**Step 2 — Identify the columns you need.** `name`, `price`.

**Step 3 — Identify the filter.** `price > 50`.

**Step 4 — Identify the ordering.** "Cheapest first" = ascending order on `price`.

**Step 5 — Assemble it:**
```sql
SELECT name, price
FROM products
WHERE price > 50
ORDER BY price ASC;
```

That five-step mental model — **table → columns → filter → order → assemble** — is exactly how senior engineers mentally parse a product manager's request into a query. It never stops being useful, even when the query gets 10 joins deep.
