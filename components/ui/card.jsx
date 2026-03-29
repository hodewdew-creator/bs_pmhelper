export function Card({ children, className = "" }) {
  return <div className={`border bg-white ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
