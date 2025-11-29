/**
 * Utility functions for JWT token handling
 */

/**
 * Decode JWT token payload without verification
 * Note: This is for client-side use only, not for security validation
 */
export function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

/**
 * Extract user information from JWT token
 */
export function extractUserFromToken(token: string) {
  const payload = decodeJwtPayload(token)
  
  if (!payload) {
    console.error('Failed to decode JWT payload')
    return null
  }
  
  console.log('JWT Payload:', payload)
  
  // Map JWT payload to User interface based on the sample token structure
  // Sample payload: { sub: "1587602a-6678-43cc-a8eb-361115029a5", type: "USER", username: "sa", fullName: "System Administrator", userAgent: "...", iat: 1758801061, exp: 1758837061 }
  return {
    id: payload.sub || '',
    accountNo: payload.username || '',
    email: payload.email || (payload.username ? `${payload.username}@example.com` : ''),
    firstName: payload.firstName || payload.username || 'User',
    lastName: payload.lastName || '',
    fullName: payload.fullName || (payload.firstName && payload.lastName ? `${payload.firstName} ${payload.lastName}` : payload.firstName || payload.username || 'User'),
    phone: payload.phone || '',
    avatar: payload.avatar || '',
    role: payload.role || (payload.type ? [payload.type] : ['USER']),
    isActive: true,
    createdAt: new Date(payload.iat * 1000).toISOString(),
    updatedAt: new Date(payload.iat * 1000).toISOString(),
    lastLoginAt: new Date(payload.iat * 1000).toISOString(),
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  
  if (!payload || !payload.exp) {
    return true
  }
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const payload = decodeJwtPayload(token)
  
  if (!payload || !payload.exp) {
    return null
  }
  
  return payload.exp * 1000
}
