import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useAuthStore } from '@/stores/authStore'
import { useLogin } from '@/hooks/api'
import { toast } from 'sonner'

/**
 * Test component để kiểm tra fullName functionality
 */
export function TestFullName() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('sa')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  
  const { auth } = useAuthStore()
  const { user } = auth
  const loginMutation = useLogin()
  
  const addResult = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testLoginWithFullName = async () => {
    setIsLoading(true)
    addResult('info', 'Testing login with fullName support...', { usernameOrEmail, password })
    
    try {
      const response = await loginMutation.mutateAsync({
        usernameOrEmail,
        password
      })
      
      addResult('success', 'Login successful!', {
        user: {
          id: response.user.id,
          accountNo: response.user.accountNo,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          fullName: response.user.fullName,
          role: response.user.role,
        },
        accessToken: response.accessToken.substring(0, 50) + '...',
        refreshToken: response.refreshToken.substring(0, 50) + '...',
      })
      
      toast.success('Đăng nhập thành công!')
      
    } catch (error: any) {
      addResult('error', `Login failed: ${error.message}`)
      toast.error('Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test FullName Functionality</CardTitle>
          <CardDescription>
            Test login và hiển thị fullName trong ProfileDropdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail">Username or Email</Label>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter username or email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={testLoginWithFullName} 
                  disabled={isLoading || !usernameOrEmail || !password}
                >
                  Test Login with FullName
                </Button>
                <Button 
                  onClick={clearResults} 
                  variant="ghost"
                  size="sm"
                >
                  Clear Results
                </Button>
              </div>
            </div>
            
            {/* Current User Info */}
            <div className="space-y-2">
              <h3 className="font-semibold">Current User Info</h3>
              <div className="text-sm space-y-1">
                <div><strong>Authenticated:</strong> 
                  <Badge variant={auth.isAuthenticated ? 'default' : 'destructive'} className="ml-2">
                    {auth.isAuthenticated ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {user && (
                  <>
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Account No:</strong> {user.accountNo}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>First Name:</strong> {user.firstName || 'Not set'}</div>
                    <div><strong>Last Name:</strong> {user.lastName || 'Not set'}</div>
                    <div><strong>Full Name:</strong> {user.fullName || 'Not set'}</div>
                    <div><strong>Role:</strong> {user.role?.join(', ') || 'Not set'}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Dropdown Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Profile Dropdown Test</h3>
            <div className="flex items-center gap-4">
              <span>Click to test fullName display:</span>
              <ProfileDropdown />
            </div>
          </div>
          
          {/* Expected Display Logic */}
          <div className="space-y-2">
            <h3 className="font-semibold">Display Name Logic</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm space-y-1">
                <div><strong>Priority Order:</strong></div>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>user.fullName (if exists)</li>
                  <li>firstName + lastName (if both exist)</li>
                  <li>firstName (if exists)</li>
                  <li>accountNo (fallback)</li>
                  <li>'User' (default)</li>
                </ol>
                <div className="mt-2">
                  <strong>Current Display Name:</strong> {
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
              </div>
            </div>
          </div>
          
          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result) => (
                  <div key={result.id} className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={
                          result.type === 'success' ? 'default' : 
                          result.type === 'error' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {result.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {result.message}
                    </div>
                    {result.data && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
