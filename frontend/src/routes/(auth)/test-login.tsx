import { createFileRoute } from '@tanstack/react-router'
import { TestLogin } from '@/features/auth/test-login'

export const Route = createFileRoute('/(auth)/test-login')({
  component: TestLogin,
})
