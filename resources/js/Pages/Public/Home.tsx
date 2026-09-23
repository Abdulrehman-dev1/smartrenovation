import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

type Project = {
    id: number;
    slug: string;
    name: string;
    subtitle?: string | null;
    cover?: { card?: string | null; large?: string | null; original: string } | null;
};
type Service = { id: number; slug: string; title: string; subtitle?: string | null };
type Article = { id: number; slug: string; title: string; excerpt?: string | null };

export default function Home({
    featuredProjects,
    services,
    articles,
}: {
    featuredProjects: Project[];
    services: Service[];
    articles: Article[];
    seoJsonLd?: string;
}) {
    return (
        <PublicLayout>
            <Head title="Home" />
            <section className="mb-16">
                <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Smart Renovation</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Thoughtful renovations for modern living
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-stone-600">
                    Residential and commercial spaces crafted with clarity, material honesty, and lasting detail.
                </p>
                <div className="mt-8 flex gap-4">
                    <Link href="/works" className="rounded-md bg-stone-900 px-5 py-2.5 text-sm text-white">
                        View works
                    </Link>
                    <Link href="/contact" className="rounded-md border border-stone-300 px-5 py-2.5 text-sm">
                        Contact
                    </Link>
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-2xl font-semibold">Selected works</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredProjects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.slug}`} className="block">
                            <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                                {(project.cover?.card || project.cover?.large || project.cover?.original) && (
                                    <img
                                        src={project.cover.card || project.cover.large || project.cover.original}
                                        alt={project.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <h3 className="mt-3 font-medium">{project.name}</h3>
                            {project.subtitle && <p className="text-sm text-stone-500">{project.subtitle}</p>}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-2xl font-semibold">Services</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {services.map((service) => (
                        <Link key={service.id} href={`/services/${service.slug}`} className="border-b border-stone-200 py-4">
                            <div className="font-medium">{service.title}</div>
                            {service.subtitle && <div className="text-sm text-stone-500">{service.subtitle}</div>}
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold">Media</h2>
                <div className="mt-6 space-y-4">
                    {articles.map((article) => (
                        <Link key={article.id} href={`/media/${article.slug}`} className="block">
                            <h3 className="font-medium">{article.title}</h3>
                            {article.excerpt && <p className="text-sm text-stone-500">{article.excerpt}</p>}
                        </Link>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
