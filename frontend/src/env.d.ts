/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly APPS_SCRIPT_API_URL: string;
  readonly PUBLIC_FORM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
