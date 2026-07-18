"use client";

import Link from "next/link";
import { OrtusLogo, type OrtusLogoSize, type OrtusLogoVariant } from "./OrtusLogo";

interface OrtusBrandProps {
  variant?: OrtusLogoVariant;
  size?: OrtusLogoSize;
  showWordmark?: boolean;
  showDescriptor?: boolean;
  href?: string;
  label?: string;
  className?: string;
}

export function OrtusBrand({
  variant = "sharp",
  size = "header",
  showWordmark = true,
  showDescriptor = false,
  href,
  label = "ORTUS home",
  className = ""
}: OrtusBrandProps) {
  const content = (
    <>
      <OrtusLogo variant={variant} size={size} decorative label="ORTUS" />
      {showWordmark ? (
        <span className="ortus-brand__text">
          <span className="ortus-brand__wordmark">ORTUS</span>
          {showDescriptor ? <span className="ortus-brand__descriptor">Systems Sandbox</span> : null}
        </span>
      ) : null}
    </>
  );
  const classNames = `ortus-brand ortus-brand--${size} ${showWordmark ? "ortus-brand--wordmark" : "ortus-brand--mark-only"} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classNames} aria-label={label} data-brand-lockup={showWordmark ? "canonical" : "compact"}>
        {content}
      </Link>
    );
  }

  return (
    <span className={classNames} aria-label={showWordmark ? undefined : label} data-brand-lockup={showWordmark ? "canonical" : "compact"}>
      {content}
    </span>
  );
}
