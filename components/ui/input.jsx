export function Input({ className = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      className={`flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm transition-colors
      placeholder:text-slate-400
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400
      disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
