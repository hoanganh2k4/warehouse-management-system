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

- INBOUND
- OUTBOUND
- MOVE
- ADJUSTMENT

Fields

| Name | Type |
|------|------|
| id | UUID |
| inventoryId | UUID |
| type | Enum |
| quantity | Integer |
| createdAt | Timestamp |

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