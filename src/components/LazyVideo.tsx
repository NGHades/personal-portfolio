import { useEffect, useRef, useState } from "react";
import "./LazyImage.css";

type LazyVideoProps = {
  src: string;
  /** Describes the video, like an image's alt. */
  label: string;
  className?: string;
};

/**
 * A muted, looping video used in place of a GIF: far smaller to download, and it
 * only decodes while on screen. Nothing loads until it nears the viewport, it
 * pauses when scrolled away, and it fades in like LazyImage once it has a frame.
 * With reduced motion it doesn't autoplay; native controls let the reader start it.
 */
export function LazyVideo({ src, label, className = "" }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // First time near the screen: attach the source so the download starts.
          if (!video.getAttribute("src")) video.src = src;
          // Autoplay can still be refused (e.g. data saver); the poster frame just stays.
          if (!reduceMotion) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, reduceMotion]);

  return (
    <video
      ref={ref}
      aria-label={label}
      muted
      loop
      playsInline
      preload="none"
      controls={reduceMotion}
      className={`lazy-image${loaded ? " lazy-image--loaded" : ""} ${className}`}
      onLoadedData={() => setLoaded(true)}
    />
  );
}
