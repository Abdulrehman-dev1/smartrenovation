import { isVideoUrl, paintVideoThumbnail, videoThumbSrc } from '@/lib/media';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type GalleryMediaItem = {
    url: string;
    type?: 'image' | 'video';
    poster?: string | null;
};

type Props = {
    cover?: string | null;
    coverAr?: number;
    gallery: Array<string | GalleryMediaItem>;
    title: string;
};

function ChevronLeftIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M15 5L8 12L15 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M9 5L16 12L9 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
        </svg>
    );
}

function PlayBadge() {
    return (
        <span className="project-media__play" aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
        </span>
    );
}

function normalizeItem(item: string | GalleryMediaItem): GalleryMediaItem {
    if (typeof item === 'string') {
        return {
            url: item,
            type: isVideoUrl(item) ? 'video' : 'image',
            poster: null,
        };
    }
    return {
        url: item.url,
        type: item.type ?? (isVideoUrl(item.url) ? 'video' : 'image'),
        poster: item.poster ?? null,
    };
}

function GalleryMedia({
    item,
    alt,
    eager = false,
    controls = false,
    autoPlay = false,
}: {
    item: GalleryMediaItem;
    alt?: string;
    eager?: boolean;
    controls?: boolean;
    autoPlay?: boolean;
}) {
    const isVideo = item.type === 'video' || isVideoUrl(item.url);

    if (isVideo && !controls && !autoPlay && item.poster) {
        return <img src={item.poster} alt={alt ?? ''} loading={eager ? 'eager' : 'lazy'} />;
    }

    if (isVideo) {
        return (
            <video
                src={controls || autoPlay ? item.url : videoThumbSrc(item.url)}
                poster={item.poster || undefined}
                muted={!controls}
                playsInline
                preload="metadata"
                controls={controls}
                autoPlay={autoPlay}
                className="project-media__video"
                ref={controls || autoPlay ? undefined : paintVideoThumbnail}
                onLoadedMetadata={controls || autoPlay ? undefined : (e) => paintVideoThumbnail(e.currentTarget)}
            />
        );
    }

    return <img src={item.url} alt={alt ?? ''} loading={eager ? 'eager' : 'lazy'} />;
}

export default function ProjectGallery({ cover, coverAr, gallery, title }: Props) {
    const items = useMemo(() => {
        const list: GalleryMediaItem[] = [];
        if (cover) {
            list.push({ url: cover, type: 'image', poster: null });
        }
        for (const raw of gallery || []) {
            const item = normalizeItem(raw);
            if (item.url && !list.some((existing) => existing.url === item.url)) {
                list.push(item);
            }
        }
        return list;
    }, [cover, gallery]);

    const galleryOnly = useMemo(() => (gallery || []).map(normalizeItem).filter((item) => item.url), [gallery]);

    const [active, setActive] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const touchStartX = useRef<number | null>(null);
    const activeRef = useRef(0);
    const scrollRaf = useRef<number | null>(null);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goLightbox = useCallback(
        (dir: -1 | 1) => {
            setLightboxIndex((current) => {
                if (current === null || items.length === 0) return current;
                return (current + dir + items.length) % items.length;
            });
        },
        [items.length],
    );

    useEffect(() => {
        if (lightboxIndex === null) return;
        setActiveIndex(lightboxIndex);
        const track = trackRef.current;
        const slide = track?.children[lightboxIndex] as HTMLElement | undefined;
        if (track && slide) {
            track.scrollTo({ left: slide.offsetLeft, behavior: 'auto' });
        }
    }, [lightboxIndex]);

    const setActiveIndex = (index: number) => {
        if (activeRef.current === index) return;
        activeRef.current = index;
        setActive(index);
    };

    const scrollCarouselTo = (index: number) => {
        const track = trackRef.current;
        if (!track || index < 0 || index >= items.length) return;
        const slide = track.children[index] as HTMLElement | undefined;
        if (!slide) return;

        const wraps =
            (activeRef.current === 0 && index === items.length - 1) ||
            (activeRef.current === items.length - 1 && index === 0);

        setActiveIndex(index);
        track.scrollTo({
            left: slide.offsetLeft,
            behavior: wraps ? 'auto' : 'smooth',
        });
    };

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const syncActiveFromScroll = () => {
            const slides = Array.from(track.children) as HTMLElement[];
            if (!slides.length) return;
            const mid = track.scrollLeft + track.clientWidth / 2;
            let best = 0;
            let bestDist = Infinity;
            slides.forEach((slide, i) => {
                const center = slide.offsetLeft + slide.clientWidth / 2;
                const dist = Math.abs(center - mid);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = i;
                }
            });
            setActiveIndex(best);
        };

        const onScroll = () => {
            if (scrollRaf.current !== null) return;
            scrollRaf.current = window.requestAnimationFrame(() => {
                scrollRaf.current = null;
                syncActiveFromScroll();
            });
        };

        track.addEventListener('scroll', onScroll, { passive: true });
        track.addEventListener('scrollend', syncActiveFromScroll);
        return () => {
            track.removeEventListener('scroll', onScroll);
            track.removeEventListener('scrollend', syncActiveFromScroll);
            if (scrollRaf.current !== null) window.cancelAnimationFrame(scrollRaf.current);
        };
    }, [items.length]);

    useEffect(() => {
        if (lightboxIndex === null) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeLightbox();
            if (event.key === 'ArrowLeft') goLightbox(-1);
            if (event.key === 'ArrowRight') goLightbox(1);
        };

        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [lightboxIndex, goLightbox]);

    if (items.length === 0) return null;

    const lightboxOpen = lightboxIndex !== null;
    const lightboxItem = lightboxOpen ? items[lightboxIndex] : null;
    const lightboxIsVideo = lightboxItem
        ? lightboxItem.type === 'video' || isVideoUrl(lightboxItem.url)
        : false;

    return (
        <>
            <div className="project-photos project-photos--grid">
                {cover && (
                    <button
                        type="button"
                        className="project-cover"
                        style={{ aspectRatio: String(Math.max(coverAr || 1.5, 0.66)) }}
                        onClick={() => openLightbox(0)}
                        aria-label={`View ${title} photo`}
                    >
                        <GalleryMedia item={{ url: cover, type: 'image' }} alt={title} eager />
                    </button>
                )}
                {galleryOnly.length > 0 && (
                    <section className="project-gallery" aria-label="Project gallery">
                        {galleryOnly.map((item, i) => {
                            const index = cover ? i + 1 : i;
                            const video = item.type === 'video' || isVideoUrl(item.url);
                            return (
                                <button
                                    type="button"
                                    key={item.url + i}
                                    className={`project-gallery__item${video ? ' project-gallery__item--video' : ''}`}
                                    onClick={() => openLightbox(index)}
                                    aria-label={video ? `Play video ${index + 1}` : `View photo ${index + 1}`}
                                >
                                    <GalleryMedia item={item} />
                                    {video && <PlayBadge />}
                                </button>
                            );
                        })}
                    </section>
                )}
            </div>

            <div className="project-photos project-photos--carousel">
                <div className="project-carousel" aria-roledescription="carousel" aria-label={`${title} photos`}>
                    <div className="project-carousel__track" ref={trackRef}>
                        {items.map((item, i) => {
                            const video = item.type === 'video' || isVideoUrl(item.url);
                            return (
                                <button
                                    type="button"
                                    key={item.url + i}
                                    className="project-carousel__slide"
                                    onClick={() => openLightbox(i)}
                                    aria-label={
                                        video
                                            ? `Play video ${i + 1} of ${items.length}`
                                            : `View photo ${i + 1} of ${items.length}`
                                    }
                                >
                                    <GalleryMedia item={item} alt={i === 0 ? title : ''} eager={i === 0} />
                                    {video && <PlayBadge />}
                                </button>
                            );
                        })}
                    </div>

                    {items.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="project-carousel__nav project-carousel__nav--prev"
                                onClick={() => scrollCarouselTo((active - 1 + items.length) % items.length)}
                                aria-label="Previous photo"
                            >
                                <ChevronLeftIcon />
                            </button>
                            <button
                                type="button"
                                className="project-carousel__nav project-carousel__nav--next"
                                onClick={() => scrollCarouselTo((active + 1) % items.length)}
                                aria-label="Next photo"
                            >
                                <ChevronRightIcon />
                            </button>
                            {items.length <= 12 && (
                                <div className="project-carousel__dots" role="tablist" aria-label="Photo slides">
                                    {items.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            role="tab"
                                            aria-selected={active === i}
                                            className={`project-carousel__dot${active === i ? ' is-active' : ''}`}
                                            onClick={() => scrollCarouselTo(i)}
                                            aria-label={`Go to photo ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                            <span className="project-carousel__count" aria-live="polite">
                                <span key={active} className="project-carousel__count-num">
                                    {active + 1}
                                </span>
                                <span className="project-carousel__count-sep"> / </span>
                                <span>{items.length}</span>
                            </span>
                        </>
                    )}
                </div>
            </div>

            {lightboxOpen &&
                lightboxItem &&
                createPortal(
                    <div
                        className="project-lightbox"
                        role="dialog"
                        aria-modal="true"
                        aria-label={lightboxIsVideo ? 'Video viewer' : 'Photo viewer'}
                        onClick={closeLightbox}
                        onTouchStart={(e) => {
                            touchStartX.current = e.changedTouches[0]?.clientX ?? null;
                        }}
                        onTouchEnd={(e) => {
                            if (touchStartX.current === null) return;
                            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
                            touchStartX.current = null;
                            if (Math.abs(dx) < 50) return;
                            goLightbox(dx > 0 ? -1 : 1);
                        }}
                    >
                        <button
                            type="button"
                            className="project-lightbox__close"
                            onClick={closeLightbox}
                            aria-label="Close"
                        >
                            <CloseIcon />
                        </button>

                        {items.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="project-lightbox__nav project-lightbox__nav--prev"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goLightbox(-1);
                                    }}
                                    aria-label="Previous photo"
                                >
                                    <ChevronLeftIcon />
                                </button>
                                <button
                                    type="button"
                                    className="project-lightbox__nav project-lightbox__nav--next"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goLightbox(1);
                                    }}
                                    aria-label="Next photo"
                                >
                                    <ChevronRightIcon />
                                </button>
                            </>
                        )}

                        <figure className="project-lightbox__figure" onClick={(e) => e.stopPropagation()}>
                            {lightboxIsVideo ? (
                                <GalleryMedia key={lightboxItem.url} item={lightboxItem} controls autoPlay />
                            ) : (
                                <img src={lightboxItem.url} alt={title} />
                            )}
                            <figcaption className="project-lightbox__count" aria-live="polite">
                                <span key={lightboxIndex} className="project-lightbox__count-num">
                                    {lightboxIndex! + 1}
                                </span>
                                <span> / {items.length}</span>
                            </figcaption>
                        </figure>
                    </div>,
                    document.body,
                )}
        </>
    );
}
