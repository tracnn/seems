import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from '@/components/profile-dropdown'

/**
 * Test component để kiểm tra thông tin người dùng
 */
export function TestUserInfo() {
  const { auth } = useAuthStore()
  const { user, isAuthenticated, accessToken } = auth

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Information Test</CardTitle>
          <CardDescription>
            Kiểm tra thông tin người dùng hiển thị trong ProfileDropdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Status */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Authentication Status:</span>
            <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>

          {/* User Data */}
          <div className="space-y-2">
            <h3 className="font-semibold">User Data from Auth Store:</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>

          {/* Token Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Access Token:</h3>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm break-all">
                {accessToken ? `${accessToken.substring(0, 50)}...` : 'No token'}
              </code>
            </div>
          </div>

          {/* Profile Dropdown Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Profile Dropdown Component:</h3>
            <div className="flex items-center gap-4">
              <span>Click to test:</span>
              <ProfileDropdown />
            </div>
          </div>

          {/* Expected Display Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Expected Display Information:</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div>
                <strong>Display Name:</strong> {
                  user?.fullName 
                    ? user.fullName
                    : user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName 
                    ? user.firstName
                    : user?.accountNo 
                    ? user.accountNo
                    : 'User'
                }
              </div>
              <div>
                <strong>Full Name:</strong> {user?.fullName || 'Not set'}
              </div>
              <div>
                <strong>Display Email:</strong> {
                  user?.email || (user?.accountNo ? `${user.accountNo}@example.com` : 'user@example.com')
                }
              </div>
              <div>
                <strong>Avatar Initials:</strong> {
                  user?.firstName && user?.lastName 
                    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                    : user?.firstName 
                    ? user.firstName.charAt(0).toUpperCase()
                    : user?.accountNo 
                    ? user.accountNo.substring(0, 2).toUpperCase()
                    : 'U'
                }
              </div>
              <div>
                <strong>Role:</strong> {user?.role ? user.role.join(', ') : 'No role'}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Instructions:</h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Đăng nhập với username: <code>sa</code>, password: <code>password123</code></li>
                <li>Kiểm tra thông tin người dùng hiển thị ở góc trên bên phải</li>
                <li>Click vào avatar để xem dropdown menu</li>
                <li>Kiểm tra tên, email, và role hiển thị đúng</li>
                <li>Test chức năng logout</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
