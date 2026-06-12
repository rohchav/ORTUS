"use client";

export type OrtusLogoVariant = "sharp" | "soft";
export type OrtusLogoSize = "compact" | "header" | "hero";

interface OrtusLogoProps {
  variant?: OrtusLogoVariant;
  size?: OrtusLogoSize;
  decorative?: boolean;
  label?: string;
  className?: string;
}

const logoAssetByVariant: Record<OrtusLogoVariant, { src: string; width: number; height: number }> = {
  sharp: {
    src: "/branding/ortus-mark-sharp.png",
    width: 451,
    height: 442
  },
  soft: {
    src: "/branding/ortus-mark-soft.png",
    width: 465,
    height: 462
  }
};

export function OrtusLogo({ variant = "sharp", size = "header", decorative = false, label = "ORTUS", className = "" }: OrtusLogoProps) {
  const asset = logoAssetByVariant[variant];
  return (
    <img
      className={`ortus-logo ortus-logo--${variant} ortus-logo--${size} ${className}`}
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={decorative ? "" : label}
      aria-hidden={decorative ? "true" : undefined}
      loading="eager"
      decoding="async"
    />
  );
}

