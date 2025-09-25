import { Link, useRouter } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/api'
import { toast } from 'sonner'

export function ProfileDropdown() {
  const router = useRouter()
  const { auth } = useAuthStore()
  const { user } = auth
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      toast.success('Đăng xuất thành công!')
      router.navigate({ to: '/sign-in' })
    } catch (error) {
      toast.error('Đăng xuất thất bại', {
        description: error instanceof Error ? error.message : 'Đăng xuất thất bại'
      })
    }
  }

  // Generate initials from user name
  const getInitials = (firstName?: string, lastName?: string, accountNo?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase()
    }
    if (accountNo) {
      return accountNo.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Get display name - prioritize fullName
  const getDisplayName = () => {
    if (user?.fullName) {
      return user.fullName
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    if (user?.accountNo) {
      return user.accountNo
    }
    return 'User'
  }

  // Get display email
  const getDisplayEmail = () => {
    return user?.email || user?.accountNo + '@example.com' || 'user@example.com'
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user?.avatar} alt={getDisplayName()} />
            <AvatarFallback>
              {getInitials(user?.firstName, user?.lastName, user?.accountNo)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>{getDisplayName()}</p>
            <p className='text-muted-foreground text-xs leading-none'>
              {getDisplayEmail()}
            </p>
            {user?.role && user.role.length > 0 && (
              <p className='text-muted-foreground text-xs leading-none'>
                {user.role.join(', ')}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Log out'}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
