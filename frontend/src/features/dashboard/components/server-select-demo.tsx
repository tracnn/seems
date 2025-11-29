import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ServerSelect, type FetchParams, type FetchResult, type ColumnDef } from '@/components/ui/server-select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Mock data types
interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive'
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

// Mock data
const mockUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Người dùng ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'User', 'Manager', 'Editor'][i % 4],
  department: ['IT', 'HR', 'Sales', 'Marketing', 'Finance'][i % 5],
  status: i % 3 === 0 ? 'inactive' : 'active'
}))

const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Sản phẩm ${i + 1}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'][i % 5],
  price: Math.floor(Math.random() * 1000) + 100,
  stock: Math.floor(Math.random() * 100)
}))

// Mock API functions
const fetchUsers = async (params: FetchParams): Promise<FetchResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let filteredUsers = [...mockUsers]
  
  // Apply search
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  }
  
  // Apply sorting
  if (params.sortField && params.sortOrder) {
    filteredUsers.sort((a, b) => {
      const aVal = a[params.sortField as keyof User]
      const bVal = b[params.sortField as keyof User]
      
      if (aVal < bVal) return params.sortOrder === 1 ? -1 : 1
      if (aVal > bVal) return params.sortOrder === 1 ? 1 : -1
      return 0
    })
  }
  
  // Apply pagination
  const total = filteredUsers.length
  const start = (params.page - 1) * params.limit
  const end = start + params.limit
  const data = filteredUsers.slice(start, end)
  
  return {
    data,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      pageCount: Math.ceil(total / params.limit),
      hasNext: end < total,
      hasPrev: params.page > 1
    }
  }
}

const fetchProducts = async (params: FetchParams): Promise<FetchResult> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  let filteredProducts = [...mockProducts]
  
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
  }
  
  if (params.sortField && params.sortOrder) {
    filteredProducts.sort((a, b) => {
      const aVal = a[params.sortField as keyof Product]
      const bVal = b[params.sortField as keyof Product]
      
      if (aVal < bVal) return params.sortOrder === 1 ? -1 : 1
      if (aVal > bVal) return params.sortOrder === 1 ? 1 : -1
      return 0
    })
  }
  
  const total = filteredProducts.length
  const start = (params.page - 1) * params.limit
  const end = start + params.limit
  const data = filteredProducts.slice(start, end)
  
  return {
    data,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      pageCount: Math.ceil(total / params.limit),
      hasNext: end < total,
      hasPrev: params.page > 1
    }
  }
}

// Resolve functions
const resolveUser = async (userId: number): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockUsers.find(user => user.id === userId) || null
}

const resolveProduct = async (productId: number): Promise<Product | null> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockProducts.find(product => product.id === productId) || null
}

export const ServerSelectDemo: React.FC = () => {
  // Single selection states
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  
  // Multiple selection states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  
  // Column definitions
  const userColumns: ColumnDef[] = [
    { field: 'name', header: 'Tên', width: '200px' },
    { field: 'email', header: 'Email', width: '250px' },
    { field: 'role', header: 'Vai trò', width: '120px' },
    { field: 'department', header: 'Phòng ban', width: '120px' },
    { field: 'status', header: 'Trạng thái', width: '100px' }
  ]
  
  const productColumns: ColumnDef[] = [
    { field: 'name', header: 'Tên sản phẩm', width: '200px' },
    { field: 'category', header: 'Danh mục', width: '150px' },
    { field: 'price', header: 'Giá (VNĐ)', width: '120px' },
    { field: 'stock', header: 'Tồn kho', width: '100px' }
  ]
  
  const handleUserSelected = (user: User) => {
    console.log('Selected user:', user)
  }
  
  const handleUsersSelected = (users: User[]) => {
    console.log('Selected users:', users)
  }
  
  const handleProductSelected = (product: Product) => {
    console.log('Selected product:', product)
  }
  
  const handleProductsSelected = (products: Product[]) => {
    console.log('Selected products:', products)
  }
  
  const clearAllSelections = () => {
    setSelectedUser(null)
    setSelectedProduct(null)
    setSelectedUsers([])
    setSelectedProducts([])
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ServerSelect Component Demo</h3>
          <p className="text-sm text-muted-foreground">
            Ví dụ sử dụng ServerSelect với server-side pagination, search và selection
          </p>
        </div>
        <Button variant="outline" onClick={clearAllSelections}>
          Xóa tất cả lựa chọn
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Single Selection Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Single Selection</CardTitle>
            <CardDescription>
              Chọn một người dùng từ danh sách
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Người dùng:</label>
              <ServerSelect
                value={selectedUser}
                onChange={setSelectedUser}
                onSelected={handleUserSelected}
                columns={userColumns}
                fetcher={fetchUsers}
                resolveByValue={resolveUser}
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn người dùng..."
                overlayWidth="800px"
                pageSize={10}
                showSearch
                showClear
              />
              {selectedUser && (
                <Badge variant="secondary">
                  Đã chọn: User ID {selectedUser}
                </Badge>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sản phẩm:</label>
              <ServerSelect
                value={selectedProduct}
                onChange={setSelectedProduct}
                onSelected={handleProductSelected}
                columns={productColumns}
                fetcher={fetchProducts}
                resolveByValue={resolveProduct}
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn sản phẩm..."
                overlayWidth="600px"
                pageSize={15}
                showSearch
                showClear
              />
              {selectedProduct && (
                <Badge variant="secondary">
                  Đã chọn: Product ID {selectedProduct}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Multiple Selection Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Multiple Selection</CardTitle>
            <CardDescription>
              Chọn nhiều người dùng và sản phẩm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Người dùng (nhiều):</label>
              <ServerSelect
                value={selectedUsers}
                onChange={setSelectedUsers}
                onSelected={handleUsersSelected}
                multiple
                columns={userColumns}
                fetcher={fetchUsers}
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn nhiều người dùng..."
                overlayWidth="800px"
                pageSize={10}
                showSearch
                showClear
                ensureSelectedVisible
              />
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedUsers.map(userId => (
                    <Badge key={userId} variant="outline">
                      User {userId}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sản phẩm (nhiều):</label>
              <ServerSelect
                value={selectedProducts}
                onChange={setSelectedProducts}
                onSelected={handleProductsSelected}
                multiple
                columns={productColumns}
                fetcher={fetchProducts}
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn nhiều sản phẩm..."
                overlayWidth="600px"
                pageSize={15}
                showSearch
                showClear
                ensureSelectedVisible
              />
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedProducts.map(productId => (
                    <Badge key={productId} variant="outline">
                      Product {productId}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Advanced Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Features</CardTitle>
          <CardDescription>
            Ví dụ với custom label, disabled state và các tính năng nâng cao
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Label:</label>
              <ServerSelect
                value={selectedUser}
                onChange={setSelectedUser}
                columns={userColumns}
                fetcher={fetchUsers}
                optionLabel={(user) => `${user.name} (${user.role})`}
                optionValue="id"
                placeholder="Chọn với custom label..."
                overlayWidth="600px"
                pageSize={10}
                showSearch
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Disabled State:</label>
              <ServerSelect
                value={selectedUser}
                onChange={setSelectedUser}
                columns={userColumns}
                fetcher={fetchUsers}
                optionLabel="name"
                optionValue="id"
                placeholder="Component bị vô hiệu hóa..."
                disabled
                overlayWidth="600px"
                pageSize={10}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Large Page Size:</label>
            <ServerSelect
              value={selectedUsers}
              onChange={setSelectedUsers}
              multiple
              columns={userColumns}
              fetcher={fetchUsers}
              optionLabel="name"
              optionValue="id"
              placeholder="Page size lớn (25 items)..."
              overlayWidth="900px"
              pageSize={25}
              showSearch
              showClear
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Current State Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current State</CardTitle>
          <CardDescription>
            Hiển thị trạng thái hiện tại của tất cả selections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Single Selections:</h4>
              <div className="text-sm space-y-1">
                <div>Selected User: {selectedUser || 'None'}</div>
                <div>Selected Product: {selectedProduct || 'None'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Multiple Selections:</h4>
              <div className="text-sm space-y-1">
                <div>Selected Users: [{selectedUsers.join(', ') || 'None'}]</div>
                <div>Selected Products: [{selectedProducts.join(', ') || 'None'}]</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
