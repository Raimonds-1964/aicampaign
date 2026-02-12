export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-4xl font-extrabold">
        How it works
      </h1>

      <ol className="list-decimal pl-6 space-y-2 text-lg">
        <li>Connect your Google Ads account</li>
        <li>AI analyzes your campaign performance</li>
        <li>You receive optimization recommendations</li>
        <li>Review and approve suggested changes</li>
        <li>Approved changes are applied to Google Ads</li>
      </ol>

      <p className="mt-8 font-semibold">
        All optimizations require user approval.  
        No automatic changes are performed without consent.
      </p>
    </main>
  );
}
