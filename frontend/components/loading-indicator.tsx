export function LoadingIndicator({ label }: { label: string }) {
  return (
    <div className="loading-row" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}
