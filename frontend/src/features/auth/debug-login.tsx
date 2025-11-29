import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/api'
import { toast } from 'sonner'

/**
 * Debug component to test API connection and login
 */
export function DebugLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('sa')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  
  const addResult = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testApiConnection = async () => {
    setIsLoading(true)
    addResult('info', 'Testing API connection...')
    
    try {
      // Test basic connection
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: 'test',
          password: 'test'
        })
      })
      
      addResult('success', `API Connection successful! Status: ${response.status}`)
      
      const responseData = await response.text()
      addResult('info', 'Response data:', responseData)
      
    } catch (error: any) {
      addResult('error', `API Connection failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testLogin = async () => {
    setIsLoading(true)
    addResult('info', 'Testing login with credentials...', { usernameOrEmail, password })
    
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        usernameOrEmail,
        password
      })
      
      addResult('success', 'Login successful!', response.data)
      toast.success('Đăng nhập thành công!')
      
    } catch (error: any) {
      addResult('error', `Login failed: ${error.message}`)
      
      if (error.response) {
        addResult('error', `Response status: ${error.response.status}`)
        addResult('error', `Response data:`, error.response.data)
      } else if (error.request) {
        addResult('error', 'No response received from server')
      } else {
        addResult('error', `Request setup error: ${error.message}`)
      }
      
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
          <CardTitle>Debug Login & API Connection</CardTitle>
          <CardDescription>
            Test API connection and login functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Controls */}
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
                  onClick={testApiConnection} 
                  disabled={isLoading}
                  variant="outline"
                >
                  Test API Connection
                </Button>
                <Button 
                  onClick={testLogin} 
                  disabled={isLoading || !usernameOrEmail || !password}
                >
                  Test Login
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
            
            {/* API Info */}
            <div className="space-y-2">
              <h3 className="font-semibold">API Configuration</h3>
              <div className="text-sm space-y-1">
                <div><strong>Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}</div>
                <div><strong>Endpoint:</strong> /api/v1/auth/login</div>
                <div><strong>Method:</strong> POST</div>
                <div><strong>Timeout:</strong> 10s</div>
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
