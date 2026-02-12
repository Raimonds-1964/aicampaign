import type { CheckStatus } from "../../_data/accounts";

const badge = (s: CheckStatus) =>
  s === "ok"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : s === "warning"
    ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
    : "bg-red-500/15 text-red-300 border-red-500/30";

const label = (s: CheckStatus) =>
  s === "ok" ? "OK" : s === "warning" ? "Needs improvement" : "Critical";

export default function BudgetStatus({
  status,
  text,
}: {
  status: CheckStatus;
  text: string;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/90">
            Budget status
          </div>
          <div className="mt-1 text-sm text-white/70">{text}</div>
        </div>

        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${badge(
            status
          )}`}
        >
          {label(status)}
        </span>
      </div>
    </div>
  );
}
