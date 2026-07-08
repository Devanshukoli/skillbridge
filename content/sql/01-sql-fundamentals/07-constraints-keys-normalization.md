---
id: less-sql-7
title: Constraints, Keys & Normalization
order: 7
estimatedMinutes: 20
---

### Constraints, Keys, and Normalization: Designing Data That Can't Lie to You

A good schema makes bad data structurally impossible. This is the difference between "we caught the bug in a code review" and "we caught the bug because the database itself refused to save it."

---

### Keys

- **Primary Key (PK):** uniquely identifies each row. Usually an auto-incrementing `id`.
- **Foreign Key (FK):** a column that references another table's primary key, enforcing that the relationship actually exists.

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

Now the database itself will reject an order for a `customer_id` that doesn't exist — no more orphaned records because someone forgot a check in application code.

### Other Constraints

```sql
CREATE TABLE products (
  id INT PRIMARY KEY,
  sku VARCHAR(20) UNIQUE NOT NULL,      -- no two products can share a SKU
  price DECIMAL(10,2) CHECK (price > 0), -- price can never be zero or negative
  category VARCHAR(50) NOT NULL DEFAULT 'general'
);
```

---

### Normalization: Killing Duplicate Data

**Unnormalized** (bad — repeats customer info on every single order row):

| order_id | customer_name | customer_email | product | amount |
|---|---|---|---|---|
| 1 | Asha Verma | asha@x.com | Laptop | 899 |
| 2 | Asha Verma | asha@x.com | Mouse | 25 |

Problem: change Asha's email, and you must update it in *every row* she appears in — miss one, and now your data contradicts itself.

**Normalized (3NF)** — split into separate tables connected by keys:

`customers`: `id, name, email`
`orders`: `id, customer_id, product, amount`

Now Asha's email lives in exactly one place. This is the core idea behind the "Normal Forms":
- **1NF:** every column holds a single, atomic value (no comma-separated lists crammed into one field).
- **2NF:** every non-key column depends on the *whole* primary key (matters for composite keys).
- **3NF:** every non-key column depends on the key and *nothing but* the key (no column depending on another non-key column).

In practice, most production schemas target 3NF, then deliberately break it ("denormalize") in specific, measured places for read performance — but you should never denormalize *by accident*, only on purpose.

---

### Worked Example: Normalizing a Messy Spreadsheet

**Problem:** You inherit this spreadsheet as a single table:
`order_id, customer_name, customer_email, product_1, product_2, product_3`

**Step 1 — Spot the 1NF violation.** Three separate "product" columns are really a repeating list crammed sideways — classic 1NF violation.

**Step 2 — Fix 1NF.** Create an `order_items` table: one row per product per order (`order_id, product_name`), instead of three fixed columns.

**Step 3 — Spot the 3NF violation.** `customer_email` depends on `customer_name`, not on the `order_id` — it doesn't belong on the orders table at all.

**Step 4 — Fix 3NF.** Pull customer info into its own `customers` table, referenced by `customer_id` on `orders`.

**Result:** three clean tables — `customers`, `orders`, `order_items` — each with a single, unambiguous responsibility. This is precisely the schema shape you'll build in this track's capstone project.
