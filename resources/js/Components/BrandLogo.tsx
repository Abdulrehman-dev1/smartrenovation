import { ImgHTMLAttributes } from 'react';

type BrandLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
    size?: number;
};

export default function BrandLogo({
    size = 36,
    className = '',
    alt = 'Smart Renovation',
    ...props
}: BrandLogoProps) {
    return (
        <img
            src="/assets/img/brand/favicon.png"
            width={size}
            height={size}
            alt={alt}
            className={`rounded-full object-contain ${className}`}
            {...props}
        />
    );
}
