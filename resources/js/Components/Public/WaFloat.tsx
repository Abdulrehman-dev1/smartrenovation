export const CALL_LINK = 'tel:+971567907213';
export const CALL_DISPLAY = '+971 56 790 7213';

export const WA_LINK = 'https://wa.me/971567907213';
export const WA_DISPLAY = '+971 56 790 7213';

/** GTM whatsapp_click expects Click Classes to contain joinchat__button */
export const WA_TRACK_CLASS = 'joinchat__button';

export function WaIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-1.7-.8-2.7-1.5-3.8-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.6-1.5-.8-2.1-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.9-.6 3.1.6 1.6 1.7 3 3.2 4.1 2.2 1.6 3.6 1.7 4.5 1.6.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.5-.3z" />
            <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8L7 20.5A10 10 0 1 0 12 2zm0 18.2c-1.5 0-2.9-.4-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
        </svg>
    );
}

export function PhoneIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.2z" />
        </svg>
    );
}

export default function WaFloat() {
    return (
        <>
            <a className="call-float" href={CALL_LINK} aria-label="Call us">
                <PhoneIcon />
            </a>
            <a
                className={`wa-float ${WA_TRACK_CLASS}`}
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp us"
                style={{ color: '#fff' }}
            >
                <WaIcon />
            </a>
        </>
    );
}
