import { createFileRoute } from '@tanstack/react-router'
import { TestUserInfo } from '@/features/auth/test-user-info'

export const Route = createFileRoute('/(auth)/test-user-info')({
  component: TestUserInfo,
})