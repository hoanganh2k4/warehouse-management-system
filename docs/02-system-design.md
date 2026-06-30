# System Design

## Overview

Smart WMS (Warehouse Management System) is a full-stack web application designed to help warehouse operators manage products, warehouse layouts, inventory movements, and storage optimization.

The system provides real-time inventory tracking, smart slot allocation, FEFO picking strategy, warehouse visualization, and reporting.

---

# Objectives

- Manage warehouse structures
- Manage products and inventory
- Track inventory transactions
- Optimize storage locations
- Support inbound and outbound operations
- Provide real-time inventory visibility
- Improve warehouse efficiency

---

# Scope

## In Scope

- User authentication
- Role-based authorization
- Warehouse management
- Product management
- Batch management
- Inventory management
- Inbound workflow
- Outbound workflow
- Smart slot allocation
- FEFO inventory selection
- Dashboard
- Reports

---

## Out of Scope

- ERP integration
- Barcode scanner integration
- Mobile application
- IoT device integration
- Multi-company management

---

# Functional Requirements

## Authentication

- User login
- JWT authentication
- Role-based authorization

---

## Warehouse Management

- Create warehouse
- Update warehouse
- Delete warehouse
- View warehouse

Warehouse hierarchy

```
Warehouse
    └── Zone
            └── Rack
                    └── Level
                            └── Slot
```

---

## Product Management

- Create product
- Update product
- Delete product
- Search product
- Product categories

---

## Batch Management

Each inbound transaction creates one inventory batch.

Batch information includes

- Batch number
- Manufacture date
- Expiration date
- Quantity

---

## Inventory Management

Track

- Current quantity
- Reserved quantity
- Available quantity

Support

- Stock adjustment
- Stock movement

---

## Inbound

Receive products into warehouse.

Workflow

```
Receive Goods
        ↓
Create Batch
        ↓
Allocate Slot
        ↓
Update Inventory
        ↓
Record Transaction
```

---

## Outbound

Ship products from warehouse.

Workflow

```
Create Order
        ↓
Find Inventory
        ↓
Apply FEFO
        ↓
Generate Picking List
        ↓
Update Inventory
        ↓
Record Transaction
```

---

## Smart Slot Allocation

Automatically determine the best storage slot based on

- Slot capacity
- Product size
- Product category
- Distance
- Current occupancy

---

## Warehouse Visualization

Display warehouse layout

```
Warehouse

Zone A

Rack 1

Level 1

Slot A1
Slot A2
Slot A3
```

---

## Dashboard

Display

- Total products
- Inventory level
- Available slots
- Warehouse utilization
- Inbound today
- Outbound today

---

# Non-functional Requirements

## Performance

- Average API response < 300ms
- Inventory lookup < 100ms

---

## Scalability

Support

- Multiple warehouses
- Thousands of products
- Millions of inventory transactions

---

## Availability

- Dockerized environment
- Easy deployment
- Automated database migration

---

## Security

- JWT Authentication
- Password hashing
- Input validation
- Role-based authorization

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

---

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- Redis

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions

---

# High-Level Architecture

```
                    Browser
                       │
                       ▼
                 React Frontend
                       │
                  REST API
                       │
                       ▼
                 NestJS Backend
                ┌─────────────┐
                │             │
                ▼             ▼
         PostgreSQL        Redis
```

---

# Application Modules

```
Authentication

Users

Roles

Warehouse

Products

Inventory

Batch

Inbound

Outbound

Transactions

Dashboard

Reports

Search
```

---

# Data Flow

Inbound

```
User

↓

Create Inbound

↓

Validate Product

↓

Create Batch

↓

Allocate Slot

↓

Update Inventory

↓

Save Transaction
```

Outbound

```
User

↓

Create Outbound

↓

Search Inventory

↓

Apply FEFO

↓

Reserve Inventory

↓

Update Inventory

↓

Save Transaction
```

---

# Project Structure

```
warehouse-management-system

apps
├── backend
└── frontend

packages
└── shared-types

docs

docker
```

---

# Deployment Architecture

```
GitHub

↓

GitHub Actions

↓

Frontend
(Vercel)

Backend
(Render)

Database
(Neon PostgreSQL)

Cache
(Upstash Redis)
```

---

# Future Enhancements

- Barcode scanning
- QR Code support
- Warehouse heat map
- AI slot recommendation
- Demand forecasting
- Purchase order management
- Supplier management
- Notification system
- Audit logs
- Multi-warehouse synchronization