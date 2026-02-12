import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: React.CSSProperties;
};

export function Container({ children, style }: Props) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 18px",
        scrollMarginTop: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
