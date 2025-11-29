import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/api'
import { toast } from 'sonner'

/**
 * Test component for login functionality
 * This component can be used to test the login API integration
 */
export function TestLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('sa')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const loginMutation = useLogin()

  const handleTestLogin = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await loginMutation.mutateAsync({
        usernameOrEmail,
        password,
      })
      
      setResult({
        success: true,
        data: {
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
        }
      })
      
      toast.success('Đăng nhập thành công!')
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Đăng nhập thất bại'
      })
      
      toast.error('Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Login Functionality</CardTitle>
          <CardDescription>
            Test the login API integration with the backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <Button 
            onClick={handleTestLogin} 
            disabled={isLoading || !usernameOrEmail || !password}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Login'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
