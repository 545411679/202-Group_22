/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Empty = same origin (dev proxy or SPA served by Spring Boot). Set full URL if API is on another host. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
