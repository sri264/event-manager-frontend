const required = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing ${key} in .env — copy .env.example to .env`);
  }
  return value;
};

export const env = {
  apiBaseUrl: required('VITE_API_BASE_URL'),
  assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL || '',
  appName: import.meta.env.VITE_APP_NAME || 'EventNest',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || '',
};
