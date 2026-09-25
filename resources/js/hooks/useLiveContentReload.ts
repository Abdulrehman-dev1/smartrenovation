import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Keep public pages in sync with CMS changes without a manual refresh.
 * - Reloads props when the tab becomes visible again (e.g. after editing in Admin)
 * - Light poll while the tab is open
 * Skips reload while the user is typing in a form field.
 */
export function useLiveContentReload(intervalMs = 45000) {
    const busy = useRef(false);

    useEffect(() => {
        const canReload = () => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                return false;
            }
            if (document.visibilityState !== 'visible') {
                return false;
            }
            return !busy.current;
        };

        const reload = () => {
            if (!canReload()) return;
            busy.current = true;
            router.reload({
                preserveScroll: true,
                onFinish: () => {
                    busy.current = false;
                },
            });
        };

        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                reload();
            }
        };

        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', reload);

        const timer = window.setInterval(reload, intervalMs);

        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', reload);
            window.clearInterval(timer);
        };
    }, [intervalMs]);
}
