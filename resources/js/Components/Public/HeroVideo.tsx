import { useEffect, useRef } from 'react';

export default function HeroVideo() {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        v.muted = true;
        v.defaultMuted = true;
        const tryPlay = () => {
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
        };
        tryPlay();
        v.addEventListener('loadeddata', tryPlay, { once: true });
        return () => v.removeEventListener('loadeddata', tryPlay);
    }, []);

    return (
        <video
            ref={ref}
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/video/hero1-img.png"
        >
            <source src="/assets/video/hero1.mp4" type="video/mp4" />
        </video>
    );
}
