import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RecentOrdersTable } from './components/recent-orders-table'
import { ServerSelectDemo } from './components/server-select-demo'

export default function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='flex items-center space-x-4'>
          <h1 className='text-lg font-semibold'>Dashboard</h1>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold tracking-tight'>Welcome to your Dashboard</h1>
          <p className='text-muted-foreground'>
            This is a clean starter template with authentication and layout components.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Complete auth system with sign in, sign up, and password recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Ready-to-use authentication components and flows.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout System</CardTitle>
              <CardDescription>
                Responsive layout with sidebar navigation and header
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Clean and modern layout components for your application.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>
                Beautiful UI components with dark mode support for healthcare management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Pre-built components following modern design principles.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* DataTable Example */}
        <div className='mt-8'>
          <Card>
            <CardHeader>
              <CardTitle>DataTable Component Demo</CardTitle>
              <CardDescription>
                Ví dụ sử dụng DataTable với lazy loading, pagination, sorting và search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentOrdersTable />
            </CardContent>
          </Card>
        </div>

        {/* ServerSelect Example */}
        <div className='mt-8'>
          <Card>
            <CardHeader>
              <CardTitle>ServerSelect Component Demo</CardTitle>
              <CardDescription>
                Ví dụ sử dụng ServerSelect với server-side pagination, search, single/multiple selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServerSelectDemo />
            </CardContent>
          </Card>
        </div>

        <div className='mt-8'>
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Next steps to build your application
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <h4 className='font-medium'>1. Customize the Layout</h4>
                <p className='text-sm text-muted-foreground'>
                  Modify the sidebar navigation in <code>src/components/layout/data/sidebar-data.ts</code>
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>2. Add New Pages</h4>
                <p className='text-sm text-muted-foreground'>
                  Create new routes in <code>src/routes/_authenticated/</code>
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>3. Configure Authentication</h4>
                <p className='text-sm text-muted-foreground'>
                  Set up your auth provider in the auth components
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>4. DataTable Component</h4>
                <p className='text-sm text-muted-foreground'>
                  Sử dụng DataTable component với đầy đủ tính năng lazy loading, pagination, sorting và filtering
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>5. ServerSelect Component</h4>
                <p className='text-sm text-muted-foreground'>
                  Sử dụng ServerSelect component với server-side pagination, search, single/multiple selection
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
