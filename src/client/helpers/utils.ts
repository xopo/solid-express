export function getMediumFromUrl(url: string) {
    if (!url) return 'not found';
    
    // youtube.com youtu.be
    if (url.includes('youtu')) return 'youtube';

    if (url.includes('rumble')) return 'rumble';

    if (url.includes('faceb')) return 'facebook';

    return 'not found';
}