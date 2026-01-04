export function Container({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
