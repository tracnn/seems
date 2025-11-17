-- IAM Service Database Schema Check
-- Run this to verify all columns exist

SET SERVEROUTPUT ON;

DECLARE
  v_count NUMBER;
BEGIN
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('IAM Service Schema Verification');
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('');
  
  -- Check USERS table
  DBMS_OUTPUT.PUT_LINE('Checking USERS table...');
  
  SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'USERS';
  DBMS_OUTPUT.PUT_LINE('  Total columns: ' || v_count);
  
  -- Check specific columns
  FOR col IN (
    SELECT 'ID' as col_name FROM dual UNION ALL
    SELECT 'USERNAME' FROM dual UNION ALL
    SELECT 'EMAIL' FROM dual UNION ALL
    SELECT 'PASSWORD' FROM dual UNION ALL
    SELECT 'FIRST_NAME' FROM dual UNION ALL
    SELECT 'LAST_NAME' FROM dual UNION ALL
    SELECT 'PHONE' FROM dual UNION ALL
    SELECT 'AVATAR_URL' FROM dual UNION ALL
    SELECT 'IS_EMAIL_VERIFIED' FROM dual UNION ALL
    SELECT 'LAST_LOGIN_AT' FROM dual UNION ALL
    SELECT 'CREATED_AT' FROM dual UNION ALL
    SELECT 'UPDATED_AT' FROM dual UNION ALL
    SELECT 'CREATED_BY' FROM dual UNION ALL
    SELECT 'UPDATED_BY' FROM dual UNION ALL
    SELECT 'DELETED_AT' FROM dual UNION ALL
    SELECT 'DELETED_BY' FROM dual
  ) LOOP
    SELECT COUNT(*) INTO v_count 
    FROM user_tab_columns 
    WHERE table_name = 'USERS' 
    AND column_name = col.col_name;
    
    IF v_count > 0 THEN
      DBMS_OUTPUT.PUT_LINE('  ✓ ' || col.col_name);
    ELSE
      DBMS_OUTPUT.PUT_LINE('  ✗ MISSING: ' || col.col_name);
    END IF;
  END LOOP;
  
  DBMS_OUTPUT.PUT_LINE('');
  
  -- Check ROLES table
  DBMS_OUTPUT.PUT_LINE('Checking ROLES table...');
  SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'ROLES';
  DBMS_OUTPUT.PUT_LINE('  Total columns: ' || v_count);
  
  FOR col IN (
    SELECT 'ID' as col_name FROM dual UNION ALL
    SELECT 'NAME' FROM dual UNION ALL
    SELECT 'CODE' FROM dual UNION ALL
    SELECT 'DESCRIPTION' FROM dual UNION ALL
    SELECT 'LEVEL' FROM dual UNION ALL
    SELECT 'CREATED_AT' FROM dual UNION ALL
    SELECT 'UPDATED_AT' FROM dual UNION ALL
    SELECT 'CREATED_BY' FROM dual UNION ALL
    SELECT 'UPDATED_BY' FROM dual UNION ALL
    SELECT 'DELETED_AT' FROM dual
  ) LOOP
    SELECT COUNT(*) INTO v_count 
    FROM user_tab_columns 
    WHERE table_name = 'ROLES' 
    AND column_name = col.col_name;
    
    IF v_count > 0 THEN
      DBMS_OUTPUT.PUT_LINE('  ✓ ' || col.col_name);
    ELSE
      DBMS_OUTPUT.PUT_LINE('  ✗ MISSING: ' || col.col_name);
    END IF;
  END LOOP;
  
  DBMS_OUTPUT.PUT_LINE('');
  
  -- Check PERMISSIONS table
  DBMS_OUTPUT.PUT_LINE('Checking PERMISSIONS table...');
  SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'PERMISSIONS';
  DBMS_OUTPUT.PUT_LINE('  Total columns: ' || v_count);
  
  DBMS_OUTPUT.PUT_LINE('');
  
  -- Check ORGANIZATIONS table
  DBMS_OUTPUT.PUT_LINE('Checking ORGANIZATIONS table...');
  SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'ORGANIZATIONS';
  DBMS_OUTPUT.PUT_LINE('  Total columns: ' || v_count);
  
  DBMS_OUTPUT.PUT_LINE('');
  
  -- Check junction tables
  DBMS_OUTPUT.PUT_LINE('Checking junction tables...');
  SELECT COUNT(*) INTO v_count FROM user_tables WHERE table_name = 'USER_ROLES';
  IF v_count > 0 THEN
    DBMS_OUTPUT.PUT_LINE('  ✓ USER_ROLES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('  ✗ MISSING: USER_ROLES');
  END IF;
  
  SELECT COUNT(*) INTO v_count FROM user_tables WHERE table_name = 'ROLE_PERMISSIONS';
  IF v_count > 0 THEN
    DBMS_OUTPUT.PUT_LINE('  ✓ ROLE_PERMISSIONS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('  ✗ MISSING: ROLE_PERMISSIONS');
  END IF;
  
  SELECT COUNT(*) INTO v_count FROM user_tables WHERE table_name = 'USER_ORGANIZATIONS';
  IF v_count > 0 THEN
    DBMS_OUTPUT.PUT_LINE('  ✓ USER_ORGANIZATIONS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('  ✗ MISSING: USER_ORGANIZATIONS');
  END IF;
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('Schema check complete!');
  DBMS_OUTPUT.PUT_LINE('========================================');
END;
/

-- Show actual column details for USERS
SELECT 
  column_name,
  data_type,
  data_length,
  nullable,
  data_default
FROM user_tab_columns
WHERE table_name = 'USERS'
ORDER BY column_id;

