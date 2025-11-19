import type { ReactNode } from "react";

type Size = "small" | "medium" | "large" | "full";

interface ContainerProps {
  children: ReactNode;
  size?: Size;
  centered?: boolean;
  className?: string;
}

export function Container({
  children,
  size = "medium",
  centered = true,
  className = ""
}: ContainerProps) {
  const containerClasses = [
    "container",
    `container--size-${size}`,
    centered ? "container--centered" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}