import {
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function Slider({ children, className = '' }: Props) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const indexRef = useRef(0);
    const stepRef = useRef(0);
    const maxRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [index, setIndex] = useState(0);
    const [maxIndex, setMaxIndex] = useState(0);

    const viewport = () => sliderRef.current?.querySelector('.slider__viewport') as HTMLElement | null;

    const go = useCallback((i: number) => {
        const track = trackRef.current;
        const vp = viewport();
        if (!track || !vp) return;
        const clamped = Math.max(0, Math.min(i, maxRef.current));
        indexRef.current = clamped;
        setIndex(clamped);
        const maxShift = track.scrollWidth - vp.clientWidth;
        const shift = Math.min(clamped * stepRef.current, Math.max(0, maxShift));
        track.style.transform = `translateX(${-shift}px)`;
    }, []);

    const stop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const start = useCallback(() => {
        stop();
        if (maxRef.current <= 0) return;
        timerRef.current = setInterval(() => {
            go(indexRef.current >= maxRef.current ? 0 : indexRef.current + 1);
        }, 5000);
    }, [go]);

    useEffect(() => {
        const track = trackRef.current;
        const vp = viewport();
        const slider = sliderRef.current;
        if (!track || !vp || !slider || !track.children.length) return;

        const measure = () => {
            const first = track.children[0] as HTMLElement | undefined;
            if (!first) return;
            const gap =
                parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
            stepRef.current = first.offsetWidth + gap;
            const m = Math.max(0, Math.ceil((track.scrollWidth - vp.clientWidth) / stepRef.current));
            maxRef.current = m;
            setMaxIndex(m);
            go(Math.min(indexRef.current, m));
        };

        measure();
        start();
        window.addEventListener('resize', measure);
        const imgs = track.querySelectorAll('img');
        imgs.forEach((img) => {
            if (!img.complete) img.addEventListener('load', measure, { once: true });
        });

        let down = false;
        let startX = 0;
        let startShift = 0;
        let lastX = 0;
        let moved = false;

        const curShift = () => {
            const m = /translateX\((-?[\d.]+)px\)/.exec(track.style.transform);
            return m ? parseFloat(m[1]) : 0;
        };

        const onDown = (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            down = true;
            moved = false;
            startX = e.clientX;
            lastX = e.clientX;
            startShift = curShift();
            track.classList.add('dragging');
            try {
                track.setPointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
            stop();
        };

        const onMove = (e: PointerEvent) => {
            if (!down) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 4) moved = true;
            lastX = e.clientX;
            track.style.transform = `translateX(${startShift + dx}px)`;
            if (moved && Math.abs(e.clientX - startX) > Math.abs(e.movementY || 0)) {
                e.preventDefault();
            }
        };

        const onUp = (e: PointerEvent) => {
            if (!down) return;
            down = false;
            track.classList.remove('dragging');
            try {
                track.releasePointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
            const delta = (e.clientX ?? lastX) - startX;
            if (Math.abs(delta) > Math.max(40, stepRef.current * 0.2)) {
                go(indexRef.current + (delta < 0 ? 1 : -1));
            } else {
                go(indexRef.current);
            }
            start();
        };

        let wheelLock = false;
        const onWheel = (e: WheelEvent) => {
            const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const shiftScroll = e.shiftKey && Math.abs(e.deltaY) > 0;
            if (!horizontal && !shiftScroll) return;
            e.preventDefault();
            if (wheelLock || maxRef.current <= 0) return;
            const delta = horizontal ? e.deltaX : e.deltaY;
            if (Math.abs(delta) < 8) return;
            wheelLock = true;
            go(indexRef.current + (delta > 0 ? 1 : -1));
            start();
            setTimeout(() => {
                wheelLock = false;
            }, 450);
        };

        track.addEventListener('pointerdown', onDown);
        track.addEventListener('pointermove', onMove);
        track.addEventListener('pointerup', onUp);
        track.addEventListener('pointercancel', onUp);
        vp.addEventListener('wheel', onWheel, { passive: false });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);

        return () => {
            stop();
            window.removeEventListener('resize', measure);
            track.removeEventListener('pointerdown', onDown);
            track.removeEventListener('pointermove', onMove);
            track.removeEventListener('pointerup', onUp);
            track.removeEventListener('pointercancel', onUp);
            vp.removeEventListener('wheel', onWheel);
            slider.removeEventListener('mouseenter', stop);
            slider.removeEventListener('mouseleave', start);
        };
    }, [go, start, children]);

    const jump = (i: number) => {
        go(i);
        start();
    };

    return (
        <div className={`slider ${className}`} ref={sliderRef}>
            <div className="slider__viewport">
                <div className="slider__track" ref={trackRef}>
                    {children}
                </div>
            </div>
            <div className="slider__controls">
                <div className="slider__dots">
                    {Array.from({ length: maxIndex + 1 }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to slide ${i + 1}`}
                            className={i === index ? 'is-active' : ''}
                            onClick={() => jump(i)}
                        />
                    ))}
                </div>
                <div className="slider__arrows">
                    <button
                        type="button"
                        className="slider__arrow"
                        aria-label="Previous"
                        disabled={index === 0}
                        onClick={() => jump(index - 1)}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="slider__arrow"
                        aria-label="Next"
                        disabled={index === maxIndex}
                        onClick={() => jump(index + 1)}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
}
