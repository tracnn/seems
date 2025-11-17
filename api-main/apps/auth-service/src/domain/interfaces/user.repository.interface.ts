import { User } from '../entities/user.entity';

/**
 * Auth Service User Repository Interface
 * Read-only operations for authentication purposes
 * User creation/update is handled by IAM Service
 */
export interface IUserRepository {
  // Read operations only
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  
  // Special operations for auth flow
  updateLastLogin(id: string): Promise<void>;
  updateEmailVerified(id: string, isVerified: boolean): Promise<void>;
}

