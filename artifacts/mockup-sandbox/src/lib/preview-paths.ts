export function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

export function getPreviewExamplePath(): string {
  return `${getBasePath()}/preview/ComponentName`;
}

export function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || '/'
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}
