import SectionHeader from "./_ui/SectionHeader";

export default function Page() {
  return (
    <div>
      <SectionHeader title="Overview" />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
        Agency Manager dashboard. Start with “Accounts”.
      </div>
    </div>
  );
}
