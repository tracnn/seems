// Global type definitions
declare global {
  // Window object extensions
  interface Window {
    // Add any global window properties here
  }

  // Vue component types
  interface ComponentCustomProperties {
    // Add any global Vue properties here
  }
}

// Module declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {} 