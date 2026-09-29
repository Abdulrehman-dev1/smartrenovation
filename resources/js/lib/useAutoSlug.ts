import { slugify } from '@/lib/slugify';
import { useRef } from 'react';

type FormBag = Record<string, unknown>;

type Options = {
    /** Form field that drives the slug (title or name). */
    titleKey?: 'title' | 'name';
    /** Seed from an existing record so Edit keeps syncing until slug is customized. */
    initialTitle?: string;
    initialSlug?: string;
};

/**
 * Keeps `slug` in sync with a title/name field until the user edits slug manually.
 * Works for typing and paste (onChange receives the full pasted value).
 */
export function useAutoSlug(
    // Inertia setData is overloaded; keep this permissive for form pages.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData: (...args: any[]) => void,
    options: Options | 'title' | 'name' = 'title',
) {
    const opts: Options =
        typeof options === 'string' ? { titleKey: options } : options;
    const titleKey = opts.titleKey ?? 'title';
    const initialAuto = slugify(opts.initialTitle ?? '');

    const slugTouched = useRef(
        Boolean(opts.initialSlug) && opts.initialSlug !== initialAuto,
    );
    const lastAutoSlug = useRef(initialAuto);

    const onTitleChange = (value: string) => {
        const nextSlug = slugify(value);
        setData((current: FormBag) => {
            const shouldSync =
                !slugTouched.current ||
                !String(current.slug ?? '').trim() ||
                current.slug === lastAutoSlug.current;

            if (shouldSync) {
                lastAutoSlug.current = nextSlug;
                slugTouched.current = false;
                return { ...current, [titleKey]: value, slug: nextSlug };
            }

            return { ...current, [titleKey]: value };
        });
    };

    const onSlugChange = (value: string) => {
        slugTouched.current = true;
        setData('slug', value);
    };

    return { onTitleChange, onSlugChange };
}
