export function BeforeAfter({ original, revised }: { original: string; revised: string }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Before & After Comparison</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="text-red-800 font-semibold text-sm uppercase tracking-wide mb-3">Original</div>
          <pre className="whitespace-pre-wrap text-sm text-red-900 leading-relaxed font-normal">{original}</pre>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <div className="text-green-800 font-semibold text-sm uppercase tracking-wide mb-3">Revised</div>
          <pre className="whitespace-pre-wrap text-sm text-green-900 leading-relaxed font-normal">{revised}</pre>
        </div>
      </div>
    </div>
  );
} 