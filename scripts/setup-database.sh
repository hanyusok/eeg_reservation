#!/bin/bash

# Script to set up PostgreSQL database for EEG Reservation System
# This script creates the database user and database if they don't exist

set -e

echo "🔧 Setting up PostgreSQL database for EEG Reservation System..."
echo ""

# Read database URL from .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with DATABASE_URL"
    exit 1
fi

# Extract connection details from DATABASE_URL
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env file"
    exit 1
fi

# Parse DATABASE_URL: postgresql://user:password@host:port/database
# Extract user, password, host, port, and database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Database configuration:"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" > /dev/null 2>&1; then
    echo "❌ Error: PostgreSQL is not running or not accessible"
    echo "Please start PostgreSQL first:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Try to connect as postgres user to create the database and user
echo "Attempting to create database and user..."
echo "Note: You may need to enter the postgres user password"
echo ""

# Create user if it doesn't exist
sudo -u postgres psql <<EOF 2>/dev/null || echo "⚠️  Could not create user automatically. You may need to run manually:"
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
EOF

# Create database if it doesn't exist
sudo -u postgres psql <<EOF 2>/dev/null || echo "⚠️  Could not create database automatically. You may need to run manually:"
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo ""
echo "📝 Manual setup instructions (if automatic setup failed):"
echo ""
echo "1. Connect to PostgreSQL as postgres user:"
echo "   sudo -u postgres psql"
echo ""
echo "2. Run these SQL commands:"
echo "   CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
echo "   CREATE DATABASE $DB_NAME OWNER $DB_USER;"
echo "   GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "   \\q"
echo ""
echo "3. Test the connection:"
echo "   PGPASSWORD=$DB_PASS psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -d $DB_NAME -c 'SELECT version();'"
echo ""
echo "4. Initialize the database schema:"
echo "   npm run db:push"
echo ""
