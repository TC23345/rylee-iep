export function DbNotice() {
  return (
    <div
      role="alert"
      className="rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
    >
      The case log could not reach the database. Nothing is lost, but new rows will not save
      until the connection is back.
    </div>
  );
}
