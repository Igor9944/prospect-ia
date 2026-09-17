type Variant = "light" | "dark";

export function Icon({ src, size = 20, alt = "" }: { src: string; size?: number; alt?: string }) {
  return (
    <span className="icon" style={{ width: size, height: size, flexBasis: size }} aria-hidden={!alt}>
      <img className="icon-img" src={src} width={size} height={size} alt={alt} />
    </span>
  );
}

export function LogoMark({
  size = 36,
  variant = "dark",
}: {
  size?: number;
  variant?: Variant;
}) {
  const src = variant === "light" ? "/assets/logo-mark-light.png" : "/assets/logo-mark-dark.png";
  return (
    <img
      className={`logo-mark logo-mark-${variant}`}
      src={src}
      width={size}
      height={size}
      alt="ProspectAI"
      style={{ width: size, height: size }}
    />
  );
}

export function LogoBrand({
  variant = "dark",
  markSize = 36,
}: {
  variant?: Variant;
  markSize?: number;
}) {
  return (
    <span className={`brand-lockup brand-lockup-${variant}`}>
      <LogoMark size={markSize} variant={variant} />
      <span className="brand-wordmark">
        Prospect<span>AI</span>
      </span>
    </span>
  );
}

export function LogoWide({
  height = 88,
  variant = "light",
}: {
  height?: number;
  width?: number;
  variant?: Variant;
}) {
  const src = variant === "light" ? "/assets/logo-light.png" : "/assets/logo-dark.png";
  return (
    <img
      className="logo-wide"
      src={src}
      height={height}
      alt="ProspectAI — Leadership intelligent de la prospection B2B"
      style={{ height, width: "auto" }}
    />
  );
}

export function Avatar({ size = 40 }: { size?: number }) {
  return (
    <img
      className="avatar"
      src="/assets/avatar.png"
      width={size}
      height={size}
      alt="Jean-Marc Alix"
      style={{ width: size, height: size }}
    />
  );
}
