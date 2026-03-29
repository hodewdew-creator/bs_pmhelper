export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors
      placeholder:text-slate-400
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400
      disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
