import type { ReactNode } from "react";

type Spacing = "small" | "medium" | "large";
type Justify = "start" | "center" | "end" | "between" | "around";
type Align = "start" | "center" | "end" | "baseline";

interface ClusterProps {
  children: ReactNode;
  spacing?: Spacing;
  justify?: Justify;
  align?: Align;
  wrap?: boolean;
  className?: string;
}

export function Cluster({
  children,
  spacing = "medium",
  justify = "start",
  align = "center",
  wrap = true,
  className = ""
}: ClusterProps) {
  const clusterClasses = [
    "cluster",
    `cluster--spacing-${spacing}`,
    `cluster--justify-${justify}`,
    `cluster--align-${align}`,
    wrap ? "cluster--wrap" : "cluster--nowrap",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={clusterClasses}>
      {children}
    </div>
  );
}