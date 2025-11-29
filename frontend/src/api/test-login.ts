/**
 * Test script for login functionality
 * This file can be used to test the login API integration
 */

import { authService } from './services/auth.service'

/**
 * Test login with sample credentials
 */
export async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...')
    
    const credentials = {
      usernameOrEmail: 'sa',
      password: 'password123'
    }
    
    console.log('📤 Sending login request with credentials:', credentials)
    
    const response = await authService.login(credentials)
    
    console.log('✅ Login successful!')
    console.log('📥 Response:', {
      user: {
        id: response.user.id,
        accountNo: response.user.accountNo,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
      },
      accessToken: response.accessToken.substring(0, 50) + '...',
      refreshToken: response.refreshToken.substring(0, 50) + '...',
      expiresIn: response.expiresIn,
    })
    
    return response
  } catch (error) {
    console.error('❌ Login failed:', error)
    throw error
  }
}

/**
 * Test login with invalid credentials
 */
export async function testLoginWithInvalidCredentials() {
  try {
    console.log('🧪 Testing login with invalid credentials...')
    
    const credentials = {
      usernameOrEmail: 'invalid_user',
      password: 'wrong_password'
    }
    
    console.log('📤 Sending login request with invalid credentials:', credentials)
    
    const response = await authService.login(credentials)
    
    console.log('⚠️ Unexpected success with invalid credentials:', response)
    return response
  } catch (error: any) {
    console.log('✅ Expected error with invalid credentials:', error.message)
    return null
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).testLogin = testLogin
  ;(window as any).testLoginWithInvalidCredentials = testLoginWithInvalidCredentials
}
