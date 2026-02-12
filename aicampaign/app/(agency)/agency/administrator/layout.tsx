import AdminShell from "./_ui/AdminShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <AdminShell>
        <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
      </AdminShell>
    </div>
  );
}
