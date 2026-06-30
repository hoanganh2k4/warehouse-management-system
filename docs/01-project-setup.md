# Project Setup

## Overview

This document describes how to set up the local development environment for the Smart Warehouse Management System.

---

# Requirements

- Docker Desktop
- Docker Compose
- Node.js (LTS)
- npm
- Git
- VS Code

Verify installation:

```bash
docker --version
docker compose version
node -v
npm -v
git --version
```

---

# Clone Repository

```bash
git clone <repository-url>

cd warehouse-management-system
```

---

# Start Infrastructure

Run:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

Expected containers:

- smart-wms-postgres
- smart-wms-pgadmin
- smart-wms-redis

---

# PostgreSQL

| Property | Value |
|----------|-------|
| Image | postgres:17 |
| Port | 5432 |
| Database | smart_wms |
| Username | postgres |
| Password | postgres |

---

# pgAdmin

Open:

http://localhost:5050

Login:

Email

```
admin@smartwms.com
```

Password

```
admin
```

---

# Register PostgreSQL Server

General

| Field | Value |
|--------|-------|
| Name | Smart WMS Local |

Connection

| Field | Value |
|--------|-------|
| Host | postgres |
| Port | 5432 |
| Database | smart_wms |
| Username | postgres |
| Password | postgres |

Enable:

- Save Password

Click **Save**.

Expected structure:

```
Servers
└── Smart WMS Local
    └── Databases
        └── smart_wms
```

---

# Redis

Port

```
6379
```

---

# Stop Services

```bash
docker compose down
```

---

# Remove Containers and Volumes

```bash
docker compose down -v
```