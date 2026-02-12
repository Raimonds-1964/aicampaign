export default function EasyLayout({ children }: { children: React.ReactNode }) {
  // The Easy zone has no public TopBar/Footer and no dashboard — only the builder flow.
  return <>{children}</>;
}
