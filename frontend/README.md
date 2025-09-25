# Shadcn Auth Starter

A clean, minimal starter template with authentication and layout components built with Shadcn UI and Vite. Perfect for building admin dashboards or authenticated applications.

![alt text](public/images/shadcn-admin.png)

This is a streamlined version of the original Shadcn Admin Dashboard, focusing on providing a clean foundation with authentication flows and responsive layout components.

## Features

- 🔐 **Complete Authentication System**
  - Sign In / Sign Up pages
  - Forgot Password flow
  - OTP verification
  - Multiple auth page layouts

- 🎨 **Modern UI Components**
  - Built with Shadcn UI components
  - Dark/Light mode support
  - Responsive design
  - Accessible components

- 📱 **Responsive Layout**
  - Sidebar navigation
  - Header with search and user menu
  - Mobile-friendly design

- ⚡ **Developer Experience**
  - TypeScript support
  - Hot reload with Vite
  - ESLint & Prettier configured
  - Clean project structure

## Tech Stack

**UI:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [Eslint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Tabler Icons](https://tabler.io/icons) & [Lucide React](https://lucide.dev/)

**State Management:** [Zustand](https://zustand-demo.pmnd.rs/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd shadcn-auth-starter
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (sidebar, header, etc.)
│   └── ui/              # Shadcn UI components
├── features/
│   ├── auth/            # Authentication pages and components
│   ├── dashboard/       # Dashboard page
│   ├── errors/          # Error pages (404, 500, etc.)
│   └── settings/        # Settings pages
├── routes/              # TanStack Router routes
├── stores/              # Zustand stores
└── lib/                 # Utility functions
```

## Customization

### Adding New Pages

1. Create a new route in `src/routes/_authenticated/`
2. Add the route to the sidebar navigation in `src/components/layout/data/sidebar-data.ts`
3. Create corresponding components in `src/features/`

### Authentication Setup

The template includes authentication pages but doesn't include a backend. You'll need to:

1. Set up your authentication provider (Auth0, Supabase, Firebase, etc.)
2. Update the auth components to integrate with your provider
3. Configure protected routes as needed

### Styling

- Uses Tailwind CSS for styling
- Customize colors in `tailwind.config.js`
- Modify component styles in the respective component files

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)

## Acknowledgments

- Based on the original [Shadcn Admin Dashboard](https://github.com/satnaing/shadcn-admin)
- Built with [Shadcn UI](https://ui.shadcn.com) components
- Icons from [Tabler Icons](https://tabler.io/icons) and [Lucide](https://lucide.dev/)
