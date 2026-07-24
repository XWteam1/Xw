export function gdocPreviewUrl(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return url;
  const id = match[1];
  if (url.includes("/spreadsheets/")) {
    return `https://docs.google.com/spreadsheets/d/${id}/preview`;
  }
  if (url.includes("/presentation/")) {
    return `https://docs.google.com/presentation/d/${id}/preview`;
  }
  return `https://docs.google.com/document/d/${id}/preview`;
}
