import SectionHeader from "../_ui/SectionHeader";
import { notices } from "../_data/notices";

export default function Page() {
  return (
    <div>
      <SectionHeader title="Paziņojumi" backHref="/agency/manager" />
      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/90">{n.title}</div>
            <div className="mt-1 text-sm text-white/70">{n.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
