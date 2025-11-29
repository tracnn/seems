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
import type { IamUserDetail, UpdateIamUserRequest } from '@/api/types'

const userFormSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  mode: 'view' | 'edit'
}

export function UserDialog({ open, onOpenChange, userId, mode }: UserDialogProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(mode === 'edit')

  // Fetch user data
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['iam-user', userId],
    queryFn: () => userService.getIamUserById(userId!),
    enabled: !!userId && open,
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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      isActive: true,
    },
  })

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        isActive: user.isActive,
      })
    }
  }, [user, form])

  // Reset editing mode when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsEditing(mode === 'edit')
    } else {
      setIsEditing(false)
    }
  }, [open, mode])

  const onSubmit = (data: UserFormValues) => {
    const updateData: UpdateIamUserRequest = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      phone: data.phone || null,
      isActive: data.isActive,
    }
    updateMutation.mutate(updateData)
  }

  const handleCancel = () => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        isActive: user.isActive,
      })
    }
    setIsEditing(false)
    if (mode === 'view') {
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>
            {isEditing ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Cập nhật thông tin người dùng trong hệ thống'
              : 'Xem thông tin chi tiết của người dùng'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Không thể tải thông tin người dùng
          </div>
        ) : user ? (
          <Form {...form}>
            <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              {/* Read-only fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input {...field} disabled readOnly />
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
                        <Input {...field} disabled readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Read-only info section */}
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
            </form>
          </Form>
        ) : null}
        </ScrollArea>

        {user && (
          <SheetFooter className="px-6 py-4 border-t bg-muted/50">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  form="user-form"
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
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

