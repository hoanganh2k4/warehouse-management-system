# API Specification

## Overview

This document defines the RESTful APIs exposed by the Smart Warehouse Management System.

Base URL

```
/api/v1
```

Authentication

```
JWT Bearer Token
```

Content Type

```
application/json
```

---

# Authentication

## Login

POST

```
/auth/login
```

Request

```json
{
  "username": "admin",
  "password": "123456"
}
```

Response

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600
}
```

---

## Profile

GET

```
/auth/profile
```

Response

```json
{
  "id": "...",
  "username": "admin",
  "role": "ADMIN"
}
```

---

# Warehouse

## Get Warehouses

GET

```
/warehouses
```

---

## Get Warehouse

GET

```
/warehouses/{id}
```

---

## Create Warehouse

POST

```
/warehouses
```

Request

```json
{
  "code": "WH001",
  "name": "Main Warehouse",
  "address": "Ho Chi Minh City"
}
```

---

## Update Warehouse

PUT

```
/warehouses/{id}
```

---

## Delete Warehouse

DELETE

```
/warehouses/{id}
```

---

# Zone

GET

```
/zones
```

POST

```
/zones
```

PUT

```
/zones/{id}
```

DELETE

```
/zones/{id}
```

---

# Rack

GET

```
/racks
```

POST

```
/racks
```

PUT

```
/racks/{id}
```

DELETE

```
/racks/{id}
```

---

# Level

GET

```
/levels
```

POST

```
/levels
```

PUT

```
/levels/{id}
```

DELETE

```
/levels/{id}
```

---

# Slot

GET

```
/slots
```

GET

```
/slots/{id}
```

POST

```
/slots
```

PUT

```
/slots/{id}
```

DELETE

```
/slots/{id}
```

---

# Product

GET

```
/products
```

Supports

- Pagination
- Search
- Sort

Example

```
/products?page=1&limit=20&keyword=laptop
```

---

GET

```
/products/{id}
```

---

POST

```
/products
```

```json
{
  "sku": "SKU001",
  "name": "Keyboard",
  "categoryId": "...",
  "weight": 1.2
}
```

---

PUT

```
/products/{id}
```

---

DELETE

```
/products/{id}
```

---

# Batch

GET

```
/batches
```

POST

```
/batches
```

GET

```
/batches/{id}
```

---

# Inventory

GET

```
/inventory
```

Supports

- Warehouse
- Product
- Batch
- Slot

---

GET

```
/inventory/{id}
```

---

# Inbound

POST

```
/inventory/inbound
```

Example

```json
{
  "productId": "...",
  "quantity": 100,
  "manufactureDate": "2026-06-01",
  "expiryDate": "2027-06-01"
}
```

Workflow

```
Create Batch

↓

Allocate Slot

↓

Update Inventory

↓

Save Transaction
```

---

# Outbound

POST

```
/inventory/outbound
```

Example

```json
{
  "productId": "...",
  "quantity": 20
}
```

Workflow

```
Apply FEFO

↓

Reserve Inventory

↓

Update Inventory

↓

Save Transaction
```

---

# Transactions

GET

```
/transactions
```

Supports

- Date range
- Type
- Product
- Warehouse

---

# Dashboard

GET

```
/dashboard/summary
```

Response

```json
{
  "products": 120,
  "inventory": 4300,
  "availableSlots": 230,
  "occupiedSlots": 170
}
```

---

# Reports

GET

```
/reports/inventory
```

GET

```
/reports/inbound
```

GET

```
/reports/outbound
```

---

# Standard Response

Success

```json
{
  "success": true,
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

# HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |