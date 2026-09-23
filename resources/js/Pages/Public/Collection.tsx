import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

type Item = {
    id: number;
    title?: string | null;
    room?: string | null;
    tags?: string[] | null;
    cover?: { card?: string | null; original: string } | null;
};

export default function Collection({ items }: { items: Item[] }) {
    return (
        <PublicLayout title="Collection">
            <Head title="Collection" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div key={item.id}>
                        <div className="aspect-square bg-stone-200">
                            {(item.cover?.card || item.cover?.original) && (
                                <img
                                    src={item.cover.card || item.cover.original}
                                    alt={item.title || ''}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <h2 className="mt-3 font-medium">{item.title || 'Untitled'}</h2>
                        {item.room && <p className="text-sm text-stone-500">{item.room}</p>}
                    </div>
                ))}
            </div>
        </PublicLayout>
    );
}
