export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
export const GALLERY_ACCEPT =
    '.jpg,.jpeg,.png,.webp,.mp4,.webm,image/jpeg,image/png,image/webp,video/mp4,video/webm';

const VIDEO_EXT = /\.(mp4|webm)(\?|#|$)/i;

export function isVideoUrl(urlOrPath: string | null | undefined): boolean {
    if (!urlOrPath) return false;
    return VIDEO_EXT.test(urlOrPath);
}

/** Seek hint so browsers paint a first frame for muted preview thumbs. */
export function videoThumbSrc(url: string): string {
    if (!url) return url;
    if (url.includes('#t=')) return url;
    return `${url}#t=0.001`;
}

export function isVideoFile(file: File): boolean {
    return file.type.startsWith('video/') || isVideoUrl(file.name);
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
}
