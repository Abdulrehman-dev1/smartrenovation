import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

type Service = {
    id: number;
    slug: string;
    title: string;
    subtitle?: string | null;
    short_description?: string | null;
    cover_url?: string | null;
};

export default function Services({ services }: { services: Service[] }) {
    return (
        <PublicLayout title="Services">
            <Head title="Services" />
            <div className="space-y-6">
                {services.map((service) => (
                    <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        className="flex gap-4 border-b border-stone-200 pb-6"
                    >
                        {service.cover_url && (
                            <img
                                src={service.cover_url}
                                alt=""
                                className="h-24 w-32 shrink-0 rounded object-cover"
                            />
                        )}
                        <div className="min-w-0">
                            <h2 className="text-2xl font-semibold">{service.title}</h2>
                            {service.subtitle && (
                                <p className="mt-1 text-stone-600">{service.subtitle}</p>
                            )}
                            {service.short_description && (
                                <p className="mt-2 text-sm text-stone-500 line-clamp-2">
                                    {service.short_description}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </PublicLayout>
    );
}
