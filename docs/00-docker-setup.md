# Docker Setup

This document describes how to set up the local infrastructure required for the Smart Warehouse Management System.

The project uses Docker Compose to provision all required services, allowing every developer to work with the same development environment.

---

# Prerequisites

Make sure the following software is installed on your machine:

- Docker Desktop
- Docker Compose

Verify the installation:

```bash
docker --version
docker compose version
```

---

# Infrastructure

The local development environment consists of three services.

| Service | Description | Port |
|----------|-------------|------|
| PostgreSQL | Primary relational database | 5432 |
| pgAdmin | PostgreSQL administration tool | 5050 |
| Redis | Cache and message broker | 6379 |

---

# Start Infrastructure

From the project root, run:

```bash
docker compose up -d
```

Docker Compose will create and start all required containers.

Check the container status:

```bash
docker ps
```

Expected output:

```
smart-wms-postgres
smart-wms-pgadmin
smart-wms-redis
```

---

# PostgreSQL

The PostgreSQL container is configured with the following credentials.

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | smart_wms |
| Username | postgres |
| Password | postgres |

---

# Access pgAdmin

Open the following URL in your browser:

```
http://localhost:5050
```

Login credentials:

| Property | Value |
|----------|-------|
| Email | admin@smartwms.com |
| Password | admin |

---

# Register PostgreSQL Server

After logging into pgAdmin, register the PostgreSQL server.

## General

| Field | Value |
|--------|-------|
| Name | Smart WMS Local |

## Connection

| Field | Value |
|--------|-------|
| Host name/address | postgres |
| Port | 5432 |
| Maintenance database | smart_wms |
| Username | postgres |
| Password | postgres |

Enable:

- ✅ Save Password

Click **Save**.

After a successful connection, the database structure should appear in the navigation panel.

```
Servers
└── Smart WMS Local
    └── Databases
        └── smart_wms
```

---

# Redis

Redis is available at:

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 6379 |

No authentication is required in the local development environment.

---

# Stop Infrastructure

To stop all running containers:

```bash
docker compose down
```

---

# Remove Containers and Volumes

To remove containers, networks and persistent volumes:

```bash
docker compose down -v
```

> **Warning**
>
> This command permanently deletes the PostgreSQL database volume and all local data.

---

# Common Commands

Restart all services:

```bash
docker compose restart
```

View running containers:

```bash
docker ps
```

View logs:

```bash
docker compose logs
```

View logs for a specific service:

```bash
docker compose logs postgres
```

Follow logs in real time:

```bash
docker compose logs -f postgres
```

---

# Troubleshooting

## PostgreSQL container is not running

Check container status:

```bash
docker ps -a
```

Inspect logs:

```bash
docker compose logs postgres
```

---

## pgAdmin cannot connect to PostgreSQL

Verify the following connection settings:

| Field | Value |
|--------|-------|
| Host | postgres |
| Port | 5432 |
| Username | postgres |
| Password | postgres |

Do **not** use `localhost` as the host inside pgAdmin, since both services communicate through the Docker network.

---

## Port Already in Use

If Docker reports that a port is already in use, identify the conflicting process:

```bash
lsof -i :5432
```

or

```bash
sudo netstat -tulpn | grep 5432
```

Stop the conflicting process or change the exposed port in `docker-compose.yml`.

---

# Next Step

After the infrastructure is running successfully, continue with:

- `docs/01-project-setup.md`