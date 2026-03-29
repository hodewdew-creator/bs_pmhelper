export function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-slate-900 text-white shadow hover:bg-slate-800 border border-slate-900",
    outline: "bg-white text-slate-800 border border-slate-300 shadow-sm hover:bg-slate-50",
    ghost: "bg-transparent text-slate-800 hover:bg-slate-100",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-10 px-5 text-base",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
