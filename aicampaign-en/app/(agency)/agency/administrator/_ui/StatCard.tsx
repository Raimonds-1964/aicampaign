export default function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {hint ? <div className="mt-2 text-sm text-white/60">{hint}</div> : null}
    </div>
  );
}
