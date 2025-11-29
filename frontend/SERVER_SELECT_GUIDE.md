# ServerSelect Component - Hướng dẫn sử dụng

## Tổng quan

`ServerSelect` là một component React mạnh mẽ cho phép chọn dữ liệu từ server với các tính năng:

- **Server-side pagination**: Tải dữ liệu theo trang từ server
- **Search với debounce**: Tìm kiếm với độ trễ 600ms
- **Single/Multiple selection**: Chọn một hoặc nhiều mục
- **Responsive design**: Tự động điều chỉnh trên mobile
- **Custom option label/value**: Tùy chỉnh hiển thị và giá trị
- **Sorting**: Sắp xếp dữ liệu
- **Clear selection**: Xóa lựa chọn
- **Resolve by value**: Tải dữ liệu đã chọn từ server

## Cài đặt

Component đã được tạo tại `src/components/ui/server-select.tsx` và sử dụng các UI components có sẵn:

- `@radix-ui/react-popover`
- `@radix-ui/react-checkbox`
- `lucide-react` icons
- Tailwind CSS

## API Reference

### Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `value` | `any \| any[]` | - | Giá trị được chọn (controlled) |
| `onChange` | `(value: any \| any[]) => void` | - | Callback khi giá trị thay đổi |
| `onSelected` | `(rows: Row \| Row[]) => void` | - | Callback khi có mục được chọn |
| `multiple` | `boolean` | `false` | Cho phép chọn nhiều mục |
| `placeholder` | `string` | `"Chọn..."` | Text placeholder |
| `disabled` | `boolean` | `false` | Vô hiệu hóa component |
| `pageSize` | `number` | `20` | Số mục mỗi trang |
| `overlayWidth` | `string \| number` | `"720px"` | Chiều rộng popover |
| `optionLabel` | `string \| ((row: Row) => string)` | `"name"` | Field hoặc function để lấy label |
| `optionValue` | `string \| ((row: Row) => any)` | `"id"` | Field hoặc function để lấy value |
| `dataKeyField` | `string` | `"id"` | Field làm key duy nhất |
| `ensureSelectedVisible` | `boolean` | `false` | Ghim mục đã chọn lên đầu |
| `columns` | `ColumnDef[]` | - | **Bắt buộc** - Định nghĩa cột hiển thị |
| `fetcher` | `(params: FetchParams) => Promise<FetchResult>` | - | **Bắt buộc** - Function tải dữ liệu |
| `resolveByValue` | `(value: any \| any[]) => Promise<Row \| Row[] \| null>` | - | Function resolve giá trị thành row |
| `showSearch` | `boolean` | `true` | Hiển thị ô tìm kiếm |
| `showClear` | `boolean` | `true` | Hiển thị nút xóa |
| `dropdownIcon` | `React.ReactNode` | - | Icon tùy chỉnh |
| `className` | `string` | - | CSS class bổ sung |

### Types

```typescript
interface FetchParams {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: 1 | -1
  filters?: Record<string, any>
}

interface BackendPagination {
  total: number
  page: number
  limit: number
  pageCount: number
  hasNext: boolean
  hasPrev: boolean
}

interface FetchResult {
  data: Row[]
  pagination: BackendPagination
}

interface ColumnDef {
  field: string
  header: string
  width?: string
}

type Row = Record<string, any>
```

## Ví dụ sử dụng

### 1. Single Selection cơ bản

```tsx
import { ServerSelect } from '@/components/ui/server-select'

const UserSelect = () => {
  const [selectedUser, setSelectedUser] = useState(null)

  const userColumns = [
    { field: 'name', header: 'Tên' },
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Vai trò' }
  ]

  const fetchUsers = async (params) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    return response.json()
  }

  return (
    <ServerSelect
      value={selectedUser}
      onChange={setSelectedUser}
      columns={userColumns}
      fetcher={fetchUsers}
      optionLabel="name"
      optionValue="id"
      placeholder="Chọn người dùng..."
    />
  )
}
```

### 2. Multiple Selection

```tsx
const MultiUserSelect = () => {
  const [selectedUsers, setSelectedUsers] = useState([])

  return (
    <ServerSelect
      value={selectedUsers}
      onChange={setSelectedUsers}
      multiple
      columns={userColumns}
      fetcher={fetchUsers}
      optionLabel="name"
      optionValue="id"
      placeholder="Chọn nhiều người dùng..."
    />
  )
}
```

### 3. Với Custom Label/Value

```tsx
const CustomSelect = () => {
  return (
    <ServerSelect
      value={selectedUser}
      onChange={setSelectedUser}
      columns={userColumns}
      fetcher={fetchUsers}
      optionLabel={(row) => `${row.firstName} ${row.lastName}`}
      optionValue={(row) => row.userId}
      placeholder="Chọn người dùng..."
    />
  )
}
```

### 4. Với Resolve by Value

```tsx
const SelectWithResolve = () => {
  const [selectedUser, setSelectedUser] = useState(123) // ID đã có sẵn

  const resolveUser = async (userId) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }

  return (
    <ServerSelect
      value={selectedUser}
      onChange={setSelectedUser}
      columns={userColumns}
      fetcher={fetchUsers}
      resolveByValue={resolveUser}
      optionLabel="name"
      optionValue="id"
      placeholder="Chọn người dùng..."
    />
  )
}
```

### 5. Với Form Integration (React Hook Form)

```tsx
import { useForm, Controller } from 'react-hook-form'

const FormWithServerSelect = () => {
  const { control, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="userId"
        control={control}
        render={({ field }) => (
          <ServerSelect
            value={field.value}
            onChange={field.onChange}
            columns={userColumns}
            fetcher={fetchUsers}
            optionLabel="name"
            optionValue="id"
            placeholder="Chọn người dùng..."
          />
        )}
      />
    </form>
  )
}
```

## Backend API Requirements

Server cần implement endpoint nhận các tham số:

```typescript
interface APIRequest {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: 1 | -1
  filters?: Record<string, any>
}
```

Và trả về response:

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

### Ví dụ Backend (NestJS)

```typescript
@Post('users/search')
async searchUsers(@Body() params: FetchParams) {
  const { data, pagination } = await this.userService.search(params)
  return { data, pagination }
}
```

## Styling

Component sử dụng Tailwind CSS và có thể tùy chỉnh thông qua:

1. **className prop**: Thêm class cho container
2. **CSS variables**: Tùy chỉnh theme colors
3. **overlayWidth**: Điều chỉnh kích thước popover

### Responsive Design

- **Desktop**: Popover rộng 720px (mặc định)
- **Mobile**: Popover rộng 96vw, chiều cao 85vh
- **Table**: Scroll ngang khi cần thiết

## Best Practices

### 1. Performance

- Sử dụng `pageSize` hợp lý (10-50 items)
- Implement debounce cho search (đã có sẵn 600ms)
- Sử dụng `resolveByValue` cho dữ liệu đã chọn

### 2. UX

- Cung cấp `placeholder` rõ ràng
- Sử dụng `optionLabel` phù hợp
- Enable `showClear` khi cần thiết
- Sử dụng `ensureSelectedVisible` cho UX tốt hơn

### 3. Error Handling

```tsx
const fetchUsers = async (params) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: [], pagination: { total: 0, page: 1, limit: 20 } }
  }
}
```

## Troubleshooting

### 1. Component không hiển thị dữ liệu

- Kiểm tra `fetcher` function có trả về đúng format
- Kiểm tra `columns` có match với data fields
- Kiểm tra network requests trong DevTools

### 2. Selection không hoạt động

- Kiểm tra `optionValue` có đúng field
- Kiểm tra `onChange` callback
- Kiểm tra `multiple` prop

### 3. Search không hoạt động

- Kiểm tra backend có handle `search` parameter
- Kiểm tra debounce delay (600ms)
- Kiểm tra network requests

### 4. Mobile responsive issues

- Kiểm tra `overlayWidth` setting
- Kiểm tra CSS conflicts
- Test trên device thật

## Migration từ Vue Component

Nếu đang migrate từ Vue ServerSelect:

1. **Props mapping**:
   - `modelValue` → `value`
   - `@update:modelValue` → `onChange`
   - `@selected` → `onSelected`

2. **Event handling**:
   - Vue events → React callbacks
   - `v-model` → controlled component

3. **Styling**:
   - Vue classes → Tailwind classes
   - Scoped styles → CSS modules hoặc global styles

## Changelog

### v1.0.0
- Initial release
- Full feature parity với Vue component
- React/TypeScript implementation
- Tailwind CSS styling
- Responsive design
