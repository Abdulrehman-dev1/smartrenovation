import Reveals from '@/Components/Public/Reveals';
import SiteFooter from '@/Components/Public/SiteFooter';
import SiteHeader from '@/Components/Public/SiteHeader';
import WaFloat from '@/Components/Public/WaFloat';
import { useFlashNotifications } from '@/hooks/useFlashNotifications';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

type Props = PropsWithChildren<{
    title?: string;
    description?: string;
    /** When true, skip default header/footer chrome (rare). */
    bare?: boolean;
}>;

export default function PublicLayout({ children, title, description, bare = false }: Props) {
    useFlashNotifications();

    return (
        <>
            {(title || description) && (
                <Head>
                    {title ? <title>{title}</title> : null}
                    {description ? <meta head-key="description" name="description" content={description} /> : null}
                </Head>
            )}
            <Toaster richColors position="top-right" />
            <div className="smart-site">
                {!bare && <SiteHeader />}
                {children}
                {!bare && <SiteFooter />}
                {!bare && <WaFloat />}
                {!bare && <Reveals />}
            </div>
        </>
    );
}
