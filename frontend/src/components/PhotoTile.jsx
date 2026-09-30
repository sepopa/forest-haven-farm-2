// Shows a real photo/video when `src`/`videoSrc` is given, otherwise falls
// back to a gradient placeholder tile (used for menu items without a photo
// yet — see README.md "Replacing placeholder images").
export default function PhotoTile({
  tag,
  label,
  icon: Icon,
  gradient,
  src,
  alt = "",
  videoSrc,
  poster,
  className = "",
  style = {},
}) {
  return (
    <div className={`photo-tile ${className}`} style={{ "--tile-bg": gradient, ...style }}>
      {videoSrc ? (
        <video className="tile-media" src={videoSrc} poster={poster} autoPlay muted loop playsInline />
      ) : src ? (
        <img className="tile-media" src={src} alt={alt} />
      ) : null}
      {tag && <span className="tile-tag">{tag}</span>}
      {!src && !videoSrc && Icon && <Icon className="tile-icon" />}
      {label && <span className="tile-label">{label}</span>}
    </div>
  );
}
