// app/(agency)/agency/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-xl font-semibold">Nav piekļuves</div>
        <div className="mt-2 text-white/60">
          Šis Google konts nav piesaistīts aģentūrai kā MANAGER/ADMIN.
        </div>
      </div>
    </div>
  );
}