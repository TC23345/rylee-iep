export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold leading-none tabular-nums">{value}</div>
      {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
