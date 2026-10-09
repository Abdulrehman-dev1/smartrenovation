import { usePage } from '@inertiajs/react';

export type SiteContact = {
    phone: string;
    callLink: string;
    whatsapp: string;
    whatsappLink: string;
    email: string;
    address: string;
};

const defaults: SiteContact = {
    phone: '+971 56 790 7213',
    callLink: 'tel:+971567907213',
    whatsapp: '971567907213',
    whatsappLink: 'https://wa.me/971567907213',
    email: 'info@smartrenovation.ae',
    address: '',
};

export function useSiteContact(): SiteContact {
    const page = usePage<{ siteContact?: SiteContact }>();
    return { ...defaults, ...page.props.siteContact };
}
