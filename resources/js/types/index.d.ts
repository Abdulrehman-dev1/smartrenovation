export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type SiteContact = {
    phone: string;
    callLink: string;
    whatsapp: string;
    whatsappLink: string;
    email: string;
    address: string;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
    };
    siteContact?: SiteContact;
};
