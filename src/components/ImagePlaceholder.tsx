import "./ImagePlaceholder.css";

type ImagePlaceholderProps = {
  label: string;
  aspectRatio?: string;
  className?: string;
};

/**
 * Stand-in for real content images. Swap for an <img> (or a background image)
 * once the real asset exists — every usage names what belongs here.
 */
export function ImagePlaceholder({ label, aspectRatio = "1 / 1", className = "" }: ImagePlaceholderProps) {
  return (
    <div className={`image-placeholder ${className}`} style={{ aspectRatio }} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}
