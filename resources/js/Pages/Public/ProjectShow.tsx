import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

type Media = { original: string; large?: string | null; card?: string | null };
type Project = {
    name: string;
    studio?: string | null;
    subtitle?: string | null;
    description?: string | null;
    location?: string | null;
    type?: string | null;
    cover?: Media | null;
    gallery?: Media[];
};

type Seo = {
    title: string;
    description?: string | null;
    canonical: string;
    jsonLd: string;
};

export default function ProjectShow({
    project,
    seo,
    previewDraft = false,
}: {
    project: Project;
    seo: Seo;
    previewDraft?: boolean;
}) {
    return (
        <PublicLayout>
            <Head title={seo.title}>
                {seo.description && <meta head-key="description" name="description" content={seo.description} />}
                <link head-key="canonical" rel="canonical" href={seo.canonical} />
                {previewDraft && <meta head-key="robots" name="robots" content="noindex,nofollow" />}
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: seo.jsonLd }}
                />
            </Head>
            {previewDraft && (
                <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Draft preview — only visible to logged-in admins. Publish the project to make it public.
                </div>
            )}
            <article>
                <p className="text-sm uppercase tracking-widest text-stone-500">Project</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight">{project.name}</h1>
                {project.subtitle && <p className="mt-3 text-lg text-stone-600">{project.subtitle}</p>}
                <p className="mt-2 text-sm text-stone-500">
                    {[project.location, project.type, project.studio].filter(Boolean).join(' · ')}
                </p>
                {(project.cover?.large || project.cover?.original) && (
                    <img
                        src={project.cover.large || project.cover.original}
                        alt={project.name}
                        className="mt-8 w-full object-cover"
                    />
                )}
                {project.description && (
                    <div
                        className="rich-content mt-8 max-w-3xl text-stone-700"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                )}
                {project.gallery && project.gallery.length > 0 && (
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        {project.gallery.map((image, index) => (
                            <img
                                key={index}
                                src={image.large || image.original}
                                alt=""
                                className="w-full object-cover"
                            />
                        ))}
                    </div>
                )}
            </article>
        </PublicLayout>
    );
}
