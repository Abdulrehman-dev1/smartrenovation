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
            className={`shrink-0 rounded-full object-contain ${className}`}
            style={{ width: size, height: size, maxWidth: size, maxHeight: size, objectFit: 'contain' }}
            {...props}
        />
    );
}
