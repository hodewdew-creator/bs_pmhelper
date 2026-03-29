export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-3 py-1 rounded-md border ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
