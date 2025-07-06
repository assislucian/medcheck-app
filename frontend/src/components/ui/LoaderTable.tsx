export default function LoaderTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-10 w-full rounded-lg bg-ink-low/10 animate-pulse" />
      ))}
    </div>
  );
}
