export const APP_SETTINGS = {
  // デフォルトは永続化OFF。VITE_ENABLE_LOCAL_STORAGE_PERSIST=true のときだけ有効化する
  enableLocalStoragePersist:
    import.meta.env.VITE_ENABLE_LOCAL_STORAGE_PERSIST === "true",
} as const;
