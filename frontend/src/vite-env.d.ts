/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_BACKEND_SERVER: string
    // 다른 환경 변수들에 대한 타입 정의...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  