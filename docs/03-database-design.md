# Database Design

## Overview

This document describes the logical database design of the Smart Warehouse Management System.

The database is designed using a relational model and follows normalization principles to ensure data consistency, scalability, and maintainability.

---

# Design Principles

- Use UUID as the primary key for all tables.
- Store timestamps (`createdAt`, `updatedAt`) for every entity.
- Use foreign keys to maintain referential integrity.
- Prefer soft delete (`deletedAt`) for business entities.
- Use indexes on frequently queried columns.
- Keep entities focused on a single responsibility.

---

# Domain Model

The system is divided into five domains.

```
Identity
Warehouse
Catalog
Inventory
Operation
```

---

# Entity Relationship Overview

```
Warehouse
    │
    └──── Zone
             │
             └──── Rack
                      │
                      └──── Level
                               │
                               └──── Slot

Product
    │
    └──── Batch
             │
             └──── Inventory
                      │
                      └──── InventoryTransaction
```

---

# Domain: Identity

## User

Purpose

Represents a system user.

Fields

| Name | Type |
|------|------|
| id | UUID |
| username | String |
| email | String |
| passwordHash | String |
| roleId | UUID |
| createdAt | Timestamp |
| updatedAt | Timestamp |

Relationship

```
Role (1)
    │
    └──── User (N)
```

---

## Role

Purpose

Represents an authorization role.

Examples

- Admin
- Warehouse Manager
- Staff

Fields

| Name | Type |
|------|------|
| id | UUID |
| name | String |
| description | String |

---

# Domain: Warehouse

## Warehouse

Purpose

Represents a physical warehouse.

Fields

| Name | Type |
|------|------|
| id | UUID |
| code | String |
| name | String |
| address | String |
| createdAt | Timestamp |
| updatedAt | Timestamp |

Relationship

```
Warehouse (1)

↓

Zone (N)
```

---

## Zone

Purpose

Logical area inside a warehouse.

Fields

| Name | Type |
|------|------|
| id | UUID |
| warehouseId | UUID |
| code | String |
| name | String |

Relationship

```
Zone

↓

Rack
```

---

## Rack

Purpose

Storage rack.

Fields

| Name | Type |
|------|------|
| id | UUID |
| zoneId | UUID |
| code | String |

Relationship

```
Rack

↓

Level
```

---

## Level

Purpose

Shelf level inside a rack.

Fields

| Name | Type |
|------|------|
| id | UUID |
| rackId | UUID |
| levelNumber | Integer |

Relationship

```
Level

↓

Slot
```

---

## Slot

Purpose

Smallest storage location.

Fields

| Name | Type |
|------|------|
| id | UUID |
| levelId | UUID |
| code | String |
| capacity | Integer |
| occupied | Integer |

---

# Domain: Catalog

## Product

Fields

| Name | Type |
|------|------|
| id | UUID |
| sku | String |
| name | String |
| category | String |
| width | Decimal |
| length | Decimal |
| height | Decimal |
| weight | Decimal |

---

# Domain: Inventory

## Batch

Purpose

Represents one inbound batch.

Fields

| Name | Type |
|------|------|
| id | UUID |
| productId | UUID |
| batchNumber | String |
| manufactureDate | Date |
| expiryDate | Date |

---

## Inventory

Purpose

Current inventory in one slot.

Fields

| Name | Type |
|------|------|
| id | UUID |
| slotId | UUID |
| batchId | UUID |
| quantity | Integer |

---

## Inventory Transaction

Purpose

Tracks every inventory movement.

Transaction Types

- IMPORT
- EXPORT
- MOVE

Fields

| Name | Type |
|------|------|
| id | UUID |
| type | Enum |
| batchId | UUID |
| slotFromId | UUID? |
| slotToId | UUID? |
| quantity | Integer |
| userId | UUID |
| note | String? |
| createdAt | Timestamp |

---

# Prisma Schema & Seed

## Prisma schema location

The Prisma schema file is located at:

```text
apps/backend/prisma/schema.prisma
```

## Generated Prisma client

The generated Prisma client lives in:

```text
apps/backend/generated/prisma
```

## Seed script location

The seed script is located at:

```text
apps/backend/prisma/seed.ts
```

## What seed creates

The seed script populates the database with:

- Roles: `Quản lý`, `Nhân viên kho`
- Users: `admin`, `staff01`
- Warehouse structure: warehouse, zones, racks, levels, slots
- Products and batches for FEFO test data

## Useful database tables

Seed data is written to these tables:

- `roles`
- `users`
- `warehouse`
- `zones`
- `racks`
- `levels`
- `slots`
- `products`
- `batches`
- `inventory`
- `transactions`

---

# Index Strategy

Recommended indexes

```
product.sku

warehouse.code

slot.code

batch.batchNumber

inventory.batchId

inventory.slotId

transaction.createdAt
```

---

# Future Extensions

- Purchase Orders
- Suppliers
- Customers
- Barcode
- QR Code
- Audit Logs
- Notification