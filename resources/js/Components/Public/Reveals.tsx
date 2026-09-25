import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

/** LP-style reveals: fade-up (.reveal) + image wipe (.reveal-img). Re-runs on navigation. */
export default function Reveals() {
    const { url } = usePage();

    useEffect(() => {
        const showEl = (el: Element) => {
            el.classList.add('in');
            el.querySelectorAll?.('.reveal-img:not(.in)').forEach((c) => c.classList.add('in'));
        };

        const els = document.querySelectorAll('.reveal:not(.in), .reveal-img:not(.in)');
        if (!('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('in'));
            return;
        }

        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        showEl(e.target);
                        io.unobserve(e.target);
                    }
                }),
            { threshold: 0, rootMargin: '0px 0px -8% 0px' },
        );

        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [url]);

    return null;
}
