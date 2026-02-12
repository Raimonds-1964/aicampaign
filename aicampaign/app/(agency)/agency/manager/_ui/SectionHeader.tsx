import Link from "next/link";

export default function SectionHeader({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {backHref ? (
        <Link
          href={backHref}
          className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10"
          aria-label="Atpakaļ"
        >
          ←
        </Link>
      ) : null}
      <div className="text-lg font-semibold">{title}</div>
    </div>
  );
}
