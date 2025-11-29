import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useAuthStore } from '@/stores/authStore'
import { useLogin } from '@/hooks/api'
import { toast } from 'sonner'

/**
 * Debug component để kiểm tra fullName hiển thị
 */
export function DebugFullName() {
  const [isLoading, setIsLoading] = useState(false)
  const [jwtPayload, setJwtPayload] = useState<any>(null)
  
  const { auth } = useAuthStore()
  const { user, accessToken } = auth
  const loginMutation = useLogin()

  // Decode JWT token để xem payload
  const decodeJwtPayload = (token: string) => {
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

  // Update JWT payload when access token changes
  useEffect(() => {
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken)
      setJwtPayload(payload)
    }
  }, [accessToken])

  const testLogin = async () => {
    setIsLoading(true)
    try {
      await loginMutation.mutateAsync({
        usernameOrEmail: 'sa',
        password: 'password123'
      })
      toast.success('Đăng nhập thành công!')
    } catch (error: any) {
      toast.error('Đăng nhập thất bại: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getDisplayName = () => {
    if (user?.fullName) {
      return user.fullName
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    if (user?.accountNo) {
      return user.accountNo
    }
    return 'User'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug FullName Display</CardTitle>
          <CardDescription>
            Kiểm tra fullName hiển thị trong ProfileDropdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login Button */}
          <div className="flex gap-4">
            <Button 
              onClick={testLogin} 
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Login as SA'}
            </Button>
            <Badge variant={auth.isAuthenticated ? 'default' : 'destructive'}>
              {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>

          {/* JWT Payload */}
          {jwtPayload && (
            <div className="space-y-2">
              <h3 className="font-semibold">JWT Payload from Backend:</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {JSON.stringify(jwtPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* User Data from Auth Store */}
          {user && (
            <div className="space-y-2">
              <h3 className="font-semibold">User Data from Auth Store:</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Display Logic */}
          <div className="space-y-2">
            <h3 className="font-semibold">Display Logic:</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div><strong>JWT fullName:</strong> {jwtPayload?.fullName || 'Not found'}</div>
              <div><strong>User fullName:</strong> {user?.fullName || 'Not found'}</div>
              <div><strong>User firstName:</strong> {user?.firstName || 'Not found'}</div>
              <div><strong>User lastName:</strong> {user?.lastName || 'Not found'}</div>
              <div><strong>User accountNo:</strong> {user?.accountNo || 'Not found'}</div>
              <div className="mt-2 p-2 bg-green-100 rounded">
                <strong>Final Display Name:</strong> {getDisplayName()}
              </div>
            </div>
          </div>

          {/* Profile Dropdown Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Profile Dropdown Test:</h3>
            <div className="flex items-center gap-4">
              <span>Click to test:</span>
              <ProfileDropdown />
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="space-y-2">
            <h3 className="font-semibold">Expected vs Actual:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800">Expected:</h4>
                <div className="text-sm space-y-1">
                  <div>JWT: "Super Administrator"</div>
                  <div>Display: "Super Administrator"</div>
                  <div>Avatar: "SA"</div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800">Actual:</h4>
                <div className="text-sm space-y-1">
                  <div>JWT: {jwtPayload?.fullName || 'N/A'}</div>
                  <div>Display: {getDisplayName()}</div>
                  <div>Avatar: {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
