/**
 * Optional external REST base (e.g. `demo-api` while Next.js only serves the UI).
 * When unset, paths stay same-origin (`/api/...` → Next.js App Router).
 *
 * @example NEXT_PUBLIC_SALONX_API_ORIGIN=http://localhost:4000
 */
export function salonxApiOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SALONX_API_ORIGIN?.trim().replace(/\/$/, "") ?? ""
  );
}

/** `path` should start with `/` (e.g. `/api/config`). */
export function salonxApiUrl(path: string): string {
  const origin = salonxApiOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!origin) return p;
  return `${origin}${p}`;
}
