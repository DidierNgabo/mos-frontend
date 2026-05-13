let cachedEnv: Record<string, string> | null = null;

export async function getRuntimeEnv() {
  if (cachedEnv) return cachedEnv;

  if (typeof window === 'undefined') {
    const res = await fetch('/api/runtime-env');
    cachedEnv = await res.json();
    return cachedEnv;
  }

  cachedEnv = process.env as Record<string, string>;
  return cachedEnv;
}
