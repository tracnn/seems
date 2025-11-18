# Fix: ORA-00904 - AVATAR_URL Invalid Identifier

## ❌ Error

```
IAM Service error: ORA-00904: "user"."AVATAR_URL": invalid identifier
Help: https://docs.oracle.com/error-help/db/ora-00904/
```

## 🔍 Root Cause

The `User` entity in IAM Service has an `avatarUrl` field mapped to `AVATAR_URL` column, but this column doesn't exist in the Oracle database `USERS` table.

**User Entity:**
```typescript
@Entity('USERS')
export class User extends BaseEntity {
  // ... other columns
  
  @Column({
    name: 'AVATAR_URL',      // ❌ Column doesn't exist in database
    length: 500,
    nullable: true,
  })
  avatarUrl: string;
}
```

## ✅ Solution

### Option 1: Quick Fix - Run SQL Script (Recommended)

Connect to Oracle database and run:

```bash
sqlplus username/password@database
@apps/iam-service/sql/add-avatar-url-column.sql
```

Or manually:

```sql
-- Add AVATAR_URL column to USERS table
ALTER TABLE USERS ADD AVATAR_URL VARCHAR2(500);

-- Add comment
COMMENT ON COLUMN USERS.AVATAR_URL IS 'User avatar/profile picture URL';

-- Verify
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns
WHERE table_name = 'USERS'
AND column_name = 'AVATAR_URL';

COMMIT;
```

### Option 2: TypeORM Migration (Programmatic)

Run TypeORM migration:

```bash
# Generate migration (if needed)
npm run typeorm:generate-migration AddAvatarUrlToUsers -- iam-service

# Run migration
npm run typeorm:run-migration -- iam-service
```

The migration file is already created at:
```
apps/iam-service/src/infrastructure/database/migrations/1731824000000-AddAvatarUrlToUsers.ts
```

## 📋 Migration Details

### Column Specifications

| Property | Value |
|----------|-------|
| Column Name | `AVATAR_URL` |
| Data Type | `VARCHAR2` |
| Length | `500` |
| Nullable | `YES` |
| Default | `NULL` |
| Description | User avatar/profile picture URL |

### SQL Statement

```sql
ALTER TABLE USERS ADD AVATAR_URL VARCHAR2(500);
```

## 🔄 Complete Database Schema Update

If you need to add **all missing columns** from entities to database, run the complete setup:

### 1. Check Current Schema

```sql
-- List all columns in USERS table
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns
WHERE table_name = 'USERS'
ORDER BY column_id;
```

### 2. Expected Columns in USERS Table

According to `User` entity:

```
ID                  VARCHAR2(36)   NOT NULL  PRIMARY KEY
USERNAME            VARCHAR2(100)  NOT NULL  UNIQUE
EMAIL               VARCHAR2(255)  NOT NULL  UNIQUE
PASSWORD            VARCHAR2(255)  NOT NULL
FIRST_NAME          VARCHAR2(100)  NULL
LAST_NAME           VARCHAR2(100)  NULL
PHONE               VARCHAR2(20)   NULL
AVATAR_URL          VARCHAR2(500)  NULL      ← Missing!
IS_EMAIL_VERIFIED   NUMBER(1)      DEFAULT 0
LAST_LOGIN_AT       TIMESTAMP      NULL
CREATED_AT          TIMESTAMP      NOT NULL
UPDATED_AT          TIMESTAMP      NOT NULL
CREATED_BY          VARCHAR2(36)   NULL
UPDATED_BY          VARCHAR2(36)   NULL
DELETED_AT          TIMESTAMP      NULL
```

### 3. Run Complete Schema Sync (Development Only)

**⚠️ WARNING: Only use in development! This will drop and recreate tables!**

```typescript
// In database.config.ts
export default () => ({
  database: {
    // ...
    synchronize: true,  // ⚠️ Development only!
    // ...
  },
});
```

Then restart IAM Service:
```bash
npm run start:dev iam-service
```

**For production, always use migrations!**

## ✅ Verification

After running the migration, verify the column exists:

### 1. SQL Verification

```sql
-- Check column exists
SELECT COUNT(*) as column_exists
FROM user_tab_columns
WHERE table_name = 'USERS'
AND column_name = 'AVATAR_URL';

-- Expected result: 1

-- Check column details
DESC USERS;
```

### 2. Application Test

```bash
# Start IAM Service
npm run start:dev iam-service

# Should start without ORA-00904 error
# Look for: ✅ IAM Service is running and listening for TCP messages
```

### 3. Create User Test

```bash
curl -X POST http://localhost:3000/api/v1/iam/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.user",
    "email": "test@example.com",
    "password": "Test@123",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'

# Should return user with avatarUrl
```

## 🔧 Files Created/Modified

### Created:
1. `apps/iam-service/src/infrastructure/database/migrations/1731824000000-AddAvatarUrlToUsers.ts`
   - TypeORM migration file

2. `apps/iam-service/sql/add-avatar-url-column.sql`
   - SQL script for manual execution

3. `apps/iam-service/FIX_AVATAR_URL_COLUMN.md`
   - This documentation

### No modifications needed:
- `user.entity.ts` - Already has avatarUrl field defined correctly

## 📚 Related Issues

### Similar Column Missing Errors

If you encounter other `ORA-00904` errors for different columns:

1. **Check entity definition** in `apps/iam-service/src/domain/entities/`
2. **Compare with database** using `DESC table_name`
3. **Create migration** for missing columns
4. **Run migration** before starting service

### Common Missing Columns Checklist

For USERS table:
- [x] AVATAR_URL (Fixed in this migration)
- [ ] Check other tables if needed

For other entities:
- Check `UserRole` entity vs `USER_ROLES` table
- Check `UserOrganization` entity vs `USER_ORGANIZATIONS` table
- Check `Role`, `Permission`, `Organization` entities

## 🎯 Best Practices

### 1. Always Use Migrations in Production

```typescript
// ✅ Good: Use migrations
export default () => ({
  database: {
    synchronize: false,  // Always false in production
    migrationsRun: true, // Auto-run migrations
  },
});
```

### 2. Version Control Migrations

```
git add apps/iam-service/src/infrastructure/database/migrations/
git commit -m "feat: add AVATAR_URL column to USERS table"
```

### 3. Test Migrations

```bash
# Test up
npm run typeorm:run-migration

# Test down (rollback)
npm run typeorm:revert-migration
```

### 4. Document Schema Changes

Update `apps/iam-service/README.md` with:
- Database schema version
- Migration history
- Required columns

## 🚀 Quick Commands

```bash
# Run SQL script (fastest)
sqlplus user/pass@db @apps/iam-service/sql/add-avatar-url-column.sql

# Or via TypeORM migration
npm run typeorm:run-migration -- iam-service

# Verify and restart
npm run start:dev iam-service
```

## ✅ Success Indicators

After fix:
- ✅ No `ORA-00904: "user"."AVATAR_URL"` errors in logs
- ✅ IAM Service starts successfully
- ✅ Can create users with avatarUrl field
- ✅ Can update users with avatarUrl field
- ✅ avatarUrl is returned in user responses

---

**Status**: ✅ Fix Available  
**Severity**: Critical (Blocks user operations)  
**Effort**: 2 minutes (SQL script) or 5 minutes (Migration)  
**Impact**: Required for IAM Service to function properly

