import { ImagePlaceholder } from "./ImagePlaceholder";
import "./TeaseMedia.css";

type TeaseMediaProps = {
  /** Describes the image; also the placeholder's label until a real `src` exists. */
  alt: string;
  src?: string;
  /** Second image that fades in on hover. Optional — without it the tease just doesn't swap. */
  hoverSrc?: string;
};

/**
 * 16:9 image for a tease, after Upstatement's case-study teases. The hover swap is
 * triggered by the nearest `.tease` ancestor, so hovering anywhere on the tease
 * (caption included) swaps the image.
 */
export function TeaseMedia({ alt, src, hoverSrc }: TeaseMediaProps) {
  if (!src) {
    return <ImagePlaceholder label={alt} aspectRatio="16 / 9" className="tease-media" />;
  }

  return (
    <div className="tease-media">
      <img src={src} alt={alt} className="tease-media-img" />
      {/* Decorative: the first image already carries the description. */}
      {hoverSrc && <img src={hoverSrc} alt="" className="tease-media-img tease-media-img--hover" />}
    </div>
  );
}
