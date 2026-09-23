import BrandLogo from '@/Components/BrandLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { useFlashNotifications } from '@/hooks/useFlashNotifications';
import { Toaster } from 'sonner';

const links = [
    { href: '/', label: 'Home' },
    { href: '/works', label: 'Works' },
    { href: '/services', label: 'Services' },
    { href: '/media', label: 'Media' },
    { href: '/collection', label: 'Collection' },
    { href: '/about', label: 'About' },
    { href: '/residential', label: 'Residential' },
    { href: '/contact', label: 'Contact' },
];

export default function PublicLayout({
    children,
    title,
}: PropsWithChildren<{ title?: ReactNode }>) {
    useFlashNotifications();

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900">
            <Toaster richColors position="top-right" />
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <BrandLogo size={40} />
                        <span className="text-lg font-semibold tracking-tight">Smart Renovation</span>
                    </Link>
                    <nav className="flex flex-wrap gap-4 text-sm text-stone-600">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-stone-900">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>
            {title && (
                <div className="border-b border-stone-200 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-10">
                        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                    </div>
                </div>
            )}
            <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
            <footer className="border-t border-stone-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-8 text-sm text-stone-500">
                    <BrandLogo size={24} />
                    <span>© {new Date().getFullYear()} Smart Renovation</span>
                </div>
            </footer>
        </div>
    );
}
