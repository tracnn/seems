import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from '../../../auth-service.module';
import { IamClientService } from '../../clients/iam-client.service';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

/**
 * Auth Service Seed
 * Note: User creation is delegated to IAM Service
 * This seed creates test users via IAM Service TCP communication
 */
async function seed() {
  const logger = new Logger('Auth-Seed');

  logger.log('Starting Auth Service seed...');

  const app = await NestFactory.createApplicationContext(AuthServiceModule);

  try {
    const iamClient = app.get(IamClientService);

    // Wait for IAM connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user already exists in IAM Service
    const existingUser = await iamClient.getUserByEmail('john.doe@example.com');

    if (existingUser) {
      logger.warn('User john.doe@example.com already exists. Skipping...');
    } else {
      logger.log('Creating test user via IAM Service...');

      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create test user via IAM Service (TCP)
      const user = await iamClient.createUser({
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        createdBy: 'seed-script',
      });

      logger.log(`✅ User created successfully: ${user.id}`);
      logger.log(`📧 Email: ${user.email}`);
      logger.log(`👤 Username: ${user.username}`);
      logger.log(`🔑 Password: password123`);
    }

    logger.log('✅ Seed completed successfully!');
  } catch (error) {
    logger.error('❌ Seed failed:', error.message);
    logger.error('Make sure IAM Service is running on port 3003');
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
