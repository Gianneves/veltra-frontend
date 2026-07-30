"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-sora text-3xl font-bold text-on-surface tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="font-geist text-base text-on-surface-variant mt-1">{subtitle}</p>
      )}
    </header>
  );
}
