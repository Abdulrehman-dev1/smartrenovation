import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';

type Props = {
    source?: string;
};

export default function ContactForm({ source = 'home' }: Props) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        if (fd.get('botcheck')) return;

        const name = String(fd.get('name') || '').trim();
        const email = String(fd.get('email') || '').trim();
        const phone = String(fd.get('phone') || '').trim();
        const message = String(fd.get('message') || '').trim();
        if (!name || !email || !message) return;

        setStatus('sending');
        router.post(
            '/contact',
            { name, email, phone: phone || null, message, source },
            {
                onError: () => setStatus('error'),
                onFinish: () => setStatus((s) => (s === 'error' ? 'error' : 'idle')),
            },
        );
    };

    return (
        <form className="contact-form reveal in" data-delay="1" onSubmit={onSubmit}>
            <label className="contact-form__hp" aria-hidden="true">
                <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="contact-form__row">
                <input type="text" name="name" placeholder="Your name" required autoComplete="name" />
                <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    required
                    autoComplete="email"
                />
            </div>
            <input type="tel" name="phone" placeholder="Phone (optional)" autoComplete="tel" />
            <textarea
                name="message"
                rows={4}
                placeholder="Tell us about your project, space and timeline…"
                required
            />
            <div className="contact-form__foot et_contact_bottom_container">
                <button
                    type="submit"
                    name="et_builder_submit_button"
                    className="btn btn--solid et_pb_contact_submit et_pb_button"
                    disabled={status === 'sending'}
                >
                    {status === 'sending' ? 'Sending…' : 'Send Enquiry'}
                </button>
                {status === 'error' && (
                    <span className="contact-form__err">
                        Something went wrong — please email us directly.
                    </span>
                )}
            </div>
        </form>
    );
}
