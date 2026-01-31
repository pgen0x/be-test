# Database Setup Guide

This guide describes how to set up a PostgreSQL database and user for this project.

## Prerequisites

- PostgreSQL installed on your system.
- `psql` command-line tool.

## Steps

### 1. Connect to PostgreSQL

Open your terminal and connect to PostgreSQL as the default `postgres` user:

```bash
sudo -u postgres psql
```

### 2. Create a New Database User

Replace `your_user` and `your_password` with your desired credentials:

```sql
CREATE USER your_user WITH PASSWORD 'your_password';
```

### 3. Create a New Database

Replace `your_db_name` with your desired database name:

```sql
CREATE DATABASE your_db_name OWNER your_user;
```

### 4. Grant Privileges

If the database already exists or you need to ensure full access:

```sql
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_user;
```

### 5. Update .env File

Copy the `.env.example` to `.env` (if not already done) and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db_name?schema=public"
```

### 6. Run Migrations

After setting up the database and `.env` file, run the Prisma migrations:

```bash
bun x prisma migrate dev
```
