import { createFileRoute } from '@tanstack/react-router'
import { DebugLogin } from '@/features/auth/debug-login'

export const Route = createFileRoute('/(auth)/debug-login')({
  component: DebugLogin,
})