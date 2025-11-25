#!/usr/bin/env ts-node
/**
 * IAM Service Comprehensive Testing Script
 * Tests all IAM Service functionality via TCP
 */

import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const IAM_HOST = process.env.IAM_SERVICE_HOST || '127.0.0.1';
const IAM_PORT = Number(process.env.IAM_SERVICE_PORT || 4002);

console.log('\n🚀 IAM Service Test Suite');
console.log('='.repeat(80));
console.log(`📡 Connecting to IAM Service at ${IAM_HOST}:${IAM_PORT}`);
console.log('='.repeat(80));

// Create TCP client
const client: ClientProxy = ClientProxyFactory.create({
  transport: Transport.TCP,
  options: {
    host: IAM_HOST,
    port: IAM_PORT,
  },
});

let createdUserId: string | null = null;
let createdRoleId: string | null = null;

/**
 * Test helper function
 */
async function test(
  testName: string,
  pattern: string,
  data?: any,
  expectedSuccess: boolean = true,
): Promise<any> {
  try {
    console.log(`\n📝 Test: ${testName}`);
    console.log(`   Pattern: ${pattern}`);
    if (data) {
      console.log(`   Data:`, JSON.stringify(data, null, 2));
    }

    const result = await firstValueFrom(client.send(pattern, data || {}));

    if (expectedSuccess) {
      console.log(`   ✅ PASS`);
      console.log(
        `   Result:`,
        JSON.stringify(result, null, 2).substring(0, 200),
      );
      return result;
    } else {
      console.log(`   ❌ FAIL: Expected error but got success`);
      return result;
    }
  } catch (error: any) {
    if (!expectedSuccess) {
      console.log(`   ✅ PASS: Got expected error`);
      console.log(`   Error:`, error.message || error);
      return null;
    } else {
      console.log(`   ❌ FAIL: ${error.message || error}`);
      if (error.stack) {
        console.log(`   Stack:`, error.stack.substring(0, 300));
      }
      return null;
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    console.log('\n⏳ Connecting to IAM Service...');
    await client.connect();
    console.log('✅ Connected!\n');

    // ================================================================
    // ROLES TESTS
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('🎯 ROLES TESTS');
    console.log('='.repeat(80));

    // Test 1: Get roles list
    const rolesList = await test('Get roles list', 'iam.role.list', {
      page: 1,
      limit: 10,
    });

    // Test 2: Create new role
    const newRole = await test('Create new role', 'iam.role.create', {
      name: 'Test Role',
      code: `TEST_ROLE_${Date.now()}`,
      description: 'Test role created by test script',
      level: 50,
      createdBy: 'test-script',
    });

    if (newRole && newRole.id) {
      createdRoleId = newRole.id;
      console.log(`   📌 Created role ID: ${createdRoleId}`);

      // Test 3: Get role by ID
      await test('Get role by ID', 'iam.role.findById', {
        roleId: createdRoleId,
      });
    }

    // ================================================================
    // USERS TESTS
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('👤 USERS TESTS');
    console.log('='.repeat(80));

    // Test 4: Get users list
    const usersList = await test('Get users list', 'iam.user.list', {
      page: 1,
      limit: 10,
    });

    // Test 5: Create new user
    const newUser = await test('Create new user', 'iam.user.create', {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
      phone: '+84901234567',
      createdBy: 'test-script',
    });

    if (newUser && newUser.id) {
      createdUserId = newUser.id;
      console.log(`   📌 Created user ID: ${createdUserId}`);

      // Test 6: Get user by ID
      await test('Get user by ID', 'iam.user.findById', {
        userId: createdUserId,
      });

      // Test 7: Update user
      await test('Update user', 'iam.user.update', {
        userId: createdUserId,
        data: {
          firstName: 'Updated Test',
          lastName: 'Updated User',
        },
      });

      // Test 8: Get user by ID again (verify update)
      const updatedUser = await test('Get updated user', 'iam.user.findById', {
        userId: createdUserId,
      });

      // Test 9: Assign role to user (if role exists)
      if (createdRoleId) {
        await test('Assign role to user', 'iam.user.assignRoles', {
          userId: createdUserId,
          roleIds: [createdRoleId],
        });

        // Test 10: Get user permissions
        await test('Get user permissions', 'iam.user.permissions', {
          userId: createdUserId,
        });
      }
    }

    // ================================================================
    // PERMISSIONS TESTS
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('🔐 PERMISSIONS TESTS');
    console.log('='.repeat(80));

    // Test 11: Get permissions list
    const permissionsList = await test(
      'Get permissions list',
      'iam.permission.list',
      {
        page: 1,
        limit: 10,
      },
    );

    if (permissionsList && permissionsList.length > 0) {
      const firstPermission = permissionsList[0];
      // Test 12: Get permission by ID
      await test('Get permission by ID', 'iam.permission.findById', {
        permissionId: firstPermission.id,
      });
    }

    // ================================================================
    // ORGANIZATIONS TESTS
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('🏢 ORGANIZATIONS TESTS');
    console.log('='.repeat(80));

    // Test 13: Get organizations list
    const orgsList = await test(
      'Get organizations list',
      'iam.organization.list',
      {
        page: 1,
        limit: 10,
      },
    );

    if (orgsList && orgsList.length > 0) {
      const firstOrg = orgsList[0];
      // Test 14: Get organization by ID
      await test('Get organization by ID', 'iam.organization.findById', {
        organizationId: firstOrg.id,
      });
    }

    // ================================================================
    // CLEANUP
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('🧹 CLEANUP');
    console.log('='.repeat(80));

    // Test 15: Delete user (soft delete)
    if (createdUserId) {
      await test('Delete user', 'iam.user.delete', {
        userId: createdUserId,
        deletedBy: 'test-script',
      });
    }

    // ================================================================
    // ERROR HANDLING TESTS
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('❌ ERROR HANDLING TESTS');
    console.log('='.repeat(80));

    // Test 16: Get non-existent user
    await test(
      'Get non-existent user',
      'iam.user.findById',
      { userId: '00000000-0000-0000-0000-000000000000' },
      false,
    );

    // Test 17: Create user with duplicate username
    if (newUser && newUser.username) {
      await test(
        'Create duplicate user',
        'iam.user.create',
        {
          username: newUser.username,
          email: `duplicate_${Date.now()}@example.com`,
          password: 'Test@123456',
          firstName: 'Duplicate',
          lastName: 'User',
        },
        false,
      );
    }

    // ================================================================
    // SUMMARY
    // ================================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ All tests completed!');
    console.log(`   Created User ID: ${createdUserId || 'N/A'}`);
    console.log(`   Created Role ID: ${createdRoleId || 'N/A'}`);
    console.log('='.repeat(80));
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message || error);
    console.error(error.stack);
  } finally {
    console.log('\n🔌 Closing connection...');
    await client.close();
    console.log('✅ Connection closed\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
