import Link from "next/link";

export default function SectionHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
          aria-label="Back"
          title="Back"
        >
          ←
        </Link>
      ) : null}
      <div className="text-xl font-semibold text-white">{title}</div>
    </div>
  );
}
