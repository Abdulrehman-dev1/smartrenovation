import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
    cover?: string | null;
    coverAr?: number;
    gallery: string[];
    title: string;
};

export default function ProjectGallery({ cover, coverAr, gallery, title }: Props) {
    const images = useMemo(() => {
        const list: string[] = [];
        if (cover) list.push(cover);
        for (const src of gallery || []) {
            if (src && !list.includes(src)) list.push(src);
        }
        return list;
    }, [cover, gallery]);

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
                if (current === null || images.length === 0) return current;
                return (current + dir + images.length) % images.length;
            });
        },
        [images.length],
    );

    const setActiveIndex = (index: number) => {
        if (activeRef.current === index) return;
        activeRef.current = index;
        setActive(index);
    };

    const scrollCarouselTo = (index: number) => {
        const track = trackRef.current;
        if (!track || index < 0 || index >= images.length) return;
        const slide = track.children[index] as HTMLElement | undefined;
        if (!slide) return;

        const wraps =
            (activeRef.current === 0 && index === images.length - 1) ||
            (activeRef.current === images.length - 1 && index === 0);

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
    }, [images.length]);

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

    if (images.length === 0) return null;

    const lightboxOpen = lightboxIndex !== null;
    const lightboxSrc = lightboxOpen ? images[lightboxIndex] : null;

    return (
        <>
            {/* Desktop / tablet grid */}
            <div className="project-photos project-photos--grid">
                {cover && (
                    <button
                        type="button"
                        className="project-cover"
                        style={{ aspectRatio: String(Math.max(coverAr || 1.5, 0.66)) }}
                        onClick={() => openLightbox(0)}
                        aria-label={`View ${title} photo`}
                    >
                        <img src={cover} alt={title} />
                    </button>
                )}
                {gallery?.length > 0 && (
                    <section className="project-gallery" aria-label="Project gallery">
                        {gallery.map((src, i) => {
                            const index = cover ? i + 1 : i;
                            return (
                                <button
                                    type="button"
                                    key={src + i}
                                    className="project-gallery__item"
                                    onClick={() => openLightbox(index)}
                                    aria-label={`View photo ${index + 1}`}
                                >
                                    <img src={src} alt="" loading="lazy" />
                                </button>
                            );
                        })}
                    </section>
                )}
            </div>

            {/* Mobile carousel */}
            <div className="project-photos project-photos--carousel">
                <div className="project-carousel" aria-roledescription="carousel" aria-label={`${title} photos`}>
                    <div className="project-carousel__track" ref={trackRef}>
                        {images.map((src, i) => (
                            <button
                                type="button"
                                key={src + i}
                                className="project-carousel__slide"
                                onClick={() => openLightbox(i)}
                                aria-label={`View photo ${i + 1} of ${images.length}`}
                            >
                                <img src={src} alt={i === 0 ? title : ''} loading={i === 0 ? 'eager' : 'lazy'} />
                            </button>
                        ))}
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="project-carousel__nav project-carousel__nav--prev"
                                onClick={() => scrollCarouselTo((active - 1 + images.length) % images.length)}
                                aria-label="Previous photo"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className="project-carousel__nav project-carousel__nav--next"
                                onClick={() => scrollCarouselTo((active + 1) % images.length)}
                                aria-label="Next photo"
                            >
                                ›
                            </button>
                            {images.length <= 12 && (
                                <div className="project-carousel__dots" role="tablist" aria-label="Photo slides">
                                    {images.map((_, i) => (
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
                                <span>{images.length}</span>
                            </span>
                        </>
                    )}
                </div>
            </div>

            {lightboxOpen &&
                lightboxSrc &&
                createPortal(
                    <div
                        className="project-lightbox"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Photo viewer"
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
                            ×
                        </button>

                        {images.length > 1 && (
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
                                    ‹
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
                                    ›
                                </button>
                            </>
                        )}

                        <figure className="project-lightbox__figure" onClick={(e) => e.stopPropagation()}>
                            <img src={lightboxSrc} alt={title} />
                            <figcaption className="project-lightbox__count">
                                {lightboxIndex! + 1} / {images.length}
                            </figcaption>
                        </figure>
                    </div>,
                    document.body,
                )}
        </>
    );
}
