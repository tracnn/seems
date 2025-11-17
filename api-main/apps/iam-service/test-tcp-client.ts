import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

/**
 * Test TCP Client for IAM Service
 * Usage: npx ts-node apps/iam-service/test-tcp-client.ts
 */
async function testIamServiceTcp() {
  console.log('🧪 Testing IAM Service TCP Communication...\n');

  // Create TCP client
  const client = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3003,
    },
  });

  try {
    // Connect
    console.log('📡 Connecting to IAM Service...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Test 1: Create User
    console.log('📝 Test 1: Creating user...');
    const newUser = await firstValueFrom(
      client.send('iam.user.create', {
        username: 'tcp_test_user',
        email: 'tcp_test@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'TCP',
        lastName: 'Test',
        createdBy: 'test-script',
      }).pipe(timeout(5000)),
    );
    console.log('✅ User created:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
    console.log();

    // Test 2: Get User by ID
    console.log('📝 Test 2: Getting user by ID...');
    const user = await firstValueFrom(
      client.send('iam.user.findById', { userId: newUser.id }).pipe(timeout(5000)),
    );
    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
    });
    console.log();

    // Test 3: List Users
    console.log('📝 Test 3: Listing users...');
    const usersList = await firstValueFrom(
      client.send('iam.user.list', {
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }).pipe(timeout(5000)),
    );
    console.log('✅ Users list:', {
      total: usersList.total,
      page: usersList.page,
      limit: usersList.limit,
      totalPages: usersList.totalPages,
      usersCount: usersList.data.length,
    });
    console.log();

    // Test 4: Update User
    console.log('📝 Test 4: Updating user...');
    const updatedUser = await firstValueFrom(
      client.send('iam.user.update', {
        userId: newUser.id,
        updates: {
          firstName: 'TCP Updated',
          phone: '+1234567890',
        },
        updatedBy: 'test-script',
      }).pipe(timeout(5000)),
    );
    console.log('✅ User updated:', {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      phone: updatedUser.phone,
    });
    console.log();

    // Test 5: Get User Permissions
    console.log('📝 Test 5: Getting user permissions...');
    const permissions = await firstValueFrom(
      client.send('iam.user.getPermissions', { userId: newUser.id }).pipe(timeout(5000)),
    );
    console.log('✅ User permissions:', permissions.length);
    console.log();

    // Test 6: Delete User
    console.log('📝 Test 6: Deleting user...');
    const deleteResult = await firstValueFrom(
      client.send('iam.user.delete', {
        userId: newUser.id,
        deletedBy: 'test-script',
      }).pipe(timeout(5000)),
    );
    console.log('✅ User deleted:', deleteResult);
    console.log();

    console.log('🎉 All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await client.close();
    console.log('👋 Disconnected from IAM Service');
  }
}

// Run tests
testIamServiceTcp()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

