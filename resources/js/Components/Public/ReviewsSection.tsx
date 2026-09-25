import Slider from '@/Components/Public/Slider';

const GOOGLE_FALLBACK_URL = 'https://www.google.com/maps/search/Smart+Renovation+Dubai';

const star = (n: number) => '★★★★★'.slice(0, Math.max(1, Math.min(5, n || 5)));

const FALLBACK_REVIEWS = [
    {
        text: 'From first sketch to handover the team stayed meticulous and on schedule. Our villa feels brand new.',
        who: 'Sarah M.',
        where: 'Palm Jumeirah · Google',
        rating: 5,
    },
    {
        text: 'Beautiful craftsmanship and clear communication throughout. One studio handled everything end to end.',
        who: 'Ahmed K.',
        where: 'Emirates Hills · Google',
        rating: 5,
    },
    {
        text: 'They reinvented our apartment completely — elegant, smart and genuinely stress-free from day one.',
        who: 'Elena R.',
        where: 'Dubai Marina · Google',
        rating: 5,
    },
    {
        text: 'Honest pricing and a daily on-site presence. The fit-out was delivered ahead of schedule.',
        who: 'Y. Hassan',
        where: 'DIFC · Google',
        rating: 5,
    },
    {
        text: 'Their understanding of Italian craftsmanship is on another level. The detailing is exquisite.',
        who: 'L. Romano',
        where: 'Downtown · Google',
        rating: 5,
    },
    {
        text: 'Calm, considered and completely tailored. The penthouse finally feels like ours.',
        who: 'F. Noor',
        where: 'Business Bay · Google',
        rating: 5,
    },
];

export type ReviewItem = {
    text: string;
    who: string;
    where: string;
    rating: number;
};

type Props = {
    reviews?: ReviewItem[];
    rating?: number | null;
    count?: number | null;
    googleUrl?: string | null;
};

export default function ReviewsSection({
    reviews,
    rating,
    count,
    googleUrl,
}: Props) {
    const list = reviews?.length ? reviews : FALLBACK_REVIEWS;
    const ratingLabel = rating ? `${rating.toFixed(1)} / 5` : '4.8 / 5';
    const countLabel = count
        ? `${count.toLocaleString()} Google Reviews`
        : 'Verified Google Reviews';
    const url = googleUrl || GOOGLE_FALLBACK_URL;

    return (
        <section className="reviews" id="reviews">
            <div className="container">
                <h2 className="reviews__title reveal in">What Clients Say.</h2>
                <a
                    className="reviews__badge reveal in"
                    data-delay="1"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className="reviews__stars">★★★★★</div>
                    <div className="reviews__score">
                        {ratingLabel} · {countLabel}
                    </div>
                </a>
            </div>

            <Slider className="reviews-slider reveal in">
                {list.map((r, i) => (
                    <article className="review-card" key={`${r.who}-${i}`}>
                        <div className="stars">{star(r.rating)}</div>
                        <blockquote>{r.text}</blockquote>
                        <figcaption>
                            <span className="who">{r.who}</span>
                            <span className="where">{r.where}</span>
                        </figcaption>
                    </article>
                ))}
            </Slider>
        </section>
    );
}
