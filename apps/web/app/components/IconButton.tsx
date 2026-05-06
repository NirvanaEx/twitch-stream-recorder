"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SpinnerIcon } from "./icons";

type CommonProps = {
  title: string;
  className?: string;
  loading?: boolean;
  children: ReactNode;
};

type ButtonProps = CommonProps & {
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

type LinkProps = CommonProps & {
  href: string;
};

export function IconButton({
  title,
  onClick,
  disabled,
  loading,
  className = "",
  type = "button",
  children,
}: ButtonProps) {
  const cls = ["icon-btn", loading ? "is-loading" : "", className].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} title={title} disabled={disabled || loading} onClick={onClick}>
      {loading ? <SpinnerIcon /> : children}
    </button>
  );
}

export function IconLink({ title, href, className = "", loading, children }: LinkProps) {
  const cls = ["icon-btn", loading ? "is-loading" : "", className].filter(Boolean).join(" ");
  return (
    <Link href={href} className={cls} title={title}>
      {loading ? <SpinnerIcon /> : children}
    </Link>
  );
}
