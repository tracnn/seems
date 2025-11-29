# UI Components

Thư mục này chứa các UI components tái sử dụng được xây dựng trên Radix UI và Tailwind CSS.

## ServerSelect Component

### Tổng quan
`ServerSelect` là một component mạnh mẽ cho phép chọn dữ liệu từ server với các tính năng:

- ✅ Server-side pagination
- ✅ Search với debounce (600ms)
- ✅ Single/Multiple selection
- ✅ Responsive design
- ✅ Custom option label/value
- ✅ Sorting
- ✅ Clear selection
- ✅ Resolve by value
- ✅ TypeScript support

### Sử dụng cơ bản

```tsx
import { ServerSelect } from '@/components/ui/server-select'

const MyComponent = () => {
  const [selectedUser, setSelectedUser] = useState(null)

  const columns = [
    { field: 'name', header: 'Tên' },
    { field: 'email', header: 'Email' }
  ]

  const fetchUsers = async (params) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(params)
    })
    return response.json()
  }

  return (
    <ServerSelect
      value={selectedUser}
      onChange={setSelectedUser}
      columns={columns}
      fetcher={fetchUsers}
      optionLabel="name"
      optionValue="id"
      placeholder="Chọn người dùng..."
    />
  )
}
```

### Multiple Selection

```tsx
<ServerSelect
  value={selectedUsers}
  onChange={setSelectedUsers}
  multiple
  columns={columns}
  fetcher={fetchUsers}
  optionLabel="name"
  optionValue="id"
  placeholder="Chọn nhiều người dùng..."
/>
```

### Với React Hook Form

```tsx
import { Controller } from 'react-hook-form'

<Controller
  name="userId"
  control={control}
  render={({ field }) => (
    <ServerSelect
      value={field.value}
      onChange={field.onChange}
      columns={columns}
      fetcher={fetchUsers}
      optionLabel="name"
      optionValue="id"
    />
  )}
/>
```

### Backend API Requirements

Server cần implement endpoint nhận:

```typescript
interface APIRequest {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: 1 | -1
}
```

Và trả về:

```typescript
interface APIResponse {
  data: Array<{
    id: string | number
    name: string
    // ... other fields
  }>
  pagination: {
    total: number
    page: number
    limit: number
    pageCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

### Demo

Xem demo đầy đủ tại: `/dashboard` - ServerSelect Component Demo section

### Tài liệu chi tiết

Xem file `SERVER_SELECT_GUIDE.md` trong thư mục gốc của project để biết thêm chi tiết về:

- API Reference đầy đủ
- Advanced usage examples
- Best practices
- Troubleshooting
- Migration guide từ Vue component
