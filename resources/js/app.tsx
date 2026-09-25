import '../css/app.css';
import '../css/smart/style.css';
import '../css/smart/home.css';
import '../css/smart/works.css';
import '../css/smart/project.css';
import '../css/smart/collection.css';
import '../css/smart/services.css';
import '../css/smart/article.css';
import '../css/smart/about.css';
import '../css/smart/residential-landing.css';
import '../css/smart/media.css';
import '../css/admin-safe.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Smart Renovation';

createInertiaApp({
    title: (title) => (title ? `${title}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
