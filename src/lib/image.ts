import { env } from '@/config/env';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=70';

/** Uploaded images are stored as `/uploads/...` paths on the API server. */
export const resolveImage = (url?: string | null) => {
  if (!url) return FALLBACK_IMAGE;
  return url.startsWith('/') ? `${env.assetBaseUrl}${url}` : url;
};
