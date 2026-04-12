export function Toast({ text, kind = 'success', topClass = 'top-4' }) {
  if (!text) return null;

  const classes =
    kind === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-white text-leaf-forest';

  return (
    <div className={`pointer-events-none fixed inset-x-0 ${topClass} z-50 flex justify-center px-4`}>
      <div className={`pointer-events-auto w-full max-w-lg rounded-3xl border px-5 py-4 text-base shadow-card ${classes}`}>
        {text}
      </div>
    </div>
  );
}
