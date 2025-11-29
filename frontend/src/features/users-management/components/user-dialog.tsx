import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { userService } from '@/api/services'
import type { CreateIamUserRequest, UpdateIamUserRequest } from '@/api/types'

const baseUserFormSchema = {
  username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional().nullable(),
}

const userFormSchema = z.object({
  ...baseUserFormSchema,
  isActive: z.boolean(),
})

const createUserFormSchema = z.object({
  ...baseUserFormSchema,
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})

type FormValues = z.infer<typeof userFormSchema> & {
  password?: string
}

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  mode: 'view' | 'edit' | 'create'
}

export function UserDialog({ open, onOpenChange, userId, mode }: UserDialogProps) {
  const queryClient = useQueryClient()
  const isCreateMode = mode === 'create'
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')

  // Fetch user data (only for view/edit modes)
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['iam-user', userId],
    queryFn: () => userService.getIamUserById(userId!),
    enabled: !!userId && open && !isCreateMode,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateIamUserRequest) => userService.createIamUser(data),
    onSuccess: () => {
      toast.success('Tạo người dùng thành công')
      queryClient.invalidateQueries({ queryKey: ['iam-users'] })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.errorDescription || 
                          error?.response?.data?.message || 
                          'Tạo người dùng thất bại'
      toast.error(errorMessage)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateIamUserRequest) =>
      userService.updateIamUser(userId!, data),
    onSuccess: () => {
      toast.success('Cập nhật người dùng thành công')
      queryClient.invalidateQueries({ queryKey: ['iam-users'] })
      queryClient.invalidateQueries({ queryKey: ['iam-user', userId] })
      setIsEditing(false)
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật người dùng thất bại')
    },
  })

  const formSchema = isCreateMode ? createUserFormSchema : userFormSchema
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: isCreateMode
      ? {
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
        }
      : {
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          isActive: true,
        },
  })

  // Update form when user data loads (only for view/edit modes)
  useEffect(() => {
    if (user && !isCreateMode) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        isActive: user.isActive,
      })
    }
  }, [user, form, isCreateMode])

  // Reset form when dialog opens in create mode
  useEffect(() => {
    if (open && isCreateMode) {
      form.reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
      })
    }
  }, [open, isCreateMode, form])

  // Reset editing mode when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsEditing(mode === 'edit' || mode === 'create')
    } else {
      setIsEditing(false)
    }
  }, [open, mode])

  const onSubmit = (data: FormValues) => {
    if (isCreateMode) {
      const createData: CreateIamUserRequest = {
        username: data.username,
        email: data.email,
        password: data.password!,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || null,
      }
      createMutation.mutate(createData)
    } else {
      const updateData: UpdateIamUserRequest = {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || null,
        isActive: data.isActive ?? true,
      }
      updateMutation.mutate(updateData)
    }
  }

  const handleCancel = () => {
    if (user && !isCreateMode) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        isActive: user.isActive,
      })
    } else if (isCreateMode) {
      form.reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
      })
    }
    setIsEditing(false)
    if (mode === 'view' || mode === 'create') {
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>
            {isCreateMode
              ? 'Tạo người dùng mới'
              : isEditing
              ? 'Chỉnh sửa người dùng'
              : 'Chi tiết người dùng'}
          </SheetTitle>
          <SheetDescription>
            {isCreateMode
              ? 'Thêm người dùng mới vào hệ thống'
              : isEditing
              ? 'Cập nhật thông tin người dùng trong hệ thống'
              : 'Xem thông tin chi tiết của người dùng'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {isLoading && !isCreateMode ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error && !isCreateMode ? (
          <div className="text-center py-8 text-destructive">
            Không thể tải thông tin người dùng
          </div>
        ) : (user || isCreateMode) ? (
          <Form {...form}>
            <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              {/* Username and Email fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isCreateMode && !isEditing}
                          readOnly={!isCreateMode && !isEditing}
                          placeholder="Nhập tên đăng nhập"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled={!isCreateMode && !isEditing}
                          readOnly={!isCreateMode && !isEditing}
                          placeholder="Nhập email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password field (only for create mode) */}
              {isCreateMode && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Editable fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Nhập họ"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Nhập tên"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={!isEditing}
                        placeholder="Nhập số điện thoại"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status field (only for edit mode, not create mode) */}
              {!isCreateMode && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái</FormLabel>
                        <FormDescription>
                          Kích hoạt hoặc vô hiệu hóa tài khoản người dùng
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEditing}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Read-only info section (only for view/edit modes) */}
              {!isCreateMode && user && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <div className="text-sm font-medium">ID</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {user.id}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Version</div>
                  <div className="text-sm text-muted-foreground">
                    {user.version || 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Xác thực email</div>
                  <div>
                    <Badge
                      variant={user.isEmailVerified ? 'default' : 'outline'}
                    >
                      {user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Đăng nhập lần cuối</div>
                  <div className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('vi-VN')
                      : 'Chưa đăng nhập'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Ngày tạo</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Ngày cập nhật</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              )}
            </form>
          </Form>
        ) : null}
        </ScrollArea>

        {(user || isCreateMode) && (
          <SheetFooter className="px-6 py-4 border-t bg-muted/50">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCreateMode ? createMutation.isPending : updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  form="user-form"
                  disabled={isCreateMode ? createMutation.isPending : updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {isCreateMode
                    ? createMutation.isPending
                      ? 'Đang tạo...'
                      : 'Tạo người dùng'
                    : updateMutation.isPending
                    ? 'Đang lưu...'
                    : 'Lưu thay đổi'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                >
                  Đóng
                </Button>
                {mode === 'view' && (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

