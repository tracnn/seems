/**
 * Test file để kiểm tra API structure
 * File này có thể xóa sau khi test xong
 */

import { authService, userService, orderService, productService } from './services'
import type { LoginRequest, CreateUserRequest } from './types'

// Test functions (không chạy thực tế, chỉ để kiểm tra types)
export const testApiStructure = {
  // Test Auth API
  async testAuth() {
    const loginData: LoginRequest = {
      usernameOrEmail: 'test',
      password: 'password123'
    }
    
    // Test login
    const loginResponse = await authService.login(loginData)
    console.log('Login response:', loginResponse)
    
    // Test get current user
    const currentUser = await authService.getCurrentUser()
    console.log('Current user:', currentUser)
    
    // Test logout
    await authService.logout()
  },

  // Test User API
  async testUser() {
    // Test get users with pagination
    const users = await userService.getUsers({
      page: 1,
      pageSize: 10,
      search: 'john'
    })
    console.log('Users:', users)
    
    // Test create user
    const newUserData: CreateUserRequest = {
      accountNo: 'USER001',
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    }
    
    const newUser = await userService.createUser(newUserData)
    console.log('New user:', newUser)
    
    // Test update user
    const updatedUser = await userService.updateUser(newUser.id, {
      firstName: 'Jane',
      lastName: 'Smith'
    })
    console.log('Updated user:', updatedUser)
  },

  // Test Order API
  async testOrder() {
    // Test get orders
    const orders = await orderService.getOrders({
      page: 1,
      pageSize: 10,
      sortBy: 'orderDate',
      sortOrder: 'desc'
    })
    console.log('Orders:', orders)
    
    // Test get recent orders
    const recentOrders = await orderService.getRecentOrders(5)
    console.log('Recent orders:', recentOrders)
    
    // Test get order stats
    const stats = await orderService.getOrderStats()
    console.log('Order stats:', stats)
  },

  // Test Product API
  async testProduct() {
    // Test get products
    const products = await productService.getProducts({
      page: 1,
      pageSize: 10,
      filters: { category: 'Electronics' }
    })
    console.log('Products:', products)
    
    // Test get categories
    const categories = await productService.getCategories()
    console.log('Categories:', categories)
    
    // Test search products
    const searchResults = await productService.searchProducts('laptop', {
      page: 1,
      pageSize: 5
    })
    console.log('Search results:', searchResults)
  }
}

// Test API response structures
export const testResponseStructures = {
  // Test paginated response structure
  testPaginatedResponse() {
    const mockPaginatedResponse = {
      data: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3
      },
      message: 'Success',
      status: 200
    }
    
    console.log('Paginated response structure:', mockPaginatedResponse)
    return mockPaginatedResponse
  },

  // Test single item response structure
  testSingleResponse() {
    const mockSingleResponse = {
      data: {
        id: '1',
        name: 'Single Item',
        email: 'item@example.com'
      },
      message: 'Success',
      status: 200
    }
    
    console.log('Single response structure:', mockSingleResponse)
    return mockSingleResponse
  }
}

// Export for testing
export default {
  testApiStructure,
  testResponseStructures
}
