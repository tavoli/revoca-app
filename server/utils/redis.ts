import { createClient } from '@vercel/kv';

export const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const pinGetKey = (slug: string) => `books:${slug}:pins`;
