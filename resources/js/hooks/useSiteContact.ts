import { usePage } from '@inertiajs/react';
import type { SiteContact } from '@/types';

export type { SiteContact };

const defaults: SiteContact = {
    phone: '+971 56 790 7213',
    callLink: 'tel:+971567907213',
    whatsapp: '971567907213',
    whatsappLink: 'https://wa.me/971567907213',
    email: 'info@smartrenovation.ae',
    address: '',
};

export function useSiteContact(): SiteContact {
    const { siteContact } = usePage().props;
    return { ...defaults, ...siteContact };
}
