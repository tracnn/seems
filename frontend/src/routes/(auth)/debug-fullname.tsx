import { createFileRoute } from '@tanstack/react-router'
import { DebugFullName } from '@/features/auth/debug-fullname'

export const Route = createFileRoute('/(auth)/debug-fullname')({
  component: DebugFullName,
})