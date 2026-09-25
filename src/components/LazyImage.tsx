import { useState } from "react";
import "./LazyImage.css";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * An image that loads lazily and fades in once it has actually decoded, the way
 * Upstatement's lazy-img does. The frame around it (aspect ratio, radius) is the
 * caller's job — this only fills it.
 */
export function LazyImage({ src, alt, className = "" }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`lazy-image${loaded ? " lazy-image--loaded" : ""} ${className}`}
      onLoad={() => setLoaded(true)}
      // A cached image can finish before React attaches onLoad, so check on mount too.
      ref={(img) => {
        if (img?.complete && img.naturalWidth > 0) setLoaded(true);
      }}
    />
  );
}
