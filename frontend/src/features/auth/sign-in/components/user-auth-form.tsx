import { HTMLAttributes } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { useLogin } from '@/hooks/api'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, 'Vui lòng nhập tên đăng nhập hoặc email'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(7, 'Mật khẩu phải có ít nhất 7 ký tự'),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const loginMutation = useLogin()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await loginMutation.mutateAsync(data)
      toast.success('Đăng nhập thành công!')
      
      // Redirect to dashboard or intended page
      const searchParams = router.state.location.search as { redirect?: string }
      const redirectTo = searchParams.redirect || '/'
      router.navigate({ to: redirectTo })
    } catch (error) {
      // Show specific error message
      if (error instanceof Error) {
        toast.error(`Đăng nhập thất bại: ${error.message}`)
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='usernameOrEmail'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đăng nhập hoặc Email</FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên đăng nhập hoặc email của bạn' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Nhập mật khẩu' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                Quên mật khẩu?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  )
}
