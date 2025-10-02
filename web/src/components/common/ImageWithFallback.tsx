import React, { useState, useEffect } from 'react';

export const ImageWithFallback: React.FC<{ src?: string; alt: string; fallbackText: string; className?: string }> = ({ src, alt, fallbackText, ...props }) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [src]);
    if (error || !src) {
        return <div className="image-fallback-container"><span>{fallbackText}</span></div>;
    }
    return <img src={src} alt={alt} onError={() => setError(true)} {...props} />;
};