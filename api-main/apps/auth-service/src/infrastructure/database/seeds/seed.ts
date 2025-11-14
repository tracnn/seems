import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from '../../../auth-service.module';
import { UserRepository } from '../typeorm/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('Seed');
  
  logger.log('Starting seed...');
  
  const app = await NestFactory.createApplicationContext(AuthServiceModule);
  
  try {
    const userRepository = app.get(UserRepository);
    
    // Check if user already exists
    const existingUser = await userRepository.findByEmail('john.doe@example.com');
    
    if (existingUser) {
      logger.warn('User john.doe@example.com already exists. Skipping...');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create test user
      const user = await userRepository.create({
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: false,
        isActive: true,
        createdBy: 'system',
      });
      
      logger.log(`User created successfully: ${user.id}`);
      logger.log(`Email: ${user.email}`);
      logger.log(`Username: ${user.username}`);
      logger.log('Password: password123');
    }
    
    logger.log('Seed completed successfully!');
  } catch (error) {
    logger.error('Seed failed:', error);
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

