import BrandLogo from '@/Components/BrandLogo';
import Dropdown from '@/Components/Dropdown';
import { useFlashNotifications } from '@/hooks/useFlashNotifications';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Toaster } from 'sonner';

const navItems = [
    { href: '/admin', label: 'Dashboard', match: 'exact' as const },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/articles', label: 'Articles' },
    { href: '/admin/press', label: 'Press' },
    { href: '/admin/awards', label: 'Awards' },
    { href: '/admin/leads', label: 'Leads' },
    { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    useFlashNotifications();
    const user = usePage().props.auth.user;
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string, match?: 'exact') => {
        if (match === 'exact') return path === href || path === `${href}/`;
        return path === href || path.startsWith(`${href}/`);
    };

    const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
            {navItems.map((item) => {
                const active = isActive(item.href, item.match);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                            active
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="admin-app min-h-screen bg-slate-100">
            <Toaster richColors position="top-right" />

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
                    <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                        <BrandLogo size={36} />
                        <div className="leading-tight">
                            <div className="text-sm font-semibold text-slate-900">Smart Renovation</div>
                            <div className="text-xs text-slate-500">Admin</div>
                        </div>
                    </Link>
                </div>

                <NavItems onNavigate={() => setMobileOpen(false)} />

                <div className="border-t border-slate-200 p-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        View site
                    </Link>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 lg:hidden"
                            onClick={() => setMobileOpen(true)}
                        >
                            Menu
                        </button>
                        <div className="hidden items-center gap-2 sm:flex lg:hidden">
                            <BrandLogo size={28} />
                            <span className="text-sm font-semibold text-slate-800">Smart Renovation</span>
                        </div>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                {user?.name ?? 'Account'}
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href="/profile">Profile</Dropdown.Link>
                            <Dropdown.Link href="/" target="_blank">
                                View site
                            </Dropdown.Link>
                            <Dropdown.Link href="/logout" method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                {header && (
                    <div className="border-b border-slate-200 bg-white">
                        <div className="px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                    </div>
                )}

                <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
