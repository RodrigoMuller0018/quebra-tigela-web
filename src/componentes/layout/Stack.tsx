import type { ReactNode } from "react";

type Spacing = "small" | "medium" | "large";
type Align = "start" | "center" | "end" | "stretch";

interface StackProps {
  children: ReactNode;
  spacing?: Spacing;
  align?: Align;
  className?: string;
}

export function Stack({
  children,
  spacing = "medium",
  align = "stretch",
  className = ""
}: StackProps) {
  const stackClasses = [
    "stack",
    `stack--spacing-${spacing}`,
    `stack--align-${align}`,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
}