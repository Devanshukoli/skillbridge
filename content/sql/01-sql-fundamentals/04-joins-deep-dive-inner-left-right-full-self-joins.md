---
id: less-sql-4
title: 'JOINs Deep Dive: INNER, LEFT, RIGHT, FULL & Self Joins'
order: 4
estimatedMinutes: 22
---

### JOINs: Where SQL Gets Its Reputation for Being "Hard" (It Isn't)

Real databases split data across multiple tables to avoid duplication (that's normalization — Lesson 7). JOINs are how you stitch that data back together at query time.

---

### The Four Joins You Actually Need

Imagine `customers` (id, name) and `orders` (id, customer_id, total_amount).

**INNER JOIN** — only rows that match in both tables:
```sql
SELECT c.name, o.total_amount
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
```
A customer with zero orders? Not in the result. An order with a deleted customer_id? Not in the result either.

**LEFT JOIN** — every row from the left table, matched data from the right (or `NULL` if no match):
```sql
SELECT c.name, o.total_amount
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
```
This is how you answer "which customers have never placed an order?":
```sql
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;   -- no matching order row was found
```

**RIGHT JOIN** — mirror image of LEFT JOIN (rarely used in practice; people just flip the table order and use LEFT JOIN instead — more readable).

**FULL OUTER JOIN** — everything from both sides, matched where possible, `NULL` where not. Useful for reconciliation reports ("which records exist in system A but not B, or vice versa").

---

### Self Joins

Sometimes a table refers to itself — e.g., an `employees` table with a `manager_id` pointing to another row in the same table:

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

Same table, aliased twice (`e` and `m`) so SQL can tell the two "copies" apart.

---

### Worked Example: Three-Table Join for an Order Summary

**Problem:** "For every order, show the customer's name, the product name, and the quantity ordered." Tables: `customers`, `orders`, `order_items` (order_id, product_id, quantity), `products`.

**Step 1 — Start from the "center" table.** `order_items` sits between everything — start there.

**Step 2 — Join outward, one relationship at a time.**
```sql
SELECT
  c.name       AS customer_name,
  p.name       AS product_name,
  oi.quantity
FROM order_items oi
INNER JOIN orders o    ON oi.order_id   = o.id
INNER JOIN customers c ON o.customer_id = c.id
INNER JOIN products p  ON oi.product_id = p.id
ORDER BY o.created_at DESC;
```

**Step 3 — Sanity check row counts.** After joining, always ask: "did this multiply my rows unexpectedly?" A common JOIN bug is an accidental one-to-many relationship blowing up your row count — always verify against `COUNT(*)` on the base table before and after.
