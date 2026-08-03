export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www\.|m\.)/, '');

    if (host === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    if (host === 'youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] ?? null;
      }
    }

    return null;
  } catch {
    return null;
  }
}
