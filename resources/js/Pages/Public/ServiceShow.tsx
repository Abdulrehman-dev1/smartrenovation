import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
};

type Service = {
    title: string;
    subtitle?: string | null;
    short_description?: string | null;
    description?: string | null;
    meta_description?: string | null;
    cover?: ImageItem | null;
    gallery?: ImageItem[];
};

export default function ServiceShow({ service }: { service: Service; seoJsonLd?: string }) {
    return (
        <PublicLayout>
            <Head title={service.title} />
            <article>
                <p className="text-sm uppercase tracking-widest text-stone-500">Service</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight">{service.title}</h1>
                {service.subtitle && <p className="mt-2 text-lg text-stone-600">{service.subtitle}</p>}
                {service.short_description && (
                    <p className="mt-4 max-w-2xl text-stone-600">{service.short_description}</p>
                )}
                {service.cover?.url && (
                    <img src={service.cover.url} alt="" className="mt-8 w-full object-cover" />
                )}
                {service.description && (
                    <div
                        className="rich-content mt-8 max-w-none text-stone-700"
                        dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                )}
                {service.gallery && service.gallery.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {service.gallery.map((image) => (
                            <img key={image.path} src={image.url} alt="" className="w-full object-cover" />
                        ))}
                    </div>
                )}
            </article>
        </PublicLayout>
    );
}
