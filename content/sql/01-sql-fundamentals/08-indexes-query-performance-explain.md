---
id: less-sql-8
title: Indexes & Query Performance (EXPLAIN)
order: 8
estimatedMinutes: 20
---

### Indexes and Query Performance: Making SQL Fast at Scale

Everything so far has been about *correctness*. This lesson is about *speed* — the difference between a query that returns in 4ms and one that times out at 30 seconds once your table has 50 million rows.

---

### What Is an Index, Really?

Without an index, the database does a **full table scan** — checking every single row to find matches, like reading a book cover-to-cover to find one sentence. An index is like the book's index page: a separate, sorted structure (almost always a **B-tree**) that lets the database jump straight to matching rows.

```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

Now `WHERE customer_id = 42` is a fast lookup instead of a full scan.

---

### EXPLAIN: Reading the Database's Mind

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42;
```

This shows you the actual **query plan** — whether it used an index (`Index Scan`) or scanned the whole table (`Seq Scan`), how many rows it estimated vs. actually touched, and how long each step took. Reading `EXPLAIN` output is one of the highest-leverage skills you can build as a backend engineer — it turns "the query is slow" from a mystery into a diagnosis.

---

### Indexes Aren't Free

Every index speeds up reads on that column but **slows down writes** — every `INSERT`/`UPDATE`/`DELETE` now has to update the index too. This is a genuine trade-off, not a "just add more indexes" situation. Index the columns you filter, join, and sort on frequently; don't index every column "just in case."

**Composite indexes** cover multiple columns, but column *order* matters a lot:
```sql
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```
This index efficiently supports `WHERE customer_id = 42` and `WHERE customer_id = 42 AND status = 'shipped'` — but it does **not** efficiently support `WHERE status = 'shipped'` alone, because the index is sorted by `customer_id` first.

---

### Worked Example: Diagnosing and Fixing a Slow Query

**Problem:** "This dashboard query takes 8 seconds. Fix it."
```sql
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
```

**Step 1 — Run `EXPLAIN ANALYZE`.** Output shows `Seq Scan on orders` — a full table scan across all 3 million rows.

**Step 2 — Identify the filter and sort columns.** `status` (filter) and `created_at` (sort).

**Step 3 — Add a composite index matching that access pattern:**
```sql
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
```

**Step 4 — Re-run `EXPLAIN ANALYZE`.** Now shows `Index Scan using idx_orders_status_created` — plan cost drops dramatically, and the query returns in milliseconds.

**Step 5 — Watch your write path.** Since `orders` gets a lot of `INSERT`s, confirm this new index isn't slowing down checkout throughput beyond an acceptable margin — every index is a trade-off, and a good engineer always checks both sides of that trade before shipping it.
