import { createFileRoute } from '@tanstack/react-router'
import { TestFullName } from '@/features/auth/test-fullname'

export const Route = createFileRoute('/(auth)/test-fullname')({
  component: TestFullName,
})