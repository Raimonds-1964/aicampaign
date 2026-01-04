import React from "react";

export function Container({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        paddingLeft: "clamp(16px, 4vw, 32px)",
        paddingRight: "clamp(16px, 4vw, 32px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
